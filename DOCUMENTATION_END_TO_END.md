# DOKUMENTASI END-TO-END SISTEM QURIO
## Platform Belajar Cerdas Terpadu Berbasis True RAG & Multi-Agent Intelligence

---

# DAFTAR ISI

- [1. Ikhtisar Eksekutif & Latar Belakang Proyek](#1-ikhtisar-eksekutif--latar-belakang-proyek)
  - [1.1 Visi & Misi Qurio](#11-visi--misi-qurio)
  - [1.2 Problem Statement](#12-problem-statement)
  - [1.3 Core Value Proposition](#13-core-value-proposition)
  - [1.4 Target Pengguna & Persona](#14-target-pengguna--persona)
- [2. Arsitektur Sistem & Multi-Agent Intelligence Core](#2-arsitektur-sistem--multi-agent-intelligence-core)
  - [2.1 Alur Sistem End-to-End](#21-alur-sistem-end-to-end)
  - [2.2 Agen 1: Document Ingestion & Topic Agent](#22-agen-1-document-ingestion--topic-agent)
  - [2.3 Agen 2: Academic Tutor (RAG Chat) Agent](#23-agen-2-academic-tutor-rag-chat-agent)
  - [2.4 Agen 3: Summary & Concept Agent](#24-agen-3-summary--concept-agent)
  - [2.5 Agen 4: Quiz & Assessment Master Agent](#25-agen-4-quiz--assessment-master-agent)
  - [2.6 Integrasi OpenRouter LLM Engine](#26-integrasi-openrouter-llm-engine)
- [3. Desain Basis Data & Skema PostgreSQL pgvector](#3-desain-basis-data--skema-postgresql-pgvector)
  - [3.1 Entity-Relationship Diagram (ERD)](#31-entity-relationship-diagram-erd)
  - [3.2 Struktur & Kamus Data 8 Tabel Inti](#32-struktur--kamus-data-8-tabel-inti)
  - [3.3 Indeks Vektor HNSW & Pencarian Cosine Distance](#33-indeks-vektor-hnsw--pencarian-cosine-distance)
  - [3.4 Arsitektur Penyimpanan Ganda (Hybrid Storage)](#34-arsitektur-penyimpanan-ganda-hybrid-storage)
- [4. Arsitektur & Spesifikasi Antarmuka Pengguna (Frontend)](#4-arsitektur--spesifikasi-antarmuka-pengguna-frontend)
  - [4.1 Filosofi Dual-View Split Screen (50:50)](#41-filosofi-dual-view-split-screen-5050)
  - [4.2 Panel Kiri: Multi-Format Reader](#42-panel-kiri-multi-format-reader)
  - [4.3 Panel Kanan: Modul Belajar Interaktif](#43-panel-kanan-modul-belajar-interaktif)
  - [4.4 Fitur Kritis: Auto-Jump Citation Mechanism](#44-fitur-kritis-auto-jump-citation-mechanism)
  - [4.5 Study Toolkit: Pomodoro, Lofi, Notes, & Bookmarks](#45-study-toolkit-pomodoro-lofi-notes--bookmarks)
- [5. Spesifikasi REST API & Kontrak Data](#5-spesifikasi-rest-api--kontrak-data)
  - [5.1 Standar Header & Autentikasi](#51-standar-header--autentikasi)
  - [5.2 Endpoints Dokumen (`/api/documents`)](#52-endpoints-dokumen-apidocuments)
  - [5.3 Endpoints Chat RAG (`/api/chat`)](#53-endpoints-chat-rag-apichat)
  - [5.4 Endpoints Ringkasan (`/api/summary`)](#54-endpoints-ringkasan-apisummary)
  - [5.5 Endpoints Kuis (`/api/quiz`)](#55-endpoints-kuis-apiquiz)
  - [5.6 Endpoints Study Tools (`/api/bookmarks`, `/api/notes`, `/api/user`)](#56-endpoints-study-tools-apibookmarks-apinotes-apiuser)
  - [5.7 Endpoints Sistem (`/api/health`)](#57-endpoints-sistem-apihealth)
- [6. Panduan Instalasi, Konfigurasi & Menjalankan Aplikasi](#6-panduan-instalasi-konfigurasi--menjalankan-aplikasi)
  - [6.1 Prasyarat Perangkat Lunak](#61-prasyarat-perangkat-lunak)
  - [6.2 Konfigurasi Environment (`.env`)](#62-konfigurasi-environment-env)
  - [6.3 Menjalankan 1-Klik di Windows (`run.bat` & `stop.bat`)](#63-menjalankan-1-klik-di-windows-runbat--stopbat)
  - [6.4 Menjalankan Manual melalui Terminal CLI](#64-menjalankan-manual-melalui-terminal-cli)
  - [6.5 Menjalankan via Docker & Docker Compose](#65-menjalankan-via-docker--docker-compose)
- [7. Strategi Pengujian & Penjaminan Kualitas (QA)](#7-strategi-pengujian--penjaminan-kualitas-qa)
  - [7.1 Automated Backend Test Suite (Pytest)](#71-automated-backend-test-suite-pytest)
  - [7.2 Frontend Typecheck & Build Verification](#72-frontend-typecheck--build-verification)
  - [7.3 Protokol AI Coding Agent (AGENTS.md Compliance)](#73-protokol-ai-coding-agent-agentsmd-compliance)
- [8. Panduan Deployment Produksi & Keamanan](#8-panduan-deployment-produksi--keamanan)
  - [8.1 Setup Supabase Database & Migrasi Schema DDL](#81-setup-supabase-database--migrasi-schema-ddl)
  - [8.2 Reverse Proxy Nginx & Single Page Application (SPA)](#82-reverse-proxy-nginx--single-page-application-spa)
  - [8.3 Praktik Keamanan & Monitoring](#83-praktik-keamanan--monitoring)

---

# 1. IKHTISAR EKSEKUTIF & LATAR BELAKANG PROYEK

## 1.1 Visi & Misi Qurio
**Qurio** adalah platform pendamping belajar cerdas (*AI Study Buddy*) yang mengintegrasikan kecerdasan buatan berbasis *True Retrieval-Augmented Generation* (RAG) dan arsitektur *Multi-Agent* terspesialisasi. Qurio dirancang untuk mendampingi pelajar, mahasiswa, dan pembelajar mandiri dalam memahami dokumen materi yang padat dan video pembelajaran secara interaktif, terukur, dan objektif.

Misi utama Qurio:
1. **Mengeliminasi Halusinasi AI**: Menjamin setiap penjelasan grounded secara 100% pada materi rujukan siswa.
2. **Menyediakan Rujukan Validitas Instan**: Memberikan sitasi halaman `[Halaman X]` dan penanda waktu `[Menit MM:SS]` yang dapat diklik langsung untuk memverifikasi kebenaran teks rujukan.
3. **Mengoptimalkan Fokus Belajar**: Menggabungkan materi, pembaca dokumen, tutor cerdas, kuis penguji pemahaman, dan instrumen produktivitas (Pomodoro, Lofi Beats, Mini Notes) dalam satu layar terintegrasi (*Split-Screen Dual View*).

## 1.2 Problem Statement
Di era digital, pelajar dihadapkan pada materi berlimpah (buku teks, modul perkuliahan, slide presentasi ratusan slide, serta video ceramah YouTube). Terdapat tiga kendala utama:
1. **Information & Cognitive Overload**: Mahasiswa kesulitan menemukan konsep kunci pada dokumen ratusan halaman dan video durasi panjang.
2. **Halusinasi Model AI Konvensional**: Model LLM umum (seperti ChatGPT mentah) seringkali menghasilkan jawaban yang tampak meyakinkan namun tidak akurat atau bertentangan dengan buku ajar resmi siswa, tanpa menyediakan nomor halaman referensi.
3. **Fragmentasi Alat Belajar**: Siswa harus berpindah-pindah jendela antara PDF viewer, catatan, browser, timer pomodoro, dan aplikasi pemutar audio, yang merusak fokus (*deep work*).

## 1.3 Core Value Proposition
- **True RAG dengan Sitasi Eksplisit**: Setiap jawaban tutor menyertakan tag sitasi `[Halaman X]` atau `[Menit MM:SS]` yang memicu fungsi *auto-jump* pada panel baca sebelah kiri.
- **Arsitektur Multi-Agent 4 Pilar**: Pemisahan tugas cerdas antara Ingestion, Academic Tutor, Concept Summarizer, dan Quiz Assessment Master.
- **Dukungan Multi-Format Tanpa Batas Halaman**: Menerima PDF, Word (.docx), PowerPoint (.pptx), Teks (.txt), dan URL video YouTube hingga 5 MB per berkas tanpa memotong jumlah halaman dokumen.
- **UI Dual-View 50:50**: Panel kiri membaca konten asli, panel kanan berinteraksi dengan AI.

## 1.4 Target Pengguna & Persona
1. **Siti (Mahasiswi Kedokteran/Sains)**: Membaca modul tebal dengan istilah biologis rumit; memerlukan verifikasi cepat rujukan organel/molekul ke halaman buku ajar asli.
2. **Budi (Siswa SMA - Pejuang Ujian Mandiri/SNBT)**: Membutuhkan latihan kuis pilihan ganda berbasis bab dengan analisis mendalam mengapa jawabannya benar atau salah.
3. **Reza (Profesional / Self-Learner)**: Mempelajari video tutorial teknis dan slide presentasi bisnis; memanfaatkan ringkasan eksekutif dan timer Pomodoro berlatar musik Lofi.

---

# 2. ARSITEKTUR SISTEM & MULTI-AGENT INTELLIGENCE CORE

## 2.1 Alur Sistem End-to-End

```mermaid
flowchart TD
    User([Pelajar / Siswa])
    
    subgraph MultiAgentSystem ["Qurio Multi-Agent Intelligence Core"]
        AgentIngest["1. Document Ingestion & Topic Agent"]
        AgentTutor["2. Academic Tutor RAG Agent"]
        AgentSumm["3. Summary & Concept Agent"]
        AgentQuiz["4. Quiz & Assessment Master Agent"]
    end
    
    subgraph DataStore ["PostgreSQL + pgvector (Supabase / Local)"]
        DBDocs[("documents & topics")]
        DBChunks[("document_chunks (embedding 768-d)")]
        DBChat[("chat_messages & citations")]
        DBQuiz[("quiz_results & evaluations")]
        DBSumm[("document_summaries")]
        DBTools[("bookmarks & study_notes")]
    end

    User -->|"Upload Dokumen (max 5MB, tanpa batas hal) / YouTube"| AgentIngest
    AgentIngest -->|"Ekstraksi Halaman, Outline Bab & Chunking"| DBDocs
    AgentIngest -->|"Batch Embedding OpenRouter (768-d)"| DBChunks

    User -->|"Pertanyaan Siswa (Chat)"| AgentTutor
    AgentTutor -->|"Cosine Distance Vector Search (<=>)"| DBChunks
    AgentTutor -->|"Stream SSE + Citations [Halaman X]"| User

    User -->|"Permintaan Ringkasan Topik"| AgentSumm
    AgentSumm -->|"Executive Brief, Core Points, Glossary"| DBSumm
    AgentSumm -->|"Render Markdown UI"| User

    User -->|"Pilih Bab & Kerjakan Kuis"| AgentQuiz
    AgentQuiz -->|"Structured Pydantic JSON Mode"| User
    User -->|"Submit Semua Jawaban"| AgentQuiz
    AgentQuiz -->|"Skor, Evaluasi Akademis & Sitasi"| DBQuiz
    AgentQuiz -->|"Tampilkan Hasil di UI"| User
```

## 2.2 Agen 1: Document Ingestion & Topic Agent
- **Tujuan**: Memvalidasi, mem-parsing, memecah (chunking), dan mengekstrak materi belajar siswa menjadi representasi semantik.
- **Tanggung Jawab**:
  1. Validasi Berkas: Menolak berkas yang berukuran > 5 MB dengan status `HTTP 413 Payload Too Large`. Tidak ada batasan jumlah halaman (`MAX_PAGE_COUNT = None`).
  2. Ekstraksi Multi-Format:
     - **PDF**: Menggunakan `pypdf`, mempertahankan nomor halaman asli (1-based index).
     - **Word (.docx)**: Menggunakan `python-docx`, memetakan paragraf dan heading ke nomor halaman logis.
     - **PowerPoint (.pptx)**: Menggunakan `python-pptx`, setiap slide dipetakan sebagai satu unit halaman.
     - **Text (.txt)**: Pembacaan ber-encoding UTF-8 dengan pembagian halaman per ~3000 karakter.
     - **YouTube**: Menggunakan `youtube-transcript-api`, mengekstrak teks ucapan beserta rentang timestamp (`start` dan `duration`) dipetakan ke penanda waktu `[Menit MM:SS]`.
  3. Chunking Semantik: Menggunakan recursive character splitting (~800 karakter per chunk dengan overlap ~150 karakter) untuk menjaga kelengkapan konteks kalimat.
  4. Vektorisasi: Menghitung representasi vektor 768-dimensi per chunk dan menyimpannya secara batch ke tabel `document_chunks`.

## 2.3 Agen 2: Academic Tutor (RAG Chat) Agent
- **Persona**: **Asisten Akademis Formal**. Menggunakan bahasa baku, santun, objektif, padat, lugas, dan bebas dari basa-basi.
- **Protokol Ketat Grounding**:
  - LLM hanya diperkenankan menjawab menggunakan konteks yang diambil dari database vektor.
  - Jika informasi tidak terdapat dalam dokumen rujukan, agen wajib menyatakan secara terbuka: *"Informasi tersebut tidak tercantum dalam materi dokumen yang diunggah."* Dilarang berspekulasi atau menggunakan pengetahuan eksternal yang tidak dapat diverifikasi.
- **Sitasi Halaman & Waktu**:
  - Setiap poin fakta krusial wajib diakhiri dengan tag sitasi `[Halaman X]` atau `[Menit MM:SS]`.
  - Frontend mengenali regex pattern tersebut dan merendernya sebagai badge interaktif yang memicu loncatan viewer otomatis.
- **Streaming Token**: Menghantarkan token jawaban secara real-time via Server-Sent Events (SSE) dengan format data `data: {"token": "..."}`.

## 2.4 Agen 3: Summary & Concept Agent
- **Tujuan**: Memadatkan materi bab menjadi ringkasan bernilai tinggi untuk persiapan ujian siswa.
- **Format Output Wajib (3 Bagian)**:
  1. **Ringkasan Eksekutif**: 1-2 paragraf komprehensif mengenai tema pokok dokumen.
  2. **Poin-Poin Inti**: 5-10 butir poin terpenting yang sering menjadi materi ujian.
  3. **Glosarium Istilah**: Daftar kata teknis, rumus, atau terminologi krusial beserta definisi ringkasnya.
- **Caching**: Hasil ringkasan disimpan di tabel `document_summaries` agar permintaan berulang untuk dokumen/topik yang sama tidak membebani kuota API.

## 2.5 Agen 4: Quiz & Assessment Master Agent
- **Tujuan**: Menguji pemahaman aktif (*active recall*) siswa secara terstruktur.
- **Spesifikasi Operasi**:
  1. Parameter Input: `document_id`, `topic` (nama bab pilihan atau materi kustom), dan `num_questions` (1 sampai 10 butir soal).
  2. **Zero Regex / 100% Structured Output**: Menggunakan OpenRouter API dengan mode `response_format={"type": "json_object"}` dan divalidasi ke skema Pydantic `QuizGenerateResponse`.
  3. Struktur Setiap Butir Soal:
     - 4 opsi pilihan ganda (`A`, `B`, `C`, `D`).
     - Kunci jawaban yang tepat.
     - Analisis akademis mendalam (alasan mengapa opsi benar tepat dan mengapa ketiga opsi lainnya salah).
     - Rujukan halaman dokumen (`page_ref`) atau rentang waktu (`time_ref`).
  4. **Exam Mode (Evaluasi Simultan)**: Kunci jawaban dan analisis disembunyikan dari UI hingga siswa menekan tombol *"Submit Semua Jawaban"*.

## 2.6 Integrasi OpenRouter LLM Engine
- **Modul Inti**: `app/core/openrouter.py`.
- **Primary Model**: `meta-llama/llama-3.3-70b-instruct:free` (dengan fallback otomatis ke `openrouter/free` atau model performa tinggi berbayar sesuai konfigurasi `.env`).
- **Embedding Strategy**: Menghasilkan representasi vektor 768-dimensi yang selaras dengan kolom `embedding vector(768)` di PostgreSQL `pgvector`.

---

# 3. DESAIN BASIS DATA & SKEMA POSTGRESQL PGVECTOR

## 3.1 Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ DOCUMENTS : "owns"
    USERS ||--o{ BOOKMARKS : "creates"
    USERS ||--o{ STUDY_NOTES : "writes"
    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "contains"
    DOCUMENTS ||--o{ CHAT_MESSAGES : "receives"
    DOCUMENTS ||--o{ QUIZ_RESULTS : "evaluated_in"
    DOCUMENTS ||--o{ DOCUMENT_SUMMARIES : "summarized_in"
    DOCUMENTS ||--o{ BOOKMARKS : "tagged_in"
    DOCUMENTS ||--o{ STUDY_NOTES : "referenced_in"

    USERS {
        VARCHAR id PK
        VARCHAR email UK
        VARCHAR display_name
        VARCHAR theme
        JSONB preferences
        TIMESTAMP created_at
    }

    DOCUMENTS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR title
        VARCHAR filename
        VARCHAR file_path
        VARCHAR file_type
        INTEGER file_size_bytes
        INTEGER page_count
        VARCHAR source_type
        VARCHAR source_url
        JSONB topics
        TIMESTAMP created_at
    }

    DOCUMENT_CHUNKS {
        VARCHAR id PK
        VARCHAR document_id FK
        INTEGER chunk_index
        TEXT content
        INTEGER page_number
        VARCHAR time_range
        VECTOR embedding
        TIMESTAMP created_at
    }

    CHAT_MESSAGES {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR user_id FK
        VARCHAR role
        TEXT message
        JSONB citations
        TIMESTAMP created_at
    }

    QUIZ_RESULTS {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR user_id FK
        VARCHAR topic
        INTEGER total_questions
        INTEGER correct_answers
        DECIMAL score
        JSONB details
        TIMESTAMP created_at
    }

    DOCUMENT_SUMMARIES {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR topic
        TEXT executive_summary
        JSONB key_points
        JSONB glossary
        TIMESTAMP created_at
    }

    BOOKMARKS {
        VARCHAR id PK
        VARCHAR document_id FK
        VARCHAR user_id FK
        INTEGER page_number
        VARCHAR time_position
        VARCHAR title
        TEXT highlighted_text
        VARCHAR color
        TIMESTAMP created_at
    }

    STUDY_NOTES {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR document_id FK
        VARCHAR title
        TEXT content
        VARCHAR tag
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

## 3.2 Struktur & Kamus Data 8 Tabel Inti

### 1. Tabel `users`
Menyimpan profil siswa dan setelan personalisasi belajar.
- `id` (VARCHAR(64), PK): ID pengguna (misal: `MBR-GUEST` atau UUID Supabase Auth).
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Alamat surel siswa.
- `display_name` (VARCHAR(255)): Nama tampilan siswa.
- `theme` (VARCHAR(32), DEFAULT 'default'): Pilihan tema warna UI (`default`, `warm`, `dark`, `forest`, `lavender`).
- `preferences` (JSONB): Konfigurasi durasi Pomodoro (`pomodoro_work`, `pomodoro_break`) dan setelan audio.

### 2. Tabel `documents`
Menyimpan katalog berkas materi dan tautan YouTube milik siswa.
- `id` (VARCHAR(64), PK): Pengidentifikasi unik berkas (UUID v4).
- `user_id` (VARCHAR(64), FK -> `users.id` ON DELETE CASCADE).
- `title` (VARCHAR(255)): Judul dokumen atau nama berkas.
- `filename` (VARCHAR(255)): Nama fisik berkas saat diunggah.
- `file_path` (VARCHAR(512)): Jalur relatif penyimpanan fisik di server (`uploads/...`).
- `file_type` (VARCHAR(32)): Format MIME atau ekstensi berkas (`pdf`, `docx`, `pptx`, `txt`, `youtube`).
- `file_size_bytes` (INTEGER): Ukuran berkas dalam byte (maksimum 5.242.880 bytes / 5 MB).
- `page_count` (INTEGER): Total jumlah halaman dokumen atau total menit segmen video.
- `source_type` (VARCHAR(32), DEFAULT 'file'): Tipe sumber (`file` atau `youtube`).
- `source_url` (VARCHAR(512)): Tautan URL video jika materi berasal dari YouTube.
- `topics` (JSONB, DEFAULT '[]'): Daftar bab (*Table of Contents*) yang diekstrak untuk opsi kuis.

### 3. Tabel `document_chunks`
Menyimpan pecahan teks materi beserta representasi vektor semantik.
- `id` (VARCHAR(64), PK): ID unik chunk.
- `document_id` (VARCHAR(64), FK -> `documents.id` ON DELETE CASCADE).
- `chunk_index` (INTEGER): Urutan chunk dalam dokumen.
- `content` (TEXT, NOT NULL): Teks asli (~800 karakter).
- `page_number` (INTEGER): Nomor halaman fisik tempat teks ditemukan (1-based index).
- `time_range` (VARCHAR(64)): Penanda rentang waktu ucapan (khusus video YouTube, format `MM:SS - MM:SS`).
- `embedding` (VECTOR(768)): Representasi vektor 768-dimensi.

### 4. Tabel `chat_messages`
Menyimpan riwayat tanya jawab antara siswa dan Academic Tutor Agent.
- `id` (VARCHAR(64), PK): ID pesan.
- `document_id` (VARCHAR(64), FK -> `documents.id` ON DELETE CASCADE).
- `user_id` (VARCHAR(64), FK -> `users.id` ON DELETE CASCADE).
- `role` (VARCHAR(16), NOT NULL): Peran entitas obrolan (`user` atau `assistant`).
- `message` (TEXT, NOT NULL): Isi teks pertanyaan atau jawaban tutor.
- `citations` (JSONB, DEFAULT '[]'): Array nomor halaman atau penanda waktu rujukan.

### 5. Tabel `quiz_results`
Menyimpan rekam jejak pengerjaan kuis siswa.
- `id` (VARCHAR(64), PK): ID sesi kuis.
- `document_id` (VARCHAR(64), FK -> `documents.id` ON DELETE CASCADE).
- `user_id` (VARCHAR(64), FK -> `users.id` ON DELETE CASCADE).
- `topic` (VARCHAR(255)): Bab atau topik spesifik yang diuji.
- `total_questions` (INTEGER): Jumlah soal kuis yang dikerjakan.
- `correct_answers` (INTEGER): Jumlah soal yang dijawab benar.
- `score` (DECIMAL(5, 2)): Nilai akhir dalam skala 0.00 s/d 100.00.
- `details` (JSONB): Rekaman lengkap butir soal, opsi yang dipilih, kunci jawaban, dan analisis akademik.

### 6. Tabel `document_summaries`
Menyimpan cache ringkasan eksekutif dokumen per topik.
- `id` (VARCHAR(64), PK): ID ringkasan.
- `document_id` (VARCHAR(64), FK -> `documents.id` ON DELETE CASCADE).
- `topic` (VARCHAR(255)): Topik yang dirangkum.
- `executive_summary` (TEXT): Paragraf gambaran umum.
- `key_points` (JSONB): Daftar 5-10 butir poin inti materi.
- `glossary` (JSONB): Kamus istilah teknis dan definisinya.

### 7. Tabel `bookmarks`
Menyimpan penanda posisi membaca dan kutipan penting siswa.
- `id` (VARCHAR(64), PK): ID penanda.
- `document_id` (VARCHAR(64), FK -> `documents.id` ON DELETE CASCADE).
- `user_id` (VARCHAR(64), FK -> `users.id` ON DELETE CASCADE).
- `page_number` (INTEGER): Halaman yang ditandai.
- `time_position` (VARCHAR(32)): Posisi waktu video yang ditandai.
- `title` (VARCHAR(255)): Judul atau catatan singkat penanda.
- `highlighted_text` (TEXT): Kutipan teks yang disorot siswa.
- `color` (VARCHAR(32), DEFAULT 'yellow'): Warna visual penanda.

### 8. Tabel `study_notes`
Menyimpan catatan mandiri siswa.
- `id` (VARCHAR(64), PK): ID catatan.
- `user_id` (VARCHAR(64), FK -> `users.id` ON DELETE CASCADE).
- `document_id` (VARCHAR(64), NULLABLE): Jika `NULL`, merupakan catatan global; jika terisi, terikat pada dokumen tertentu.
- `title` (VARCHAR(255), NOT NULL): Judul catatan.
- `content` (TEXT, NOT NULL): Isi catatan (mendukung markdown).
- `tag` (VARCHAR(64)): Kategori label catatan.

## 3.3 Indeks Vektor HNSW & Pencarian Cosine Distance
Pencarian semantik pada tabel `document_chunks` memanfaatkan indeks **HNSW (Hierarchical Navigable Small World)** di PostgreSQL:
```sql
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```
Query pencarian semantik menggunakan operator Cosine Distance (`<=>`):
```sql
SELECT content, page_number, time_range, (embedding <=> :query_vector) AS distance
FROM document_chunks
WHERE document_id = :doc_id
ORDER BY embedding <=> :query_vector ASC
LIMIT 5;
```
Pendekatan ini menjamin waktu respon pencarian kurang dari 300 milidetik bahkan untuk materi dokumen beratus-ratus halaman.

## 3.4 Arsitektur Penyimpanan Ganda (Hybrid Storage)
- **Production Mode**: Terhubung langsung ke Supabase PostgreSQL dengan ekstensi `pgvector` aktif.
- **Local Development Mode**: Secara otomatis beralih ke SQLite lokal (`qurio.db`) jika `DATABASE_URL` belum dikonfigurasi ke PostgreSQL, menggunakan pencarian berbasis kata kunci/cosine in-memory untuk kenyamanan pengembang offline.

---

# 4. ARSITEKTUR & SPESIFIKASI ANTARMUKA PENGGUNA (FRONTEND)

## 4.1 Filosofi Dual-View Split Screen (50:50)
Antarmuka Qurio didesain khusus agar siswa tidak perlu berpindah aplikasi saat belajar. Layar kerja dibagi menjadi dua panel berdampingan:
- **Panel Kiri (Lebar 50%)**: Area membaca materi primer (*Primary Document/Video Surface*).
- **Panel Kanan (Lebar 50%)**: Area interaksi AI multi-agent dan evaluasi pemahaman (*Interactive Learning Surface*).

## 4.2 Panel Kiri: Multi-Format Reader
Panel kiri beradaptasi secara otomatis berdasarkan tipe materi yang sedang aktif:
1. **PDF Viewer Panel (`PDFViewerPanel.tsx`)**:
   - Merender file PDF menggunakan rendering canvas resolusi tinggi.
   - Kontrol navigasi: Next/Previous page, input nomor halaman langsung, Zoom In/Out, Fit-to-Width, dan Focus Mode (layar penuh).
2. **Content Reader Panel (`ContentReaderPanel.tsx`)**:
   - Merender materi dari berkas Word (`.docx`), PowerPoint (`.pptx`), dan Text (`.txt`).
   - Dilengkapi navigasi slide/halaman dan highlight teks.
3. **YouTube Player Surface**:
   - Merender video pembelajaran YouTube tersemat menggunakan iframe responsif.
   - Terkoneksi dengan API seek video untuk melompatkan pemutaran ke menit tertentu.

## 4.3 Panel Kanan: Modul Belajar Interaktif
Tiga tab pembelajaran utama:
1. **Chat Tutor Tab (`ChatModule.tsx`)**:
   - Area tanya-jawab bergaya percakapan akademis.
   - Mendukung streaming jawaban teks per token.
   - Merender badge sitasi interaktif `[Halaman X]` dan `[Menit MM:SS]`.
2. **Summary Tab (`SummaryModule.tsx`)**:
   - Menampilkan ringkasan terstruktur dalam 3 kartu: Ringkasan Eksekutif, Butir Poin Inti, dan Glosarium Istilah Teknis.
   - Dilengkapi tombol export ringkasan ke clipboard.
3. **Quiz Tab (`QuizModule.tsx`)**:
   - Memilih topik bab dan jumlah soal (1-10 soal).
   - Menampilkan soal dengan pilihan ganda interaktif.
   - Tombol *"Submit Semua Jawaban"* untuk membuka kartu evaluasi, skor persentase, kunci jawaban, dan uraian analisis akademik.

## 4.4 Fitur Kritis: Auto-Jump Citation Mechanism
Mekanisme ini merupakan diferensiasi utama Qurio:
1. Saat Academic Tutor Agent atau Quiz Master menghasilkan tag `[Halaman X]`, frontend mendeteksinya menggunakan regular expression: `/\[Halaman\s+(\d+)\]/g`.
2. Teks tersebut dikonversi menjadi elemen tombol interaktif bergaya badge:
   ```tsx
   <button 
     onClick={() => setPdfPage(pageNum)}
     className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
   >
     Halaman {pageNum}
   </button>
   ```
3. Begitu diklik, state halaman di panel kiri langsung berpindah secara instan ke halaman tersebut tanpa me-reload dokumen. Hal yang sama berlaku untuk tag waktu `[Menit MM:SS]` pada video YouTube yang langsung men-seek player ke timestamp terkait.

## 4.5 Study Toolkit: Pomodoro, Lofi, Notes, & Bookmarks
- **Pomodoro Timer Modal (`PomodoroModal.tsx`)**:
  - Timer siklus belajar (standar 25 menit fokus, 5 menit istirahat, 4 siklus).
  - Dilengkapi lonceng audio sintetis saat waktu habis.
- **Lofi Player Modal (`LofiPlayerModal.tsx`)**:
  - Pemutar audio ambient dengan generator suara latar (Brown Noise, Rain Soundscapes, Cafe Beats).
- **Mini Notes Drawer (`MiniNotesDrawer.tsx`)**:
  - Laci catatan cepat yang dapat disematkan di pojok bawah layar.
  - Memilih antara mode catatan spesifik dokumen atau catatan umum (*global scratchpad*).
- **Bookmark Drawer (`BookmarkDrawer.tsx`)**:
  - Menyimpan penanda halaman penting beserta teks yang dikutip siswa.
- **Theme Selector (`ThemeSelector.tsx`)**:
  - Mengubah variabel tema CSS: `Default Indigo`, `Warm Amber`, `Midnight Dark`, `Forest Green`, dan `Soft Lavender`.

---

# 5. SPESIFIKASI REST API & KONTRAK DATA

## 5.1 Standar Header & Autentikasi
Seluruh permintaan ke API backend FastAPI menyertakan header identitas:
- `X-Member-Id`: ID siswa yang sedang aktif (default: `MBR-GUEST` jika belum login).
- `Authorization`: `Bearer <SUPABASE_JWT_TOKEN>` (digunakan saat terhubung dengan Supabase Auth).
- Seluruh endpoint dilindungi oleh penanganan error standar: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `413 Payload Too Large`, dan `500 Internal Server Error`.

---

## 5.2 Endpoints Dokumen (`/api/documents`)

### 1. Upload & Proses Dokumen
- **Method / URL**: `POST /api/documents/upload`
- **Request Type**: `multipart/form-data`
- **Payload**: `file: UploadFile` (PDF, DOCX, PPTX, TXT maks. 5 MB)
- **Response Status**: `200 OK` (atau `413` jika > 5 MB)
- **Response JSON**:
  ```json
  {
    "id": "doc-uuid-1234",
    "filename": "Modul_Biologi_Sel.pdf",
    "title": "Modul Biologi Sel",
    "file_type": "pdf",
    "file_size_bytes": 2451000,
    "page_count": 48,
    "source_type": "file",
    "source_url": null,
    "topics": [
      "Bab 1: Struktur Sel & Membran",
      "Bab 2: Mitokondria & Respirasi",
      "Bab 3: Sintesis Protein"
    ],
    "created_at": "2026-11-16T10:00:00Z"
  }
  ```

### 2. Tambah Materi YouTube
- **Method / URL**: `POST /api/documents/youtube`
- **Payload JSON**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Pengenalan Algoritma & Struktur Data"
  }
  ```
- **Response JSON**: Sama dengan DocumentItem dengan `source_type: "youtube"`.

### 3. Ambil Daftar Dokumen Pengguna
- **Method / URL**: `GET /api/documents`
- **Response JSON**: `{"documents": [ { ...DocumentItem } ]}`

### 4. Ambil Konten Teks Dokumen
- **Method / URL**: `GET /api/documents/{id}/content`
- **Response JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "total_pages": 48,
    "pages": [
      { "page": 1, "text": "Bab 1: Struktur Sel...", "time_range": null }
    ]
  }
  ```

### 5. Hapus Dokumen
- **Method / URL**: `DELETE /api/documents/{id}`
- **Response JSON**: `{"success": true, "message": "Dokumen berhasil dihapus."}`

---

## 5.3 Endpoints Chat RAG (`/api/chat`)

- **Method / URL**: `POST /api/chat`
- **Payload JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "question": "Apa fungsi utama mitokondria?",
    "history": [
      { "role": "user", "message": "Halo" },
      { "role": "assistant", "message": "Halo! Ada yang bisa saya bantu terkait materi ini?" }
    ]
  }
  ```
- **Response Type**: `text/event-stream` (Server-Sent Events)
- **Contoh Stream Output**:
  ```text
  data: {"token": "Mitokondria "}
  data: {"token": "berfungsi "}
  data: {"token": "sebagai "}
  data: {"token": "pusat "}
  data: {"token": "respirasi "}
  data: {"token": "seluler "}
  data: {"token": "penghasil "}
  data: {"token": "energi "}
  data: {"token": "ATP "}
  data: {"token": "[Halaman 12]."}
  data: [DONE]
  ```

---

## 5.4 Endpoints Ringkasan (`/api/summary`)

- **Method / URL**: `POST /api/summary`
- **Payload JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "topic": "Bab 2: Mitokondria & Respirasi"
  }
  ```
- **Response JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "topic": "Bab 2: Mitokondria & Respirasi",
    "executive_summary": "Mitokondria adalah organel bermembran ganda yang bertindak sebagai pembangkit tenaga sel...",
    "key_points": [
      "Memiliki membran luar dan membran dalam yang berlekuk membentuk krista.",
      "Matriks mitokondria mengandung enzim siklus Krebs dan DNA sirkular.",
      "Fosforilasi oksidatif terjadi pada membran dalam melalui rantai transpor elektron."
    ],
    "glossary": [
      { "term": "Krista", "definition": "Lipatan membran dalam mitokondria untuk memperluas area permukaan reaksi." },
      { "term": "ATP", "definition": "Adenosina trifosfat, molekul penyimpan energi utama seluler." }
    ]
  }
  ```

---

## 5.5 Endpoints Kuis (`/api/quiz`)

### 1. Generate Soal Kuis Pilihan Ganda
- **Method / URL**: `POST /api/quiz/generate`
- **Payload JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "topic": "Bab 1: Struktur Sel",
    "num_questions": 3
  }
  ```
- **Response JSON (Structured Output)**:
  ```json
  {
    "questions": [
      {
        "id": 1,
        "question": "Organel manakah yang berperan utama dalam sintesis protein?",
        "options": {
          "A": "Ribosom",
          "B": "Lisosom",
          "C": "Sentriol",
          "D": "Vakuola"
        },
        "correct_answer": "A",
        "explanation": "Ribosom adalah tempat translasi asam amino menjadi polipeptida. Lisosom berfungsi untuk pencernaan intraseluler, sentriol untuk pembelahan sel, dan vakuola untuk penyimpanan cadangan makanan.",
        "page_ref": 8,
        "time_ref": null
      }
    ]
  }
  ```

### 2. Submit & Evaluasi Jawaban Kuis
- **Method / URL**: `POST /api/quiz/submit`
- **Payload JSON**:
  ```json
  {
    "document_id": "doc-uuid-1234",
    "topic": "Bab 1: Struktur Sel",
    "answers": { "1": "A", "2": "C", "3": "B" },
    "quiz_data": [ ...QuizQuestion ]
  }
  ```
- **Response JSON**:
  ```json
  {
    "score": 100.0,
    "total_questions": 3,
    "correct_answers": 3,
    "evaluations": [
      {
        "question_id": 1,
        "selected_option": "A",
        "correct_option": "A",
        "is_correct": true,
        "explanation": "Tepat sekali! Ribosom merupakan pusat sintesis protein.",
        "page_ref": 8
      }
    ]
  }
  ```

---

## 5.6 Endpoints Study Tools (`/api/bookmarks`, `/api/notes`, `/api/user`)

- `GET /api/bookmarks?document_id=...`: Mengambil daftar bookmark aktif.
- `POST /api/bookmarks`: Menyimpan bookmark baru.
- `DELETE /api/bookmarks/{id}`: Menghapus bookmark.
- `GET /api/notes?document_id=...`: Mengambil catatan belajar.
- `POST /api/notes`: Membuat catatan baru (mendukung tagging dan skop global/dokumen).
- `PUT /api/notes/{id}`: Memperbarui isi catatan.
- `DELETE /api/notes/{id}`: Menghapus catatan.
- `GET /api/user/profile`: Mengambil profil dan preferensi pengguna aktif.
- `PUT /api/user/preferences`: Memperbarui tema warna dan durasi timer Pomodoro.

---

## 5.7 Endpoints Sistem (`/api/health`)

- **Method / URL**: `GET /api/health`
- **Response JSON**:
  ```json
  {
    "status": "healthy",
    "app": "Qurio",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

---

# 6. PANDUAN INSTALASI, KONFIGURASI & MENJALANKAN APLIKASI

## 6.1 Prasyarat Perangkat Lunak
- **Python**: Versi 3.11 atau lebih tinggi.
- **Node.js**: Versi 18 LTS atau lebih tinggi (disertai `npm`).
- **Git**: Terpasang di sistem untuk sinkronisasi kode.
- **API Key**: Kunci API dari [OpenRouter](https://openrouter.ai/).

## 6.2 Konfigurasi Environment (`.env`)
Salin berkas template `.env.example` menjadi `.env` di direktori root:
```bash
cp .env.example .env
```
Isi variabel-variabel kunci berikut:
```ini
# Core
APP_NAME=Qurio
APP_ENV=development
APP_PORT=8000

# OpenRouter API Key (Wajib untuk LLM & RAG)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Database: Default lokal ke SQLite jika belum menggunakan PostgreSQL
DATABASE_URL=sqlite:///./qurio.db
# Untuk PostgreSQL Supabase:
# DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres

# Batasan Berkas
MAX_FILE_SIZE_MB=5
UPLOAD_DIR=./uploads
```

## 6.3 Menjalankan 1-Klik di Windows (`run.bat` & `stop.bat`)
Platform Qurio telah dilengkapi skrip otomasi untuk sistem operasi Windows:
- **Menjalankan Seluruh Service**:
  Cukup klik ganda berkas `run.bat` di direktori proyek. Skrip akan:
  1. Mendaftarkan path Python dan Node.js ke sesi terminal.
  2. Memeriksa ketersediaan berkas konfigurasi `.env`.
  3. Membersihkan port 8000 dan 5173 jika masih ada proses yang menggantung.
  4. Menjalankan backend FastAPI di port 8000.
  5. Menjalankan frontend Vite di port 5173.
  6. Membuka peramban secara otomatis ke `http://localhost:5173`.
- **Menghentikan Seluruh Service**:
  Klik ganda berkas `stop.bat` untuk menutup seluruh proses terminal uvicorn dan vite secara aman.

## 6.4 Menjalankan Manual melalui Terminal CLI
Jika Anda menjalankan aplikasi di Linux/macOS atau lebih memilih terminal manual:
```bash
# Terminal 1: Menjalankan Backend FastAPI (Port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Menjalankan Frontend Vite (Port 5173)
npm run dev
```

## 6.5 Menjalankan via Docker & Docker Compose
Untuk lingkungan kontainer:
```bash
# Build dan jalankan seluruh container (DB PostgreSQL pgvector, Backend, Frontend Nginx)
docker-compose up -d --build

# Periksa status kontainer
docker-compose ps

# Matikan kontainer
docker-compose down
```

---

# 7. STRATEGI PENGUJIAN & PENJAMINAN KUALITAS (QA)

## 7.1 Automated Backend Test Suite (Pytest)
Pengujian otomatis mencakup verifikasi end-to-end tanpa memerlukan mock palsu:
- **Perintah Eksekusi**:
  ```powershell
  python -m pytest tests/ -v
  ```
- **Cakupan Pengujian**:
  1. `test_health_check`: Memastikan endpoint `/api/health` merespon 200 OK dengan payload aplikasi Qurio yang valid.
  2. `test_document_upload_and_flow`: Menguji alur penuh pembuatan file PDF in-memory, proses upload, ekstraksi teks, embedding semantik, dan eksekusi chat RAG.
  3. `test_file_validation_rejections`:
     - Memverifikasi penolakan berkas berukuran 6 MB dengan status `HTTP 413 Payload Too Large`.
     - Memverifikasi penerimaan berkas PDF tebal 52 halaman (tanpa pemotongan atau error batasan halaman).
  4. `test_user_profile_and_preferences`: Menguji retrieval dan update profil siswa serta tema UI.
  5. `test_study_notes_api`: Menguji siklus CRUD catatan belajar siswa.

## 7.2 Frontend Typecheck & Build Verification
Frontend Qurio menggunakan TypeScript dengan pengaturan `strict: true`:
- **Perintah Eksekusi**:
  ```powershell
  npm run build
  ```
- **Ekspektasi**:
  1. Pemeriksaan tipe `tsc -b` tuntas tanpa satu pun error type safety.
  2. Bundler Vite menghasilkan berkas statis siap produksi di direktori `dist/` dalam waktu < 15 detik.

## 7.3 Protokol AI Coding Agent (AGENTS.md Compliance)
Setiap pengembang maupun AI Assistant (Antigravity, Cursor, Copilot) wajib menaati protokol berikut:
1. **Dilarang Menyimpan State Global di Memori**:
   ```python
   # DILARANG KERAS:
   active_docs = {}
   current_chat = []
   ```
   Seluruh data wajib tersimpan di database relasional berdasar `user_id` dan `document_id`.
2. **Explicit Error Handling**: Tidak diperkenankan menggunakan `except: pass`. Setiap exception harus dicatat dengan logging dan dilemparkan sebagai `HTTPException` dengan kode status yang tepat.
3. **Structured Pydantic Models**: Dilarang mem-parsing JSON AI menggunakan regex manual; selalu gunakan skema Pydantic v2.

---

# 8. PANDUAN DEPLOYMENT PRODUKSI & KEAMANAN

## 8.1 Setup Supabase Database & Migrasi Schema DDL
1. Masuk ke [Supabase Dashboard](https://supabase.com/).
2. Buat proyek baru dan buka menu **SQL Editor**.
3. Pastikan ekstensi `vector` aktif:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Salin dan jalankan seluruh isi berkas [`migrations/schema_postgres.sql`](migrations/schema_postgres.sql).
5. Salin Connection String (URI Pooler) dan tempel ke `DATABASE_URL` pada `.env` server produksi.

## 8.2 Reverse Proxy Nginx & Single Page Application (SPA)
Pada mode produksi, Nginx dikonfigurasi menggunakan berkas `nginx.conf`:
- Menyajikan aset statis React dari `/usr/share/nginx/html`.
- Menyediakan fallback routing SPA: `try_files $uri $uri/ /index.html;`.
- Meneruskan seluruh request `/api/` ke backend FastAPI (`http://backend:8000`) dengan header WebSocket dan streaming buffer dinonaktifkan (`proxy_buffering off;`) agar respons SSE chat berjalan lancar tanpa jeda.

## 8.3 Praktik Keamanan & Monitoring
1. **Keamanan Kredensial**: File `.env` dilarang keras di-commit ke Git (telah diproteksi di `.gitignore`).
2. **CORS Hardening**: Pada environment produksi, batasi `allow_origins` pada `app/main.py` hanya pada domain resmi Qurio.
3. **Health Check Probes**: Endpoint `/api/health` dikonfigurasi pada Docker container healthcheck (`interval: 30s`) untuk menjamin ketersediaan layanan tanpa downtime.

---
*Dokumen ini merupakan spesifikasi resmi dan panduan teknis menyeluruh platform Qurio.*
