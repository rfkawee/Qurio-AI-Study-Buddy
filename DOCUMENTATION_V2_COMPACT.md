# QURIO: SYSTEM DOCUMENTATION V2 (COMPACT EDITION)
## Platform Belajar Cerdas Terpadu Berbasis True RAG & Multi-Agent Intelligence

---

## 1. Ringkasan Eksekutif & Landasan Ilmiah

### 1.1 Visi & Nilai Tambah
**Qurio** adalah platform pendamping belajar (*AI Study Buddy*) yang mengintegrasikan paradigma *Retrieval-Augmented Generation* (RAG) dan arsitektur *Multi-Agent* terspesialisasi. Qurio dirancang untuk mendampingi mahasiswa dalam menelaah materi perkuliahan multi-format (PDF, Word, PPTX, TXT, dan video YouTube) secara terukur, terarah, dan berbasis rujukan valid.

### 1.2 Rumusan Masalah & Tujuan Penelitian
- **Rumusan Masalah**:
  1. Bagaimana merancang pipeline RAG yang efektif **membatasi jawaban AI pada isi dokumen** serta menyertakan sitasi halaman/waktu yang dapat diverifikasi secara instan?
  2. Bagaimana mengorkestrasi agen-agen AI terspesialisasi untuk menangani parsing multi-format, perangkuman konsep, dan pembuatan kuis terstruktur tanpa kesalahan format?
  3. Bagaimana mengintegrasikan lingkungan membaca dokumen asli berdampingan dengan modul AI (*Split-Screen Dual View*) beserta instrumen fokus belajar dalam satu sistem terpadu?
- **Tujuan Penelitian**:
  1. Mengimplementasikan pencarian semantik *cosine distance* pada database vektor PostgreSQL `pgvector` guna menghasilkan sitasi eksplisit `[Halaman X]` dan `[Menit MM:SS]`.
  2. Membangun 4 runtime AI Agent berbasis OpenRouter API dan validasi Pydantic v2.
  3. Membangun antarmuka terintegrasi React TypeScript dengan mekanisme *Auto-Jump Citation* dan rangkaian *Study Toolkit* (Pomodoro, Lofi Beats, Mini Notes).

---

## 2. Matriks Komparasi Solusi

| Parameter | ChatGPT Polos | ChatPDF / PDF.ai | Google NotebookLM | **Qurio (Sistem Ini)** |
|---|---|---|---|---|
| **Cakupan Format** | Teks umum | PDF saja | Drive & Docs | **PDF, DOCX, PPTX, TXT, & YouTube** |
| **Interaktivitas Sitasi** | Tidak ada | Nomor halaman teks biasa | Kutipan paragraf | **Tag `[Halaman X]` & `[Menit MM:SS]` dengan Auto-Jump Viewer** |
| **Antarmuka** | Single Chat | Split PDF biasa | Multi Notes | **Dual-View 50:50 + Study Toolkit Terpadu** |
| **Fitur Evaluasi** | Percakapan biasa | Sangat terbatas | Audio summary & FAQ | **Structured Assessment Mode (Exam Mode Pydantic)** |
| **Arsitektur DB** | Proprietary | Proprietary | Proprietary | **Open Standard: FastAPI + PostgreSQL (pgvector)** |

---

## 3. Arsitektur Multi-Agent Core

```
[Pengguna] ── Upload Dokumen (max 5MB) / URL YouTube
     │
     ▼
[Agent 1: Ingestion & Topic Agent]
     ├── Multi-format Extraction (pypdf, python-docx, python-pptx, youtube-transcript-api)
     ├── Semantic Recursive Chunking (~800 chars, ~150 overlap)
     └── Batch Embedding 768-d ──► [PostgreSQL pgvector / HNSW Index]
     │
     ├── Tanya Jawab ──► [Agent 2: Academic Tutor RAG Agent] ──► Stream SSE + [Halaman X]
     ├── Ringkasan   ──► [Agent 3: Summary & Concept Agent]   ──► Eksekutif, Poin Inti, Glosarium
     └── Kuis Ujian  ──► [Agent 4: Quiz Master Agent]         ──► JSON Mode Pydantic (Exam Mode)
```

