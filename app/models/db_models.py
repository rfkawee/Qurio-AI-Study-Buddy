import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, BigInteger, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, synonym
from app.database import Base, is_postgres

try:
    if is_postgres:
        from pgvector.sqlalchemy import Vector
        EmbeddingType = Vector(768)
    else:
        EmbeddingType = JSON
except ImportError:
    EmbeddingType = JSON


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)  # MBR-XXXX or UUID
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), default="Learner", nullable=False)
    theme = Column(String(20), default="dark", nullable=False)
    preferences = Column(JSON, default=dict)  # Pomodoro & audio settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    summaries = relationship("DocumentSummary", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("StudyNote", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_bytes = Column(BigInteger, default=0, nullable=False)
    page_count = Column(Integer, default=1, nullable=False)
    source_type = Column(String(20), default="pdf", nullable=False)  # 'pdf', 'docx', 'pptx', 'txt', 'youtube'
    topics = Column(JSON, default=list)  # List of detected topics / chapters
    created_at = Column(DateTime, default=datetime.utcnow)

    # Alias filename ke kolom title untuk kompatibilitas kode yang sudah ada
    filename = synonym("title")

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")
    quizzes = relationship("QuizResult", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("DocumentSummary", back_populates="document", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="document", cascade="all, delete-orphan")
    notes = relationship("StudyNote", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    time_range = Column(String(50), nullable=True)  # Rentang waktu video YouTube (contoh: "01:15 - 02:40")
    content = Column(Text, nullable=False)
    embedding = Column(EmbeddingType, nullable=True)  # Vector(768) atau JSON array
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' atau 'assistant'
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)  # Daftar nomor halaman atau rentang waktu
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    score = Column(Integer, default=0, nullable=False)
    quiz_data = Column(JSON, nullable=False)  # Soal, opsi, kunci jawaban, dan pembahasan
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="quizzes")
    user = relationship("User", back_populates="quizzes")


class DocumentSummary(Base):
    __tablename__ = "document_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=True)
    executive_summary = Column(Text, nullable=False)
    key_points = Column(JSON, default=list)  # Butir-butir materi penting
    glossary = Column(JSON, default=dict)  # Glosarium istilah dan definisi
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    document = relationship("Document", back_populates="summaries")
    user = relationship("User", back_populates="summaries")


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, default=1, nullable=False)
    time_label = Column(String(50), nullable=True)
    color = Column(String(20), default="yellow", nullable=False)
    selected_text = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="bookmarks")
    user = relationship("User", back_populates="bookmarks")


class StudyNote(Base):
    __tablename__ = "study_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    scope = Column(String(20), default="document", nullable=False)  # 'document' atau 'global'
    content = Column(Text, default="", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notes")
    document = relationship("Document", back_populates="notes")
