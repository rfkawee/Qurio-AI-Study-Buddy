# PANDUAN MENJALANKAN & MENGUJI KONEKSI (HELPER GUIDE)
**Platform: Qurio (AI Study Buddy)**

Panduan ini berisi kumpulan perintah ringkas (cheat sheet) untuk menjalankan backend, frontend, serta menguji konektivitas API (OpenRouter, Supabase, dan Database) di lingkungan Windows PowerShell.

---

## 1. Persiapan Environment (.env)

Pastikan file `.env` di folder root telah terisi dengan format berikut:

```env
# 1. OpenRouter AI API Key & Model
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/free

# 2. Supabase Configuration (Backend & Frontend)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=sb_publishable_... (atau eyJhbGciOi...)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_... (atau eyJhbGciOi...)

VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_... (atau eyJhbGciOi...)

# 3. Database URL (Default SQLite lokal)
DATABASE_URL=sqlite:///./qurio.db

# 4. Batasan Berkas
MAX_FILE_SIZE_MB=20
MAX_PAGE_COUNT=50
UPLOAD_DIR=./uploads
APP_ENV=development
```

---

## 2. Menjalankan Aplikasi

### Opsi A: Sekali Klik (Otomatis Jalankan Backend, Frontend, & Buka Browser)
Cukup klik ganda (double-click) file **`run.bat`** (atau `start.bat`) di folder root proyek, atau jalankan melalui terminal:
```cmd
run.bat
```
Script ini akan:
1. Memeriksa keberadaan Python, Node.js/npm, dan file `.env`.
2. Menjalankan backend FastAPI di port `8000`.
3. Menjalankan frontend Vite di port `5173`.
4. Otomatis membuka peramban web (*auto-jump to browser*) menuju `http://localhost:5173`.
5. Untuk menghentikan semua service, tekan sembarang tombol pada jendela launcher atau jalankan `stop.bat`.

---

### Opsi B: Manual (Dua Terminal Terpisah)
Jika ingin menjalankan secara manual pada dua jendela PowerShell terpisah:

#### Terminal 1: Backend FastAPI (Port 8000)
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Tanda sukses:* Muncul log `Uvicorn running on http://127.0.0.1:8000` dan `Database initialized successfully`.

#### Terminal 2: Frontend Vite React (Port 5173)
```powershell
$env:Path = "$env:LOCALAPPDATA\nodejs;$env:Path"
npm run dev
```
*Tanda sukses:* Muncul log `VITE v6.x.x ready in ... ms` dan `Local: http://localhost:5173/`.

---

## 3. Perintah Menguji Koneksi (Health & Connection Tests)

Jalankan perintah-perintah berikut di terminal untuk memverifikasi seluruh komponen bekerja:

### A. Uji Kesehatan Backend (Health Check)
```powershell
curl.exe -s http://127.0.0.1:8000/api/health
```
*Ekspektasi output:*
```json
{"status":"healthy","app":"Qurio","version":"1.0.0","environment":"development"}
```

---

### B. Uji Koneksi Supabase Auth
Perintah Python satu baris untuk mengecek apakah `SUPABASE_URL` dan `SUPABASE_ANON_KEY` valid ke server Supabase:
```powershell
python -c "import os, requests; from dotenv import load_dotenv; load_dotenv(); url=os.getenv('SUPABASE_URL'); key=os.getenv('SUPABASE_ANON_KEY'); r=requests.get(f'{url}/auth/v1/settings', headers={'apikey': key}); print('Status Supabase:', r.status_code, '-> OK' if r.status_code==200 else r.text)"
```
*Ekspektasi output:*
```text
Status Supabase: 200 -> OK
```

---

### C. Uji Koneksi OpenRouter API
Perintah Python satu baris untuk memverifikasi `OPENROUTER_API_KEY` aktif dan bisa menerima respons:
```powershell
python -c "import os; from dotenv import load_dotenv; from openai import OpenAI; load_dotenv(); client=OpenAI(base_url='https://openrouter.ai/api/v1', api_key=os.getenv('OPENROUTER_API_KEY')); res=client.chat.completions.create(model='openrouter/free', messages=[{'role':'user','content':'Jawab hanya kata: OK'}]); print('Tes OpenRouter:', res.choices[0].message.content.strip())"
```
*Ekspektasi output:*
```text
Tes OpenRouter: OK
```

---

### D. Menjalankan Seluruh Automated Test Suite (Pytest)
Menguji otomatis penolakan file non-PDF/tidak valid, ukuran file > 5 MB, penerimaan dokumen banyak halaman tanpa batas, ekstraksi teks, chunking, query RAG, hingga pembuatan kuis:
```powershell
python -m pytest tests/ -v
```
*Ekspektasi:* `3 passed in X.XXs`

---

### E. Verifikasi Build Frontend (Typecheck & Bundler)
Memastikan seluruh kode TypeScript strict lolos tanpa ada error tipe:
```powershell
$env:Path = "$env:LOCALAPPDATA\nodejs;$env:Path"
npm run build
```
*Ekspektasi:* Selesai dengan kode keluar 0 dan menghasilkan folder `dist/`.

---

## 4. Tautan Penting & Dashboard Pengujian

| Nama Layanan | URL di Browser | Fungsi |
| :--- | :--- | :--- |
| **Aplikasi Utama (Web)** | [http://localhost:5173](http://localhost:5173) | Landing Page, Upload PDF, & Workspace Belajar |
| **Swagger UI (Interactive API)** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Dashboard uji coba interaktif setiap endpoint FastAPI |
| **ReDoc Technical Docs** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Dokumentasi teknis OpenAPI |
| **Supabase Dashboard** | [https://supabase.com/dashboard](https://supabase.com/dashboard) | Manajemen User, Tabel Dokumen, & Logs Auth |
| **OpenRouter Dashboard** | [https://openrouter.ai/keys](https://openrouter.ai/keys) | Kelola OpenRouter API Key & Penggunaan Model |

---

## 5. Troubleshooting Cepat (FAQ)

1. **Port 8000 atau 5173 Sudah Terpakai (Port Already in Use)**:
   Matikan proses yang sedang menduduki port dengan perintah:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
   ```

2. **PowerShell Script Policy Warning (`PSSecurityException`)**:
   Jika PowerShell menolak menjalankan script, bypass untuk sesi terminal aktif:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

3. **Node/NPM Tidak Dikenali di Terminal Baru**:
   Tambahkan path Node.js portable ke sesi PowerShell:
   ```powershell
   $env:Path = "$env:LOCALAPPDATA\nodejs;$env:Path"
   ```
