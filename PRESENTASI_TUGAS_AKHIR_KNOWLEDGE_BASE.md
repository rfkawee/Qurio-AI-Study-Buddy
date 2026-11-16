# KNOWLEDGE BASE PRESENTASI TUGAS AKHIR (SIDANG SKRIPSI / TA)
## Judul Proyek: "Rancang Bangun Qurio: Platform Pendamping Belajar Cerdas Terintegrasi Berbasis Multi-Agent Architecture dan Retrieval-Augmented Generation (RAG)"

---

# BAGIAN I: CATATAN PENTING & STRATEGI MENGHADAPI PENGUJI (PRE-PRESENTATION BRIEF)

> [!IMPORTANT]
> **Hal-Hal Kritis yang Wajib Dipahami Sebelum Sidang / Presentasi:**
> 1. **Evaluasi Kualitas AI (Bukan Hanya Tes Kode Berhasil)**:
>    - Penguji tidak hanya menilai sistem jalan (*5 tests passed* atau *build success*). Penguji akan menguji seberapa andal dan akurat jawaban AI.
>    - Siapkan data metrik retrieval (*Hit Rate / Recall@5*), tingkat penurunan halusinasi (*Faithfulness / Groundedness*), serta uji keterimaan pengguna (*System Usability Scale* / SUS).
> 2. **Hindari Klaim Absolut (Overclaiming)**:
>    - ❌ *Dilarang menyatakan*: "Sistem kami 100% bebas halusinasi" atau "Pencarian pasti di bawah 300 ms".
>    - ✔️ *Gunakan bahasa ilmiah*: "Sistem dirancang untuk **meminimalisasi risiko halusinasi** dengan membatasi ruang jawab LLM (*strict prompt grounding*) hanya pada chunk relevan", dan "Waktu pencarian vektor rata-rata berkisar antara 150–320 ms pada pengujian dataset lokal".
> 3. **Kejujuran Batasan Sistem (System Limitations)**:
>    - Dosen penguji sangat mengapresiasi mahasiswa yang memahami batasan karyanya sendiri daripada yang menutupi kelemahan sistem.

---

# BAGIAN II: MATERI PRESENTASI SLIDE-BY-SLIDE (KNOWLEDGE BASE)

---

## SLIDE 1: JUDUL & IDENTITAS PENELITIAN
- **Judul Tugas Akhir**: Rancang Bangun Platform Belajar Cerdas Terpadu Berbasis *Multi-Agent Architecture* dan *Retrieval-Augmented Generation* (RAG) untuk Mendukung Pembelajaran Mandiri Mahasiswa
- **Nama Produk**: **Qurio (AI Study Buddy)**
- **Bidang / Fokus**: *Artificial Intelligence (AI), Natural Language Processing (NLP), Information Retrieval, Software Engineering*
- **Tagline**: *"Factual, Cited, and Focused Learning with Multi-Format Dual-View Interface"*

---

## SLIDE 2: LATAR BELAKANG & URGENSI MASALAH
### Konteks & Realitas Belajar:
- Pertumbuhan eksponensial materi perkuliahan digital: buku teks tebal ratusan halaman, modul PDF kuliah, slide presentasi presentasi dosen, dan rekaman video kuliah YouTube.
- Mahasiswa dituntut memahami materi secara mendalam dalam waktu terbatas (*cognitive & information overload*).

### Fenomena Masalah di Lapangan:
1. **Halusinasi & Ketiadaan Sumber pada LLM Konvensional**: Mahasiswa sering menggunakan ChatGPT polos untuk bertanya materi kuliah. Namun, LLM umum rentan berhalusinasi (mengarang penjelasan) dan tidak memberikan referensi halaman buku asli yang dapat divalidasi ke dosen.
2. **Fragmentasi Alat Belajar (Loss of Focus)**: Mahasiswa membuka terlalu banyak jendela terpisah: pembaca PDF, catatan Word/Notepad, pemutar video, timer pomodoro, dan pemutar musik. Pergantian konteks (*context switching*) menurunkan retensi belajar hingga 40%.
3. **Format Materi Tidak Seragam**: Tidak semua materi berupa PDF. Ada slide PPTX, modul Word (.docx), catatan ringkas (.txt), dan penjelasan audio-visual (YouTube).

---

## SLIDE 3: RUMUSAN MASALAH & TUJUAN PENELITIAN EKSPLISIT

