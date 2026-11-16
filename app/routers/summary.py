import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import Document, DocumentChunk, DocumentSummary
from app.models.schemas import SummaryRequest, SummaryResponse
from app.config import settings
from app.core.auth import get_current_member_id
from app.core.openrouter import generate_document_summary

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/summary", tags=["Summary"])

@router.get("", response_model=Optional[SummaryResponse])
def get_existing_summary(
    document_id: str,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """
    Mengambil ringkasan yang telah tersimpan jika sudah pernah digenerate sebelumnya.
    Mengembalikan null jika dokumen belum memiliki ringkasan tersimpan.
    """
    summary_record = (
        db.query(DocumentSummary)
        .filter(DocumentSummary.document_id == document_id, DocumentSummary.user_id == member_id)
        .order_by(DocumentSummary.updated_at.desc())
        .first()
    )
    if not summary_record:
        return None

    return SummaryResponse(
        document_id=summary_record.document_id,
        executive_summary=summary_record.executive_summary,
        key_points=summary_record.key_points or [],
        glossary=summary_record.glossary or {}
    )

@router.post("", response_model=SummaryResponse)
def get_summary(
    req: SummaryRequest,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """
    Membuat ringkasan terstruktur dari dokumen atau topik tertentu.
    Jika ringkasan sudah pernah dibuat dan req.force_refresh == False, langsung mengembalikan dari database.
    """
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan.")

    # 0. Cek apakah ringkasan sudah pernah dibuat sebelumnya untuk dokumen & member ini
    existing_record = (
        db.query(DocumentSummary)
        .filter(DocumentSummary.document_id == req.document_id, DocumentSummary.user_id == member_id)
        .first()
    )
    if existing_record and not req.force_refresh:
        logger.info(f"Menggunakan ringkasan tersimpan untuk document_id={req.document_id}, member={member_id}")
        return SummaryResponse(
            document_id=existing_record.document_id,
            executive_summary=existing_record.executive_summary,
            key_points=existing_record.key_points or [],
            glossary=existing_record.glossary or {}
        )

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == req.document_id).order_by(DocumentChunk.chunk_index.asc()).all()
    if not chunks:
        raise HTTPException(status_code=400, detail="Dokumen belum memiliki konten teks.")

    # Ambil sampel representatif teks dari awal, tengah, dan akhir dokumen
    sample_texts = [c.content for c in chunks[:10]]
    combined_context = "\n\n".join(sample_texts)

    # Buat ringkasan menggunakan OpenRouter API
    summary_data = generate_document_summary(
        doc_title=doc.filename,
        combined_context=combined_context,
        topic=req.topic
    )
    executive_summary = summary_data["executive_summary"]
    key_points = summary_data["key_points"]
    glossary = summary_data["glossary"]

    # 4. Simpan atau perbarui ringkasan ke database per dokumen & member
    try:
        from datetime import datetime
        if existing_record:
            existing_record.executive_summary = executive_summary
            existing_record.key_points = key_points
            existing_record.glossary = glossary
            existing_record.topic = req.topic
            existing_record.updated_at = datetime.utcnow()
        else:
            new_record = DocumentSummary(
                document_id=req.document_id,
                user_id=member_id,
                topic=req.topic,
                executive_summary=executive_summary,
                key_points=key_points,
                glossary=glossary
            )
            db.add(new_record)
        db.commit()
        logger.info(f"Ringkasan berhasil disimpan ke database untuk doc={req.document_id}, member={member_id}")
    except Exception as e:
        logger.warning(f"Gagal menyimpan ringkasan ke database: {e}")

    return SummaryResponse(
        document_id=req.document_id,
        executive_summary=executive_summary,
        key_points=key_points,
        glossary=glossary
    )
