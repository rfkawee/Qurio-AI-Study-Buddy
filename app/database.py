import json
import logging
from typing import Generator, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Normalisasi protokol URL Database (Supabase biasanya memberikan URI berawalan 'postgres://' yang perlu diubah ke 'postgresql://')
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

is_postgres = database_url.startswith("postgresql")

# Koneksi Engine
if is_postgres:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20
    )
else:
    # SQLite fallback untuk local development
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Inisialisasi tabel, ekstensi vector, seeding akun tamu, dan indeks jika postgres."""
    try:
        if is_postgres:
            with engine.connect() as conn:
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                logger.info("Ekstensi uuid-ossp dan pgvector di PostgreSQL berhasil diverifikasi.")
        
        # Buat seluruh tabel yang didefinisikan di db_models
        from app.models import db_models
        Base.metadata.create_all(bind=engine)
        logger.info("Tabel-tabel database Qurio berhasil dibuat/dimuat.")

        # Pre-seed Akun Tamu Bawaan (MBR-GUEST)
        with SessionLocal() as session:
            guest = session.query(db_models.User).filter(db_models.User.id == "MBR-GUEST").first()
            if not guest:
                guest = db_models.User(
                    id="MBR-GUEST",
                    email="guest@qurio.app",
                    display_name="Guest Learner",
                    theme="dark",
                    preferences={"pomodoro_work": 25, "pomodoro_break": 5, "sound_enabled": True}
                )
                session.add(guest)
                session.commit()
                logger.info("Akun tamu bawaan MBR-GUEST berhasil disematkan ke database.")

        # Untuk PostgreSQL: Buat indeks HNSW untuk vector search cosine distance (<=>)
        if is_postgres:
            with engine.connect() as conn:
                try:
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
                        ON document_chunks 
                        USING hnsw (embedding vector_cosine_ops);
                    """))
                    conn.commit()
                    logger.info("Indeks HNSW vector cosine search berhasil diverifikasi.")
                except Exception as idx_err:
                    logger.warning(f"Catatan pembuatan indeks HNSW: {idx_err}")
    except Exception as e:
        logger.error(f"Gagal menginisialisasi database: {e}")
        raise e

def ensure_user_exists(db: Session, user_id: str, email: Optional[str] = None) -> None:
    """Memastikan foreign key user_id valid di tabel users sebelum operasi simpan."""
    from app.models.db_models import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        clean_email = email or f"{user_id.lower().replace(' ', '_')}@qurio.app"
        new_user = User(
            id=user_id,
            email=clean_email,
            display_name=f"Learner {user_id[-4:]}" if len(user_id) >= 4 else "Learner",
            theme="dark",
            preferences={"pomodoro_work": 25, "pomodoro_break": 5, "sound_enabled": True}
        )
        try:
            db.add(new_user)
            db.commit()
        except Exception:
            db.rollback()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