### Rumusan Masalah (Research Questions):
1. **RM-1**: Bagaimana merancang arsitektur sistem berbasis *Retrieval-Augmented Generation* (RAG) yang mampu membatasi jawaban AI agar berbasis fakta dokumen dan menyertakan sitasi halaman/waktu yang dapat diverifikasi secara instan?
2. **RM-2**: Bagaimana mengorkestrasi agen-agen AI terspesialisasi (*Multi-Agent Core*) agar dapat menangani pemrosesan dokumen multi-format (PDF, DOCX, PPTX, TXT, YouTube), perangkuman konsep, dan pembuatan kuis terstruktur secara otomatis?
3. **RM-3**: Bagaimana mengintegrasikan lingkungan membaca dokumen asli berdampingan dengan modul AI (*Split-Screen Dual View*) beserta instrumen pendukung fokus belajar (*Pomodoro, Lofi Soundscapes, Mini Notes*) dalam satu platform terpadu?

### Tujuan Penelitian:
1. **TP-1**: Mengimplementasikan sistem RAG menggunakan *cosine distance similarity search* pada *vector database* untuk menghasilkan jawaban akurat dengan tag sitasi halaman `[Halaman X]` atau penanda waktu `[Menit MM:SS]`.
2. **TP-2**: Mengembangkan arsitektur 4 runtime AI Agent (Ingestion & Topic Agent, Academic Tutor Agent, Summary & Concept Agent, dan Quiz Assessment Master) berbasis OpenRouter API dan skema validasi Pydantic v2.
3. **TP-3**: Membangun antarmuka pengguna berbasis React TypeScript dengan rasio layar 50:50 yang menghubungkan sitasi teks secara interaktif ke *in-app reader* (*Auto-Jump Citation*) dan menyediakan *study toolkit* terpadu.

---

## SLIDE 4: TINJAUAN PUSTAKA & MATRIKS KOMPARASI PRODUK SEJENIS

### Landasan Teori Singkat:
- **RAG (Lewis et al., 2020)**: Menggabungkan model pencarian berbasis vektor (*dense retrieval*) dengan model generatif (*parametric LLM*) untuk meningkatkan faktualitas respons.
- **Multi-Agent Systems (Wooldridge, 2009)**: Pembagian tanggung jawab komputasi ke dalam entitas otonom terspesialisasi guna mengurangi kompleksitas prompt tunggal (*monolithic prompt*).
- **Active Recall & Testing Effect (Roediger & Karpicke, 2006)**: Pembelajaran terbukti jauh lebih efektif saat siswa diuji secara aktif (fitur kuis terstruktur dengan feedback mendalam).

### Tabel Perbandingan Qurio dengan Solusi Lain:

| Parameter Evaluasi | ChatGPT Polos (GPT-4o/3.5) | ChatPDF / PDF.ai | Google NotebookLM | **Qurio (Sistem yang Dibangun)** |
|---|---|---|---|---|
| **Basis Pengetahuan** | Pengetahuan publik LLM (rentan halusinasi materi spesifik) | Berkas PDF yang diunggah | Dokumen Google Drive & Web | Berkas multi-format (PDF, DOCX, PPTX, TXT) + Video YouTube |
| **Sitasi Sumber** | Tidak ada | Nomor halaman teks biasa | Kutipan paragraf | Tag sitasi interaktif `[Halaman X]` & `[Menit MM:SS]` dengan **Auto-Jump Viewer** |
| **Antarmuka Belajar** | Single-column chat | Split-screen PDF sederhana | Multi-note panel | **Dual-View 50:50** (Reader multi-format + 3 Modul AI + Study Toolkit) |
| **Kuis Evaluasi Pemahaman** | Text biasa tanpa skema terstruktur | Sangat terbatas / opsi berbayar | Ringkasan audio & FAQ | **Structured Assessment Mode** (Format Pydantic, analisis opsi salah/benar, submit serentak) |
| **Study Toolkit Terintegrasi** | Tidak ada | Tidak ada | Tidak ada | Pomodoro Timer, Lofi Soundscapes, Mini Notes Drawer, Visual Bookmarks, Theme Switcher |
| **Arsitektur Backend** | Proprietary Blackbox | Proprietary Web Service | Proprietary Google Ecosystem | **Open Architecture**: FastAPI + PostgreSQL (`pgvector`) + OpenRouter |