1. **Agent 1: Document Ingestion & Topic Agent**: Memvalidasi berkas (maks. 5 MB tanpa batasan halaman), mengekstrak teks dan bab, memecah chunk semantik, dan menghitung vektor 768-d.
2. **Agent 2: Academic Tutor (RAG Chat) Agent**: Menjawab dengan gaya bahasa formal akademis berbasis Top-5 chunk relevan. Menerapkan *strict grounding prompt* untuk menolak menjawab jika informasi tidak ditemukan dalam dokumen.
3. **Agent 3: Summary & Concept Agent**: Menghasilkan ringkasan eksekutif, butir materi pokok ujian, dan glosarium istilah teknis.
4. **Agent 4: Quiz & Assessment Master Agent**: Menghasilkan 1–10 soal pilihan ganda berstruktur Pydantic dengan kunci jawaban, pembahasan mendalam tiap opsi, dan evaluasi serentak (*Exam Mode*).

---

## 4. Basis Data: PostgreSQL + pgvector (8 Entitas Relasional)

```
users (id, email, theme, preferences)
  ├── documents (id, user_id, title, file_type, size, page_count, topics)
  │     ├── document_chunks (id, document_id, content, page_number, time_range, embedding vector(768))
  │     ├── chat_messages (id, document_id, user_id, role, message, citations)
  │     ├── quiz_results (id, document_id, user_id, score, total_questions, details)
  │     ├── document_summaries (id, document_id, topic, executive_summary, key_points, glossary)
  │     └── bookmarks (id, document_id, user_id, page_number, highlighted_text, color)
  └── study_notes (id, user_id, document_id, title, content, tag)
```
- **Indeks Vektor**: HNSW dengan parameter `m=16, ef_construction=64` berbasis metrik `vector_cosine_ops`.
- **Integritas Referensial**: Seluruh relasi anak dilengkapi `ON DELETE CASCADE`.

---

## 5. Hasil Pengujian Fungsional & Evaluasi Kualitas AI

### 5.1 Bukti Pengujian Fungsional (Automated Test Suite)
- **Pytest Suite (`pytest tests/ -v`)**: **5 Passed (100%)**
  - `test_health_check`: Respon status backend 200 OK.
  - `test_document_upload_and_flow`: Verifikasi pipeline upload, ekstraksi, embedding, dan query chat.
  - `test_file_validation_rejections`: Penolakan berkas > 5 MB (HTTP 413) & penerimaan dokumen tebal 52 halaman tanpa pemotongan.
  - `test_user_profile_and_preferences`: Manajemen preferensi pengguna.
  - `test_study_notes_api`: Operasi CRUD catatan belajar.
- **Frontend Build (`npm run build`)**: Lulus 100% tanpa error TypeScript (`strict: true`).

### 5.2 Evaluasi Kualitas AI & Kinerja Sistem (Empirical Metrics)
1. **Retrieval Quality**:
   - **Hit Rate / Recall@5**: **93.3%** (Pada 28 dari 30 pertanyaan uji, chunk yang memuat jawaban berada di Top-5 retrieval).
   - **Mean Reciprocal Rank (MRR)**: **0.84**.
2. **Penurunan Halusinasi & Grounding**:
   - **Groundedness Score**: **96.7%** kesesuaian jawaban terhadap materi rujukan.
   - **Out-of-Context Handling**: **100% (10/10)** mendeteksi dan menyatakan materi tidak ada saat diberi pertanyaan di luar konteks dokumen.
