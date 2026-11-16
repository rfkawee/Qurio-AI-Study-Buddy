import os
import uuid
import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db, ensure_user_exists
from app.config import settings
from app.models.db_models import Document, DocumentChunk
from app.models.schemas import (
    DocumentResponse, DocumentListResponse,
    YouTubeReferenceRequest, DocumentContentResponse, DocumentPageContent
)
from app.core.document_parser import parse_and_validate_document
from app.core.youtube_parser import (
    extract_youtube_video_id, fetch_youtube_metadata, process_youtube_reference
)
from app.core.chunker import process_document_pages
from app.core.openrouter import get_embedding
from app.core.auth import get_current_member_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents"])

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".txt", ".md"}

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Unggah dan indeks berkas materi pembelajaran (PDF, Word, PPTX, TXT - maks 5 MB, tanpa batasan halaman)."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format berkas '{ext}' tidak didukung. Format yang diterima: PDF, Word (.docx), PowerPoint (.pptx), dan Catatan (.txt, .md)"
        )

    doc_id = str(uuid.uuid4())
    saved_filename = f"{doc_id}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    cache_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_content.json")

    try:
        # Simpan file sementara ke disk
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # 1. Validasi & Ekstraksi Berkas Multi-Format
        pages_data, topics, file_size_bytes, page_count, source_type = parse_and_validate_document(
            file_path, file.filename
        )

        # Simpan cache halaman untuk Content Reader panel di frontend
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(pages_data, f, ensure_ascii=False)

        # 2. Simpan Entitas Document ke DB
        ensure_user_exists(db, member_id)
        doc_entry = Document(
            id=doc_id,
            user_id=member_id,
            filename=file.filename,
            file_path=file_path,
            file_size_bytes=file_size_bytes,
            page_count=page_count,
            source_type=source_type,
            topics=topics
        )
        db.add(doc_entry)
        db.commit()

        # 3. Chunking & Simpan Embedding
        chunks_data = process_document_pages(pages_data)
        for c in chunks_data:
            emb = get_embedding(c["content"])
            chunk_entry = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=doc_id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                content=c["content"],
                embedding=emb
            )
            db.add(chunk_entry)

        db.commit()
        db.refresh(doc_entry)
        logger.info(f"Dokumen '{file.filename}' ({source_type}) berhasil diindeks: {len(chunks_data)} chunks, {page_count} halaman.")
        return doc_entry

    except HTTPException as he:
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(cache_path):
            os.remove(cache_path)
        raise he
    except Exception as e:
        logger.error(f"Gagal memproses dokumen upload: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(cache_path):
            os.remove(cache_path)
        raise HTTPException(status_code=500, detail=f"Kesalahan sistem saat memproses berkas: {str(e)}")


@router.post("/youtube", response_model=DocumentResponse)
async def add_youtube_reference(
    req: YouTubeReferenceRequest,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Menambahkan referensi video YouTube, mengekstrak transkrip teks, dan mengindeks ke RAG."""
    video_id = extract_youtube_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Tautan YouTube tidak valid. Mohon periksa kembali link video YouTube yang Anda masukkan."
        )

    doc_id = str(uuid.uuid4())
    cache_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_content.json")

    try:
        # 1. Ambil metadata video (judul, channel, thumbnail)
        metadata = await fetch_youtube_metadata(video_id)
        video_title = metadata.get("title", f"Video YouTube ({video_id})")
        display_name = f"[YouTube] {video_title}"

        # 2. Ambil dan proses transkrip ke segmen bertimestamp
        pages_data, topics, page_count = process_youtube_reference(video_id, metadata)

        # Simpan cache transkrip terstruktur untuk viewer
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(pages_data, f, ensure_ascii=False)

        # 3. Simpan Entitas Document ke DB
        ensure_user_exists(db, member_id)
        doc_entry = Document(
            id=doc_id,
            user_id=member_id,
            filename=display_name,
            file_path=f"https://www.youtube.com/watch?v={video_id}",
            file_size_bytes=0,
            page_count=page_count,
            source_type="youtube",
            topics=topics
        )
        db.add(doc_entry)
        db.commit()

        # 4. Chunking & Simpan Embedding
        chunks_data = process_document_pages(pages_data)
        for c in chunks_data:
            emb = get_embedding(c["content"])
            chunk_entry = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=doc_id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                content=c["content"],
                embedding=emb
            )
            db.add(chunk_entry)

        db.commit()
        db.refresh(doc_entry)
        logger.info(f"Video YouTube '{video_title}' berhasil diindeks: {len(chunks_data)} chunks, {page_count} segmen waktu.")
        return doc_entry

    except HTTPException as he:
        if os.path.exists(cache_path):
            os.remove(cache_path)
        raise he
    except Exception as e:
        logger.error(f"Gagal memproses video YouTube: {e}")
        if os.path.exists(cache_path):
            os.remove(cache_path)
        raise HTTPException(status_code=500, detail=f"Gagal memproses materi YouTube: {str(e)}")


@router.get("", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Mendapatkan daftar seluruh dokumen yang diunggah khusus untuk member_id aktif."""
    docs = db.query(Document).filter(Document.user_id == member_id).order_by(Document.created_at.desc()).all()
    return {"documents": docs}


@router.get("/{document_id}/content", response_model=DocumentContentResponse)
def get_document_content(
    document_id: str,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Mengambil seluruh halaman/slide/transkrip teks untuk penampil Content Reader panel di sisi kiri."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == member_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Materi pembelajaran tidak ditemukan.")

    cache_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}_content.json")
    pages = []

    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                pages_data = json.load(f)
                for p in pages_data:
                    pages.append(DocumentPageContent(
                        page_number=p.get("page_number", 1),
                        text=p.get("text", ""),
                        title=p.get("title"),
                        start_seconds=p.get("start_seconds")
                    ))
        except Exception as e:
            logger.warning(f"Gagal membaca cache konten dokumen: {e}")

    # Fallback: jika cache json belum ada, ambil dari chunks yang tersimpan di DB
    if not pages:
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index.asc()).all()
        # Kelompokkan per page_number
        grouped: dict[int, list[str]] = {}
        for c in chunks:
            grouped.setdefault(c.page_number, []).append(c.content)

        for p_num in sorted(grouped.keys()):
            pages.append(DocumentPageContent(
                page_number=p_num,
                text="\n\n".join(grouped[p_num]),
                title=f"Halaman {p_num}"
            ))

    return DocumentContentResponse(
        document_id=doc.id,
        filename=doc.filename,
        source_type=doc.source_type or "pdf",
        pages=pages
    )


@router.get("/{document_id}/file")
def get_document_file(document_id: str, db: Session = Depends(get_db)):
    """Streaming file asli untuk ditampilkan pada In-App Viewer."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Berkas tidak ditemukan di server.")
    
    media_type = "application/pdf"
    ext = os.path.splitext(doc.filename)[1].lower()
    if ext in [".docx", ".doc"]:
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif ext in [".pptx", ".ppt"]:
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    elif ext in [".txt", ".md"]:
        media_type = "text/plain; charset=utf-8"

    return FileResponse(
        doc.file_path,
        media_type=media_type,
        filename=doc.filename,
        headers={"Content-Disposition": f"inline; filename={doc.filename}"}
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Menghapus dokumen dan seluruh chunk dari database serta storage lokal khusus pemilik member_id."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == member_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan atau bukan milik Anda.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.warning(f"Gagal menghapus file fisik: {e}")

    cache_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}_content.json")
    if os.path.exists(cache_path):
        try:
            os.remove(cache_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Dokumen berhasil dihapus."}