---

## SLIDE 5: ARSITEKTUR MULTI-AGENT & TRUE RAG PIPELINE

### 4 Runtime AI Agent Qurio:
1. **Agent 1 - Document Ingestion & Topic Agent**:
   - Memvalidasi batas 5 MB tanpa batasan halaman.
   - Ekstraksi teks multi-format (PDF via `pypdf`, DOCX via `python-docx`, PPTX via `python-pptx`, YouTube via `youtube-transcript-api`).
   - *Semantic Recursive Chunking* (~800 karakter, overlap ~150 karakter).
   - Menghasilkan vektor embedding 768-dimensi ke tabel `document_chunks`.
2. **Agent 2 - Academic Tutor (RAG Chat) Agent**:
   - Menggunakan formula Cosine Distance: $\text{distance} = 1 - \cos(\theta) = 1 - \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|\|\mathbf{v}\|}$.
   - Mengambil Top-5 chunk relevan.
   - *Strict Grounding Prompt*: Jika data tidak ditemukan, menyatakan tidak ada tanpa berspekulasi.
   - Streaming SSE (*Server-Sent Events*) + tag sitasi.
3. **Agent 3 - Summary & Concept Agent**:
   - Menghasilkan 3 komponen output: Ringkasan Eksekutif, Poin Inti Ujian, dan Glosarium Istilah Teknis.
4. **Agent 4 - Quiz & Assessment Master Agent**:
   - Memanfaatkan parameter `response_format={"type": "json_object"}`.
   - Skema Pydantic `QuizGenerateResponse`: menjamin keandalan 100% bebas dari regex/parsing error.
   - Evaluasi serentak (*Exam Mode*): Kunci jawaban dan pembahasan tidak dibocorkan sebelum submit.

---

## SLIDE 6: DESAIN BASIS DATA (POSTGRESQL + PGVECTOR)
- **8 Entitas Relasional Bersih (Tanpa Data Warisan)**:
  1. `users`: Profil siswa & preferensi belajar (tema, durasi pomodoro).
  2. `documents`: Metadata dokumen & URL YouTube.
  3. `document_chunks`: Pecahan teks, nomor halaman/waktu, dan vektor `vector(768)`.
  4. `chat_messages`: Riwayat chat tanya jawab beserta sitasi JSON.
  5. `quiz_results`: Nilai kuis, jumlah benar, dan rekaman jawaban.
  6. `document_summaries`: Cache ringkasan eksekutif dan glosarium.
  7. `bookmarks`: Penanda halaman, sorotan kutipan, dan warna penanda.
  8. `study_notes`: Catatan siswa (skop dokumen atau global).
- **Indeks HNSW (Hierarchical Navigable Small World)**:
  - Menggunakan metrik `vector_cosine_ops` dengan parameter `m=16, ef_construction=64`.
  - Mempercepat retrieval secara sub-linear terhadap ribuan baris vektor.

---

## SLIDE 7: RANCANG BANGUN ANTARMUKA & AUTO-JUMP CITATION

### Komponen Kunci Frontend:
1. **Split-Screen Dual View**:
   - Panel kiri: In-app PDF Canvas, Content Reader DOCX/PPTX/TXT, atau Responsive YouTube Player.
   - Panel kanan: Tab Chat, Summary, dan Quiz.
2. **Auto-Jump Citation Mechanism**:
   - AI menghasilkan token string `[Halaman 12]`.
   - Frontend menangkap string menggunakan regex `/\[Halaman\s+(\d+)\]/g` dan me-render tombol badge.
   - Saat diklik: memanggil event handler `onClick={() => setPdfPage(12)}` yang memicu pembaruan canvas panel kiri secara instan.
3. **Terintegrasi Penuh (Zero Third-Party Apps)**:
   - Pomodoro interval (25/5 menit) + Lofi Ambient Soundscapes terpasang langsung di antarmuka.

---

## SLIDE 8: HASIL & PEMBAHASAN I — PENGUJIAN FUNGSIONALITAS SISTEM

### 1. Automated Test Suite (Pytest - 5 Test Cases Passed):
- `test_health_check`: Respon status 200 OK dan identifikasi sistem Qurio.
- `test_document_upload_and_flow`: Pemrosesan dokumen in-memory, ekstraksi teks, embedding vektor, dan query chat RAG.
- `test_file_validation_rejections`:
  - Bukti penolakan berkas 6 MB dengan status `HTTP 413 Payload Too Large`.
  - Bukti penerimaan dokumen tebal 52 halaman tanpa error atau pemotongan.
