"""
Helper script to generate Materi_Uji_Biologi.pdf for browser E2E testing.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_biologi_pdf(output_path: str = "reports/Materi_Uji_Biologi.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=letter)
    
    # Halaman 1: Struktur Sel dan Membran Plasma
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 720, "Bab 1: Struktur Sel dan Membran Plasma")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "Sel merupakan unit struktural dan fungsional terkecil dari seluruh makhluk hidup.")
    c.drawString(72, 670, "Membran plasma memiliki struktur bilayer fosfolipid dengan protein integral dan perifer.")
    c.drawString(72, 650, "Sifat membran plasma bersifat selektif permeabel (semipermeabel) yang mengatur zat masuk dan keluar.")
    c.drawString(72, 630, "Sitoplasma merupakan cairan koloid di dalam sel tempat berlangsungnya metabolisme dasar.")
    c.drawString(72, 610, "Nukleus mengendalikan seluruh aktivitas sel dan menyimpan materi genetik berupa DNA kromosom.")
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(72, 80, "Halaman 1 - Modul Biologi Sel Qurio")
    c.showPage()
    
    # Halaman 2: Mitokondria dan Metabolisme Energi ATP
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 720, "Bab 2: Mitokondria dan Metabolisme Energi ATP")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "Mitokondria adalah organel bermembran ganda yang bertindak sebagai pusat respirasi seluler.")
    c.drawString(72, 670, "Fungsi utama mitokondria adalah menghasilkan energi kimia dalam bentuk molekul ATP (Adenosina Trifosfat).")
    c.drawString(72, 650, "Membran dalam mitokondria berlekuk-lekuk membentuk krista untuk memperluas area fosforilasi oksidatif.")
    c.drawString(72, 630, "Matriks mitokondria mengandung enzim siklus Krebs, ribosom sendiri, dan DNA mitokondria (mtDNA).")
    c.drawString(72, 610, "Respirasi seluler aerobik memecah glukosa dan oksigen menjadi ATP, air, dan karbon dioksida.")
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(72, 80, "Halaman 2 - Modul Biologi Sel Qurio")
    c.showPage()
    
    # Halaman 3: Sintesis Protein dan Ribosom
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 720, "Bab 3: Sintesis Protein dan Ribosom")
    c.setFont("Helvetica", 11)
    c.drawString(72, 690, "Ribosom merupakan organel non-membran yang bertanggung jawab penuh dalam sintesis protein sel.")
    c.drawString(72, 670, "Proses sintesis protein terdiri dari dua tahap utama: transkripsi di nukleus dan translasi di ribosom.")
    c.drawString(72, 650, "Retikulum Endoplasma Kasar (REK) memiliki ribosom yang menempel pada permukaan membrannya.")
    c.drawString(72, 630, "Badan Golgi memproses, memodifikasi, dan mengemas protein yang dihasilkan sebelum diekspor ke luar sel.")
    c.drawString(72, 610, "Lisosom mengandung enzim hidrolitik asam yang berfungsi untuk pencernaan intraseluler organel rusak.")
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(72, 80, "Halaman 3 - Modul Biologi Sel Qurio")
    c.showPage()
    
    c.save()
    print(f"PDF berhasil dibuat: {output_path}")

if __name__ == "__main__":
    create_biologi_pdf()
