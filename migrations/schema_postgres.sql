-- ==============================================================================
-- QURIO (Platform Belajar Cerdas) - PostgreSQL + pgvector DDL Schema
-- ==============================================================================
-- Skema resmi untuk deployment Supabase PostgreSQL maupun Self-Hosted PostgreSQL.
-- Eksekusi skrip ini di SQL Editor Supabase atau melalui psql / migration tool.
-- Didesain dari awal (Clean Slate) tanpa prefix warisan.

-- 1. Ekstensi Basis Data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabel Pengguna (Users & Preferensi)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL DEFAULT 'Learner',
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    preferences JSONB DEFAULT '{"pomodoro_work": 25, "pomodoro_break": 5, "sound_enabled": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Pre-seed Akun Tamu Bawaan (Memastikan akses instan tanpa login tetap konsisten)
INSERT INTO users (id, email, display_name, theme)
VALUES ('MBR-GUEST', 'guest@qurio.app', 'Guest Learner', 'dark')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabel Dokumen Materi Belajar (Documents)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    page_count INTEGER NOT NULL DEFAULT 1,
    source_type VARCHAR(20) NOT NULL DEFAULT 'pdf', -- 'pdf', 'docx', 'pptx', 'txt', 'youtube'
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- 4. Tabel Potongan Dokumen & Vektor Semantik (Document Chunks)
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    time_range VARCHAR(50), -- Rentang waktu (menit/detik) khusus materi YouTube
    content TEXT NOT NULL,
    embedding vector(768), -- Vektor 768 dimensi untuk Semantic Search RAG
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- Indeks HNSW Cosine Distance (<=>) untuk Semantic Similarity Search super cepat
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- 5. Tabel Riwayat Pesan Tanya Jawab Akademis (Chat Messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' atau 'assistant'
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_doc_user ON chat_messages(document_id, user_id, created_at ASC);

-- 6. Tabel Hasil Evaluasi Kuis (Quiz Results)
CREATE TABLE IF NOT EXISTS quiz_results (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    quiz_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_doc_user ON quiz_results(document_id, user_id);

-- 7. Tabel Ringkasan Dokumen (Document Summaries)
CREATE TABLE IF NOT EXISTS document_summaries (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255),
    executive_summary TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb,
    glossary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_summaries_doc_user ON document_summaries(document_id, user_id);

-- 8. Tabel Penanda & Sorotan Teks Materi (Bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    time_label VARCHAR(50),
    color VARCHAR(20) NOT NULL DEFAULT 'yellow',
    selected_text TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_doc_user ON bookmarks(document_id, user_id);

-- 9. Tabel Catatan Pembelajaran Mandiri (Study Notes)
CREATE TABLE IF NOT EXISTS study_notes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id VARCHAR(36) REFERENCES documents(id) ON DELETE SET NULL,
    scope VARCHAR(20) NOT NULL DEFAULT 'document', -- 'document' atau 'global'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_notes_user_doc ON study_notes(user_id, document_id);

-- Komentar Dokumentasi Skema
COMMENT ON TABLE users IS 'Menyimpan profil akun siswa, preferensi tema, dan setelan timer Pomodoro';
COMMENT ON TABLE documents IS 'Menyimpan metadata materi pembelajaran (PDF, Word, PPTX, TXT, YouTube)';
COMMENT ON TABLE document_chunks IS 'Menyimpan potongan teks dan embedding vektor 768 dimensi untuk pgvector RAG';
COMMENT ON TABLE chat_messages IS 'Menyimpan riwayat tanya jawab pengguna dengan sitasi halaman/waktu';
COMMENT ON TABLE quiz_results IS 'Menyimpan rekam jejak pengerjaan kuis dan evaluasi jawaban';
COMMENT ON TABLE document_summaries IS 'Menyimpan hasil telaah materi, ringkasan eksekutif, poin inti, dan glosarium';
COMMENT ON TABLE bookmarks IS 'Menyimpan penanda posisi belajar dan kutipan sorotan teks siswa';
COMMENT ON TABLE study_notes IS 'Menyimpan catatan belajar siswa per dokumen maupun catatan umum';