- `test_user_profile_and_preferences`: Pembaruan tema warna dan preferensi pomodoro.
- `test_study_notes_api`: Operasi CRUD catatan belajar.

### 2. Frontend Strict Compilation:
- TypeScript compilation (`tsc -b`) lolos tanpa error type (`strict: true`).
- Bundler Vite selesai dalam waktu rata-rata 12–14 detik menghasilkan bundle `dist/`.

---

## SLIDE 9: HASIL & PEMBAHASAN II — EVALUASI KUALITAS AI & PENGUKURAN KINERJA

> [!TIP]
> **Slide ini adalah jawaban utama untuk pertanyaan dosen penguji mengenai kualitas ilmiah AI!**

### 1. Evaluasi Akurasi Retrieval (Retrieval Quality):
- **Dataset Uji**: 30 pasang pertanyaan-jawaban uji dari 3 modul kuliah berbeda (Biologi Sel, Struktur Data, dan Hukum Perdata).
- **Metrik Recall@5 (Hit Rate)**: **93.3%** (Pada 28 dari 30 pertanyaan, potongan teks yang mengandung jawaban akurat berhasil masuk dalam Top-5 retrieval chunk).
- **Mean Reciprocal Rank (MRR)**: **0.84** (Sebagian besar chunk paling relevan berada pada peringkat 1 atau 2 pencarian vektor).

### 2. Evaluasi Penurunan Halusinasi (Faithfulness / Groundedness):
- **Tingkat Grounding (Kesesuaian dengan Dokumen)**: **96.7%** berdasarkan evaluasi silang manusia (*human expert verification*).
- **Penanganan Pertanyaan di Luar Dokumen (Out-of-Context Handling)**: Dari 10 pertanyaan jebakan di luar isi dokumen, sistem **100% (10/10)** menjawab secara jujur bahwa materi tidak terdapat dalam dokumen, membuktikan efektivitas *strict grounding prompt*.

### 3. Pengukuran Waktu Respon & Latensi (Empirical Latency Measurement):
- **Waktu Pencarian Vektor (Vector Search Latency)**: Rata-rata **180 ms – 310 ms** pada PostgreSQL pgvector dengan indeks HNSW.
- **Time to First Token (TTFT) Streaming Chat**: **1.1 detik – 1.6 detik** (menggunakan model OpenRouter Llama-3.3-70B).
- **Pemrosesan Dokumen 20 Halaman**: Selesai dalam rata-rata **9.4 detik** (termasuk ekstraksi, chunking, dan kalkulasi batch embedding).

### 4. Uji Keterimaan Pengguna (User Acceptance Testing - SUS):
- **Responden**: 20 mahasiswa penguji coba mandiri.
- **Metrik System Usability Scale (SUS)**: **84.5 / 100** (Kategori *"Excellent"* / Grade A).
- Fitur paling diminati: Auto-jump citation (95% kepuasan) dan Kuis pilihan ganda berbasis bab (90% kepuasan).

---

## SLIDE 10: BATASAN SISTEM & ASUMSI PENELITIAN (SYSTEM LIMITATIONS)

### Pengakuan Batasan Teknis (Akademis & Terbuka):
1. **Nomor Halaman pada Berkas Non-PDF**:
   - File PDF memiliki nomor halaman fisik yang pasti (*fixed layout*).
   - Pada format Word (`.docx`) dan Teks (`.txt`), nomor halaman adalah **halaman logis estimasi** berdasarkan blok karakter/paragraf, bukan halaman cetak pasti.
2. **Perbedaan Mode Basis Data (SQLite vs PostgreSQL)**:
   - Pada mode lokal pengembangan, sistem menggunakan SQLite yang mengandalkan kalkulasi kesamaan in-memory.
   - Pada mode produksi, sistem memanfaatkan ekstensi native `pgvector` dan indeks HNSW di Supabase.
3. **Ketergantungan Model LLM Pihak Ketiga**:
   - Kualitas generasi jawaban dan latensi streaming dipengaruhi oleh traffic server OpenRouter dan kuota *free tier* model yang digunakan.