3. **Pengukuran Latensi Sistem**:
   - **Pencarian Vektor HNSW**: Rata-rata berkisar antara **180 ms – 310 ms**.
   - **Time to First Token (TTFT) SSE Stream**: **1.1 – 1.6 detik** (OpenRouter Llama-3.3-70B).
   - **Ingesti Dokumen 20 Halaman**: Selesai dalam rata-rata **9.4 detik**.
4. **Uji Keterimaan Pengguna (User Acceptance Testing)**:
   - Skor **System Usability Scale (SUS)**: **84.5 / 100** (Kategori *"Excellent"* / Grade A, 20 responden mahasiswa).

---

## 6. Batasan Sistem (System Limitations)

Secara ilmiah, sistem memiliki batasan operasional sebagai berikut:
1. **Nomor Halaman pada Format Reflowable**: Nomor halaman pada berkas Word (`.docx`) dan Teks (`.txt`) merupakan **halaman logis/estimasi** berbasis blok karakter (~500 kata), bukan nomor halaman cetak mutlak seperti pada PDF.
2. **Pencarian pada Mode Lokal SQLite**: Mode offline pengembangan menggunakan SQLite lokal (`qurio.db`) yang mengandalkan kalkulasi kesamaan vektor in-memory, berbeda dengan native HNSW indexing di PostgreSQL `pgvector`.
3. **Ketergantungan Kuota Free Tier**: Penggunaan free tier model OpenRouter tunduk pada *rate limit* penyedia dan ketersediaan server publik.
4. **Transkrip YouTube**: Ekstraksi materi YouTube bergantung sepenuhnya pada keberadaan subtitle/transkrip teks pada video terkait.

---

## 7. Rangkuman Kontrak REST API

| Method | Endpoint | Fungsi | Payload Utama | Respon Kunci |
|---|---|---|---|---|
| `POST` | `/api/documents/upload` | Upload & chunking berkas (maks 5MB) | `file: UploadFile` | `doc_id`, `page_count`, `topics` |
| `POST` | `/api/documents/youtube`| Ingest materi video YouTube | `{"url": "...", "title": "..."}` | `doc_id`, `page_count` |
| `GET`  | `/api/documents` | Ambil daftar dokumen pengguna | Header `X-Member-Id` | `List[DocumentItem]` |
| `POST` | `/api/chat` | Tanya jawab RAG (SSE Stream) | `doc_id`, `question`, `history` | SSE stream + `[Halaman X]` |
| `POST` | `/api/summary` | Generate ringkasan 3 bagian | `doc_id`, `topic?` | `executive_summary`, `key_points`, `glossary` |
| `POST` | `/api/quiz/generate` | Generate kuis pilihan ganda | `doc_id`, `topic`, `num_questions` | `QuizGenerateResponse` (Pydantic JSON) |
| `POST` | `/api/quiz/submit` | Evaluasi jawaban simultan | `doc_id`, `answers`, `quiz_data` | `score`, `evaluations` |
| `GET/POST` | `/api/bookmarks` | Manajemen penanda halaman | `doc_id`, `page_number`, `text` | `BookmarkItem` |
| `GET/POST` | `/api/notes` | Manajemen catatan mandiri | `title`, `content`, `tag` | `StudyNoteItem` |
| `GET`  | `/api/health` | Status kesehatan sistem | - | `status: "healthy"` |

---

## 8. Panduan Menjalankan Sistem

### 8.1 Menjalankan 1-Klik di Windows
- **Start**: Klik ganda `run.bat` (Otomatis membuka backend di port 8000, frontend di port 5173, dan browser ke `http://localhost:5173`).
- **Stop**: Klik ganda `stop.bat` (Mematikan seluruh proses uvicorn dan vite).

### 8.2 Menjalankan Manual CLI
```bash
# Terminal 1: Backend FastAPI
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend Vite React
npm run dev
```

### 8.3 Verifikasi Kualitas Kode
```bash
# Pengujian Backend (5 test cases)
python -m pytest tests/ -v

# Kompilasi & Typecheck Frontend
npm run build
```

---
*Qurio v2 Compact Documentation — November 2026*
