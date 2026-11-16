# Panduan Deployment & Migrasi Database: Qurio (Platform Belajar Cerdas)

Panduan ini menyediakan instruksi langkah demi langkah untuk memindahkan basis data ke **PostgreSQL + pgvector** (Supabase atau Self-Hosted) serta mendeploy platform **Qurio** ke lingkungan produksi (Docker Compose, VPS, atau Cloud PaaS seperti Render/Railway).

---

## 1. Persiapan Basis Data PostgreSQL + pgvector

Qurio menggunakan ekstensi `pgvector` untuk pencarian semantik (Semantic Similarity Search 768-dimensi) dengan jarak kosinus (`<=>`) dan indeks HNSW berkecepatan tinggi.

### Opsi A: Menggunakan Supabase (Direkomendasikan & Gratis)
1. **Buat Proyek Baru di Supabase**:
   - Buka [supabase.com](https://supabase.com) dan buat proyek baru.
2. **Eksekusi Skema Basis Data**:
   - Di dashboard Supabase, buka menu **SQL Editor**.
   - Salin dan tempel seluruh isi berkas [`migrations/schema_postgres.sql`](file:///migrations/schema_postgres.sql).
   - Klik tombol **Run** untuk membuat tabel (`documents`, `document_chunks`, `chat_messages`, `quiz_results`, `document_summaries`) dan indeks `hnsw`.
3. **Ambil Connection URI**:
   - Buka **Project Settings** -> **Database**.
   - Cari bagian **Connection String** -> pilih tab **URI**.
   - Ubah mode ke **Session** (port `5432` atau Transaction pooler `6543`).
   - Contoh URI:
     ```env
     DATABASE_URL=postgresql://postgres.your-project-id:your-db-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```
   - Masukkan URI ini ke dalam file `.env`.

---

### Opsi B: Menggunakan Self-Hosted PostgreSQL (Docker Compose)
Jika Anda mendeploy di server VPS mandiri (Ubuntu/Debian), image Docker `pgvector/pgvector:pg16` sudah disiapkan pada berkas `docker-compose.yml`. Anda tidak perlu menginstal PostgreSQL secara manual di host OS.

---

## 2. Inisialisasi Basis Data Baru (Clean Slate - Mulai dari Nol)

Platform Qurio di PostgreSQL menggunakan pendekatan **Clean Slate (Mulai dari Nol)** tanpa membawa beban atau data warisan dari masa pengembangan:

1. **Inisialisasi Otomatis oleh Backend**:
   - Cukup masukkan `DATABASE_URL` PostgreSQL Anda ke dalam berkas `.env`.
   - Saat backend Qurio pertama kali dinyalakan (`uvicorn app.main:app` atau `docker compose up`), sistem backend akan otomatis:
     - Mengaktifkan ekstensi `uuid-ossp` dan `vector` (pgvector).
     - Membuat ke-8 entitas tabel baru yang bersih (`users`, `documents`, `document_chunks`, `chat_messages`, `quiz_results`, `document_summaries`, `bookmarks`, `study_notes`).
     - Menyematkan akun tamu bawaan `MBR-GUEST` (`guest@qurio.app`).
     - Membangun indeks HNSW cosine distance (`vector_cosine_ops`) untuk pencarian semantik berkecepatan tinggi.

2. **Inisialisasi Manual via Supabase SQL Editor (Opsional)**:
   - Jika Anda lebih menyukai inisialisasi DDL di awal melalui konsol Supabase, buka menu **SQL Editor** pada dashboard Supabase.
   - Salin dan jalankan seluruh isi berkas [`migrations/schema_postgres.sql`](file:///migrations/schema_postgres.sql).

---

## 3. Metode Deployment

### Metode 1: Menggunakan Docker Compose (Paling Mudah untuk VPS / Server Mandiri)

Pastikan Docker & Docker Compose sudah terpasang di server Anda (`docker --version`).

1. **Clone Repositori & Siapkan `.env`**:
   ```bash
   git clone <repo-url> qurio
   cd qurio
   cp .env.example .env
   # Edit .env dan isi OPENROUTER_API_KEY
   nano .env
   ```

2. **Jalankan Seluruh Stack**:
   ```bash
   docker compose up -d --build
   ```

3. **Cek Status Kontainer**:
   ```bash
   docker compose ps
   ```
   - `qurio-postgres`: Berjalan di port `5432` (Health: healthy).
   - `qurio-backend`: Berjalan di port `8000` (FastAPI).
   - `qurio-frontend`: Berjalan di port `80` (Nginx SPA + Reverse Proxy `/api/`).

4. Buka browser di `http://ip-server-anda` untuk langsung menggunakan Qurio!

---

### Metode 2: Cloud PaaS (Render / Railway / Fly.io)

Jika Anda ingin mendeploy tanpa mengelola server VPS:

#### A. Backend Service (Web Service):
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `APP_ENV`: `production`
  - `DATABASE_URL`: Masukkan Supabase URI Anda.
  - `OPENROUTER_API_KEY`: API key OpenRouter Anda.
  - `OPENROUTER_MODEL`: Model OpenRouter yang digunakan (default: `openrouter/free`).
  - `UPLOAD_DIR`: `./uploads`

#### B. Frontend Service (Static Site):
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: URL publik backend service Anda (misal `https://qurio-api.onrender.com`).
  - `VITE_SUPABASE_URL`: (Opsional) Supabase URL.
  - `VITE_SUPABASE_ANON_KEY`: (Opsional) Supabase Anon Key.

---

## 4. Verifikasi Pasca Deployment

Setelah deployment selesai, lakukan pemeriksaan berikut:
1. **Health Check Endpoint**:
   ```bash
   curl https://your-backend-url/api/health
   # Respons yang diharapkan: {"status":"healthy","app":"Qurio","version":"1.0.0","environment":"production"}
   ```
2. **Dokumentasi API Interaktif**:
   - Buka `https://your-backend-url/docs` untuk memeriksa seluruh rute API.
3. **Uji Coba Fungsionalitas**:
   - Unggah berkas dokumen (PDF, Word, PPTX, TXT) atau tambahkan link video YouTube.
   - Ajukan pertanyaan di tab **Tanya Jawab** untuk memastikan True RAG dan sitasi berbasis halaman/waktu merespons secara akurat.