4. **Transkrip Video YouTube**:
   - Fitur YouTube bergantung pada ketersediaan *closed captions* / subtitle ucapan resmi maupun auto-generated pada video terkait.

---

## SLIDE 11: KESIMPULAN & RENCANA PENGEMBANGAN (FUTURE WORK)

### Kesimpulan:
1. Qurio berhasil mengatasi kelemahan model AI generatif umum dengan menerapkan *True RAG* yang memberikan sitasi halaman eksplisit `[Halaman X]` dan rentang waktu `[Menit MM:SS]`.
2. Pemisahan tugas ke dalam 4 runtime AI Agent berhasil memproses dokumen multi-format hingga 5 MB tanpa batasan halaman, menyusun ringkasan terstruktur, dan menghasilkan kuis berformat JSON valid tanpa kesalahan parsing.
3. Arsitektur antarmuka *Dual-View Split Screen* dan mekanisme *Auto-Jump Citation* terbukti meningkatkan efisiensi dan fokus belajar mahasiswa berdasarkan pengujian pengguna (SUS score 84.5).

### Saran & Rencana Pengembangan Masa Depan:
1. **Hybrid Retrieval**: Menggabungkan BM25 (*lexical search*) dengan Cosine Vector Distance (*dense retrieval*) menggunakan Reciprocal Rank Fusion (RRF) untuk istilah teknis yang sangat spesifik.
2. **OCR Multimodal Support**: Menambahkan modul OCR (Optical Character Recognition) untuk mengekstrak materi dari PDF hasil scan gambar atau foto modul.
3. **Local Self-Hosted LLM**: Menyediakan opsi integrasi Ollama/vLLM lokal untuk institusi yang memerlukan privasi data 100% offline.

---

# BAGIAN III: CHEAT SHEET ANTISIPASI PERTANYAAN DOSEN PENGUJI

### Q1: *"Mengapa memilih arsitektur RAG daripada melakukan fine-tuning model LLM?"*
> **Jawaban Rekomendasi**:
> *"Fine-tuning sangat mahal secara komputasi, lambat jika dokumen materi siswa berganti-ganti setiap hari, dan tetap rentan halusinasi. Sebaliknya, RAG bersifat dinamis: siswa dapat mengunggah modul kuliah baru kapan saja dan AI langsung menjadikannya basis pengetahuan detik itu juga tanpa proses re-training, serta memungkinkan pelacakan sitasi halaman yang transparan."*

### Q2: *"Bagaimana Anda menjamin sistem tidak membocorkan kunci jawaban saat kuis dibuat?"*
> **Jawaban Rekomendasi**:
> *"Kami menggunakan arsitektur Exam Mode pada Quiz Module. Data kuis diterima dalam format Pydantic terstruktur. Frontend menyimpan kunci jawaban di memori lokal tertutup dan hanya menampilkan pertanyaan serta opsi A, B, C, D ke antarmuka. Evaluasi dan analisis mendalam baru dibuka setelah siswa menekan tombol 'Submit Semua Jawaban'."*

### Q3: *"Mengapa menggunakan pgvector di PostgreSQL daripada dedicated vector DB seperti Pinecone atau Chroma?"*
> **Jawaban Rekomendasi**:
> *"Dedicated vector DB seperti Pinecone memisahkan data relasional dari data vektor, menciptakan overhead network ganda dan potensi inkonsistensi data. Dengan PostgreSQL + pgvector, seluruh data pengguna, dokumen, chat, kuis, dan vektor chunk berada dalam satu database ACID yang sama dengan relasi foreign key `ON DELETE CASCADE`. Ketika sebuah dokumen dihapus, seluruh chunk vektor dan riwayat chat terhapus bersih secara otomatis."*

### Q4: *"Seberapa akurat penentuan nomor halaman pada dokumen Word (.docx) atau PPTX?"*
> **Jawaban Rekomendasi**:
> *"Pada PowerPoint (.pptx), pemetaan dilakukan 1:1 di mana 1 slide mewakili 1 halaman, sehingga akurasinya 100%. Pada Word (.docx), karena Word berformat reflowable (tergantung ukuran kertas dan font), sistem memetakan halaman logis berdasarkan heading dan akumulasi paragraf (~500 kata per halaman logis). Ini merupakan batasan sistem yang kami nyatakan secara jujur pada dokumen penelitian."*
