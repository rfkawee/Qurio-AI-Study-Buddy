import uuid
import logging
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db, ensure_user_exists
from app.core.auth import get_current_member_id
from app.models.db_models import Bookmark, StudyNote, User, Document
from app.models.schemas import (
    BookmarkCreate, BookmarkResponse,
    StudyNoteSave, StudyNoteResponse,
    UserProfileResponse, UserPreferencesUpdate
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Study Tools & Profile"])

# ==============================================================================
# BOOKMARKS ENDPOINTS
# ==============================================================================

@router.get("/bookmarks", response_model=List[BookmarkResponse])
def get_bookmarks(
    document_id: Optional[str] = Query(None, description="Filter bookmark berdasarkan document_id"),
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Mengambil daftar penanda (bookmarks) milik pengguna."""
    query = db.query(Bookmark).filter(Bookmark.user_id == member_id)
    if document_id:
        query = query.filter(Bookmark.document_id == document_id)
    return query.order_by(Bookmark.created_at.desc()).all()


@router.post("/bookmarks", response_model=BookmarkResponse)
def create_bookmark(
    payload: BookmarkCreate,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Menyimpan penanda (bookmark) atau sorotan teks baru."""
    ensure_user_exists(db, member_id)
    
    # Validasi keberadaan dokumen
    doc = db.query(Document).filter(Document.id == payload.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan.")

    bookmark = Bookmark(
        id=str(uuid.uuid4()),
        document_id=payload.document_id,
        user_id=member_id,
        page_number=payload.page_number,
        time_label=payload.time_label,
        color=payload.color or "yellow",
        selected_text=payload.selected_text,
        note=payload.note
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark


@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(
    bookmark_id: str,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Menghapus penanda (bookmark)."""
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == member_id
    ).first()
    
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark tidak ditemukan.")

    db.delete(bookmark)
    db.commit()
    return {"status": "success", "message": "Bookmark berhasil dihapus."}


# ==============================================================================
# STUDY NOTES ENDPOINTS
# ==============================================================================

@router.get("/notes", response_model=List[StudyNoteResponse])
def get_notes(
    document_id: Optional[str] = Query(None, description="Filter catatan berdasarkan document_id"),
    scope: Optional[str] = Query(None, description="Filter cakupan: 'document' atau 'global'"),
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Mengambil catatan pembelajaran mandiri siswa."""
    query = db.query(StudyNote).filter(StudyNote.user_id == member_id)
    if document_id:
        query = query.filter(StudyNote.document_id == document_id)
    if scope:
        query = query.filter(StudyNote.scope == scope)
    return query.order_by(StudyNote.updated_at.desc()).all()


@router.post("/notes", response_model=StudyNoteResponse)
def save_study_note(
    payload: StudyNoteSave,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Menyimpan atau memperbarui catatan belajar mandiri."""
    ensure_user_exists(db, member_id)
    
    # Cari catatan yang sudah ada untuk kombinasi (user_id, document_id, scope)
    query = db.query(StudyNote).filter(
        StudyNote.user_id == member_id,
        StudyNote.scope == payload.scope
    )
    if payload.document_id:
        query = query.filter(StudyNote.document_id == payload.document_id)
    else:
        query = query.filter(StudyNote.document_id.is_(None))

    note = query.first()
    if note:
        note.content = payload.content
        note.updated_at = datetime.utcnow()
    else:
        note = StudyNote(
            id=str(uuid.uuid4()),
            user_id=member_id,
            document_id=payload.document_id,
            scope=payload.scope,
            content=payload.content
        )
        db.add(note)

    db.commit()
    db.refresh(note)
    return note


# ==============================================================================
# USER PROFILE & PREFERENCES ENDPOINTS
# ==============================================================================

@router.get("/user/profile", response_model=UserProfileResponse)
def get_user_profile(
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Mengambil informasi profil dan preferensi siswa aktif."""
    ensure_user_exists(db, member_id)
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan.")
    return user


@router.put("/user/preferences", response_model=UserProfileResponse)
def update_user_preferences(
    payload: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    member_id: str = Depends(get_current_member_id)
):
    """Memperbarui setelan tema, nama tampilan, atau Pomodoro."""
    ensure_user_exists(db, member_id)
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan.")

    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.theme is not None:
        user.theme = payload.theme
    if payload.preferences is not None:
        current_prefs = dict(user.preferences or {})
        current_prefs.update(payload.preferences)
        user.preferences = current_prefs

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user
