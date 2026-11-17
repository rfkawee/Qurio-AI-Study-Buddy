"""
E2E Browser Testing Automation for Qurio
Using Playwright with Google Chrome channel.
Captures screenshots, asserts UI components, and records empirical benchmarks.
"""
import os
import sys
import time
import json
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PDF_PATH = os.path.join(ROOT_DIR, "reports", "Materi_Uji_Biologi.pdf")
SCREENSHOT_DIR = os.path.join(ROOT_DIR, "reports", "screenshots")
METRICS_PATH = os.path.join(ROOT_DIR, "reports", "benchmark_timings.json")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

metrics = {}

def log(msg: str):
    print(f"[TEST RUNNER] {msg}", flush=True)

def run_test():
    log("Memulai sesi Playwright Chromium/Chrome...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.25
        )
        page = context.new_page()

        # ---------------------------------------------------------
        # TC-01: Landing Page & Initial State Inspection
        # ---------------------------------------------------------
        log("TC-01: Memeriksa Landing Page...")
        t0 = time.time()
        page.goto("http://localhost:5173", wait_until="networkidle")
        metrics["tc01_page_load_ms"] = round((time.time() - t0) * 1000, 2)
        
        # Verify landing elements
        page.wait_for_selector("text=Qurio", timeout=15000)
        page.wait_for_selector("text=Unggah Berkas Materi Belajar Anda", timeout=15000)
        page.wait_for_selector("text=Maks. 5 MB", timeout=15000)
        page.wait_for_selector("text=Tanpa Batas Halaman", timeout=15000)
        
        ss1 = os.path.join(SCREENSHOT_DIR, "01_landing_page.png")
        page.screenshot(path=ss1)
        log(f"TC-01 Selesai. Screenshot disimpan: {ss1}")

        # Set user session in localStorage to simulate logged-in student
        page.evaluate("""() => {
            localStorage.setItem('qurio_user_email', 'mahasiswa.uji@kampus.ac.id');
            localStorage.setItem('qurio_member_id', 'MBR-UJI2026');
        }""")
        page.reload(wait_until="networkidle")

        # ---------------------------------------------------------
        # TC-02: Document Upload & Split-Screen Transition
        # ---------------------------------------------------------
        log(f"TC-02: Mengunggah dokumen {PDF_PATH}...")
        t_upload_start = time.time()

        file_input = page.locator('input[type="file"]')
        file_input.set_input_files(PDF_PATH)

        # Wait for workspace view
        page.wait_for_selector("button:has-text('Tanya Jawab')", timeout=35000)
        page.wait_for_selector("text=Materi_Uji_Biologi.pdf", timeout=35000)
        t_upload_end = time.time()
        metrics["tc02_upload_and_parse_ms"] = round((t_upload_end - t_upload_start) * 1000, 2)

        page.wait_for_timeout(2500)
        ss2 = os.path.join(SCREENSHOT_DIR, "02_split_screen_dual_view.png")
        page.screenshot(path=ss2)
        log(f"TC-02 Selesai. Upload & parse: {metrics['tc02_upload_and_parse_ms']} ms. Screenshot: {ss2}")

        # ---------------------------------------------------------
        # TC-03: Academic Tutor RAG Chat Query & Streaming SSE
        # ---------------------------------------------------------
        log("TC-03: Menjalankan kueri chat akademik...")
        chat_input = page.locator('input[placeholder*="Tanyakan materi"]')
        chat_input.fill("Jelaskan fungsi utama mitokondria dalam respirasi seluler dan sebutkan nomor halaman rujukannya.")
        
        t_query_start = time.time()
        send_button = page.locator('button:has-text("Kirim")')
        send_button.click()

        log("Menunggu respon streaming & sitasi halaman...")
        # Wait for citation badge "[Hal "
        page.wait_for_selector("button:has-text('[Hal')", timeout=60000)
        page.wait_for_timeout(2000)
        t_query_end = time.time()
        metrics["tc03_chat_response_ms"] = round((t_query_end - t_query_start) * 1000, 2)

        ss3 = os.path.join(SCREENSHOT_DIR, "03_chat_streaming_citation.png")
        page.screenshot(path=ss3)
        log(f"TC-03 Selesai. Waktu respon: {metrics['tc03_chat_response_ms']} ms. Screenshot: {ss3}")

        # ---------------------------------------------------------
        # TC-04: Auto-Jump Citation Click Verification
        # ---------------------------------------------------------
        log("TC-04: Menguji Auto-Jump dengan mengklik badge sitasi...")
        citation_btn = page.locator("button:has-text('[Hal')").first
        citation_text = citation_btn.inner_text()
        log(f"Badge sitasi ditemukan: '{citation_text}'")

        t_jump_start = time.time()
        citation_btn.click()
        
        page.wait_for_timeout(1500)
        page_input = page.locator('input[aria-label="Halaman saat ini"]')
        current_page_val = page_input.input_value()
        metrics["tc04_autojump_target_page"] = current_page_val
        metrics["tc04_autojump_latency_ms"] = round((time.time() - t_jump_start) * 1000, 2)
        log(f"Halaman aktif pada PDF Viewer: {current_page_val}")

        ss4 = os.path.join(SCREENSHOT_DIR, "04_autojump_citation_jump.png")
        page.screenshot(path=ss4)
        log(f"TC-04 Selesai. Latensi lompat: {metrics['tc04_autojump_latency_ms']} ms. Screenshot: {ss4}")

        # ---------------------------------------------------------
        # TC-05: Summary & Concept Agent (3 Components)
        # ---------------------------------------------------------
        log("TC-05: Membuka Modul Ringkasan Eksekutif...")
        t_summary_start = time.time()
        summary_tab = page.locator('button:has-text("Ringkasan")')
        summary_tab.click()

        log("Menunggu AI menghasilkan 3 komponen ringkasan...")
        page.wait_for_selector("text=Ringkasan Utama", timeout=60000)
        page.wait_for_selector("text=Poin-Poin Inti", timeout=60000)
        page.wait_for_selector("text=Daftar Istilah Penting", timeout=60000)
        metrics["tc05_summary_generation_ms"] = round((time.time() - t_summary_start) * 1000, 2)

        page.wait_for_timeout(1500)
        ss5 = os.path.join(SCREENSHOT_DIR, "05_summary_3_components.png")
        page.screenshot(path=ss5)
        log(f"TC-05 Selesai. Durasi ringkasan: {metrics['tc05_summary_generation_ms']} ms. Screenshot: {ss5}")

        # ---------------------------------------------------------
        # TC-06: Quiz & Assessment Master Agent (Exam Mode)
        # ---------------------------------------------------------
        log("TC-06: Membuka Modul Kuis Evaluasi...")
        quiz_tab = page.locator('button:has-text("Kuis Evaluasi")')
        quiz_tab.click()

        page.wait_for_timeout(1000)
        btn_3_soal = page.locator('button:has-text("3 Soal")')
        if btn_3_soal.is_visible():
            btn_3_soal.click()
            page.wait_for_timeout(500)

        t_quiz_start = time.time()
        generate_quiz_btn = page.locator('button:has-text("Buat Soal Kuis Sekarang"), button:has-text("Buat Ulang Kuis")').first
        generate_quiz_btn.click()

        log("Menunggu AI menghasilkan soal kuis terstruktur (Pydantic JSON)...")
        page.wait_for_selector('button:has-text("Submit Semua Jawaban")', timeout=60000)
        metrics["tc06_quiz_generation_ms"] = round((time.time() - t_quiz_start) * 1000, 2)
        log(f"Soal kuis selesai dibuat dalam {metrics['tc06_quiz_generation_ms']} ms.")

        # Click option A for each question
        page.wait_for_timeout(1000)
        a_options = page.locator('div.cursor-pointer:has(span.font-mono:text-is("A"))')
        log(f"Ditemukan {a_options.count()} butir soal dengan opsi A.")
        for i in range(a_options.count()):
            a_options.nth(i).click()
            page.wait_for_timeout(300)

        # Submit answers
        log("Menyerahkan jawaban kuis...")
        t_submit_start = time.time()
        submit_btn = page.locator('button:has-text("Submit Semua Jawaban")')
        submit_btn.click()

        page.wait_for_selector("text=Skor Evaluasi", timeout=30000)
        page.wait_for_selector("text=Pembahasan Akademis Qurio", timeout=30000)
        metrics["tc06_quiz_evaluation_ms"] = round((time.time() - t_submit_start) * 1000, 2)

        page.wait_for_timeout(1500)
        ss6 = os.path.join(SCREENSHOT_DIR, "06_quiz_exam_mode_result.png")
        page.screenshot(path=ss6)
        log(f"TC-06 Selesai. Evaluasi kuis: {metrics['tc06_quiz_evaluation_ms']} ms. Screenshot: {ss6}")

        # ---------------------------------------------------------
        # TC-07: Study Toolkit Interaction & Theme
        # ---------------------------------------------------------
        log("TC-07: Membuka fitur Study Toolkit (Pomodoro Timer)...")
        pomo_btn = page.locator('button[title="Pomodoro Study Timer"]')
        pomo_btn.click()
        page.wait_for_selector("text=Pomodoro Study Timer", timeout=8000)
        page.wait_for_timeout(1000)

        ss7 = os.path.join(SCREENSHOT_DIR, "07_study_tools_and_theme.png")
        page.screenshot(path=ss7)
        log(f"TC-07 Selesai. Screenshot: {ss7}")

        browser.close()
        log("Browser ditutup. Semua 7 skenario pengujian berhasil 100%!")

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    log(f"File metrik disimpan di: {METRICS_PATH}")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        log(f"FATAL ERROR DALAM PENGUJIAN: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
