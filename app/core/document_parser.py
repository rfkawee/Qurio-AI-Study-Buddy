import os
import logging
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger(__name__)

def extract_pdf_content(file_path: str) -> Tuple[List[Dict[str, Any]], List[str], int]:
    """Ekstraksi teks dan topik dari file PDF."""
    from pypdf import PdfReader
    try:
        reader = PdfReader(file_path)
    except Exception as e:
        logger.error(f"Gagal membaca format PDF: {e}")
        raise HTTPException(status_code=400, detail="Format PDF tidak valid atau file rusak.")

    page_count = len(reader.pages)
    if settings.MAX_PAGE_COUNT and page_count > settings.MAX_PAGE_COUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Jumlah halaman ({page_count} halaman) melebihi batas maksimum {settings.MAX_PAGE_COUNT} halaman."
        )
    if page_count == 0:
        raise HTTPException(status_code=400, detail="Dokumen PDF tidak memiliki halaman teks.")

    pages_data = []
    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        text = page.extract_text() or ""
        pages_data.append({
            "page_number": page_num,
            "text": text.strip(),
            "title": f"Halaman {page_num}"
        })

    # Ekstraksi Topik dari Outline atau heading awal
    topics = []
    try:
        outline = reader.outline
        if outline:
            def extract_outline_titles(items):
                titles = []
                for item in items:
                    if isinstance(item, list):
                        titles.extend(extract_outline_titles(item))
                    elif hasattr(item, 'title') and item.title:
                        titles.append(str(item.title).strip())
                return titles
            topics = extract_outline_titles(outline)
    except Exception as e:
        logger.warning(f"Tidak dapat membaca outline PDF: {e}")

    if not topics:
        detected = []
        for p in pages_data[:5]:
            lines = [l.strip() for l in p["text"].split("\n") if len(l.strip()) > 3]
            for l in lines:
                lower = l.lower()
                if lower.startswith("bab ") or lower.startswith("chapter ") or lower.startswith("bagian "):
                    detected.append(l)
        topics = detected[:10] if detected else ["Materi Umum (Seluruh Dokumen)"]

    return pages_data, topics, page_count


def extract_docx_content(file_path: str) -> Tuple[List[Dict[str, Any]], List[str], int]:
    """Ekstraksi teks dan topik dari file Word (.docx)."""
    import docx
    try:
        doc = docx.Document(file_path)
    except Exception as e:
        logger.error(f"Gagal membaca format DOCX: {e}")
        raise HTTPException(status_code=400, detail="Format file Word (.docx) tidak valid atau rusak.")

    topics = []
    all_paragraphs = []

    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt:
            continue
        # Deteksi heading sebagai topik
        if p.style and p.style.name and p.style.name.lower().startswith("heading"):
            topics.append(txt)
        elif txt.lower().startswith("bab ") or txt.lower().startswith("chapter "):
            topics.append(txt)
        all_paragraphs.append(txt)

    # Ekstraksi teks dalam tabel jika ada
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
            if row_text:
                all_paragraphs.append(row_text)

    if not all_paragraphs:
        raise HTTPException(status_code=400, detail="File Word (.docx) tidak memiliki konten teks.")

    # Partisi ke dalam halaman virtual (~500 kata per halaman)
    pages_data = []
    current_page_paras = []
    current_word_count = 0
    current_page_num = 1

    for p in all_paragraphs:
        words = p.split()
        current_page_paras.append(p)
        current_word_count += len(words)

        if current_word_count >= 500:
            pages_data.append({
                "page_number": current_page_num,
                "text": "\n\n".join(current_page_paras),
                "title": f"Bagian {current_page_num}"
            })
            current_page_num += 1
            current_page_paras = []
            current_word_count = 0

            if settings.MAX_PAGE_COUNT and current_page_num > settings.MAX_PAGE_COUNT:
                break

    if current_page_paras and (not settings.MAX_PAGE_COUNT or current_page_num <= settings.MAX_PAGE_COUNT):
        pages_data.append({
            "page_number": current_page_num,
            "text": "\n\n".join(current_page_paras),
            "title": f"Bagian {current_page_num}"
        })

    page_count = len(pages_data)
    if not topics:
        topics = ["Pembahasan Umum Dokumen Word"]
    else:
        topics = topics[:10]

    return pages_data, topics, page_count


def extract_pptx_content(file_path: str) -> Tuple[List[Dict[str, Any]], List[str], int]:
    """Ekstraksi teks dan topik dari file presentasi PowerPoint (.pptx)."""
    import pptx
    try:
        prs = pptx.Presentation(file_path)
    except Exception as e:
        logger.error(f"Gagal membaca format PPTX: {e}")
        raise HTTPException(status_code=400, detail="Format file PowerPoint (.pptx) tidak valid atau rusak.")

    page_count = len(prs.slides)
    if settings.MAX_PAGE_COUNT and page_count > settings.MAX_PAGE_COUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Jumlah slide ({page_count} slide) melebihi batas maksimum {settings.MAX_PAGE_COUNT} slide."
        )
    if page_count == 0:
        raise HTTPException(status_code=400, detail="Presentasi PowerPoint tidak memiliki slide.")

    pages_data = []
    topics = []

    for idx, slide in enumerate(prs.slides):
        slide_num = idx + 1
        slide_texts = []
        slide_title = f"Slide {slide_num}"

        # Ekstraksi teks dari bentuk-bentuk (shapes)
        for shape in slide.shapes:
            if shape.has_text_frame:
                txt = shape.text_frame.text.strip()
                if txt:
                    # Cek jika ini shape judul slide
                    if shape == slide.shapes.title and not slide_title.startswith("Slide "):
                        slide_title = txt
                    elif shape == slide.shapes.title:
                        slide_title = txt
                    slide_texts.append(txt)

            # Ekstraksi tabel jika ada di slide
            elif shape.has_table:
                for row in shape.table.rows:
                    row_txt = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_txt:
                        slide_texts.append(row_txt)

        # Ekstraksi catatan presenter jika ada
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                slide_texts.append(f"[Catatan Presenter: {notes}]")

        full_slide_text = "\n\n".join(slide_texts).strip()
        if slide_title and slide_title != f"Slide {slide_num}":
            topics.append(slide_title)

        pages_data.append({
            "page_number": slide_num,
            "text": full_slide_text if full_slide_text else f"(Slide {slide_num} - visual/grafik)",
            "title": slide_title
        })

    if not topics:
        topics = [f"Slide {i+1}" for i in range(min(5, page_count))]

    return pages_data, topics[:10], page_count


def extract_txt_content(file_path: str) -> Tuple[List[Dict[str, Any]], List[str], int]:
    """Ekstraksi teks dan topik dari file teks polos / Markdown (.txt, .md)."""
    try:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                content = f.read()
    except Exception as e:
        logger.error(f"Gagal membaca file teks: {e}")
        raise HTTPException(status_code=400, detail="Gagal membaca konten berkas teks.")

    content = content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Berkas teks kosong.")

    lines = content.split("\n")
    topics = []
    for line in lines:
        l = line.strip()
        if l.startswith("# ") or l.startswith("## ") or l.lower().startswith("bab "):
            clean_title = l.lstrip("#").strip()
            if clean_title:
                topics.append(clean_title)

    # Partisi per ~600 kata ke dalam halaman virtual
    words = content.split()
    pages_data = []
    chunk_size = 600
    page_num = 1

    for i in range(0, len(words), chunk_size):
        page_words = words[i:i + chunk_size]
        pages_data.append({
            "page_number": page_num,
            "text": " ".join(page_words),
            "title": f"Halaman {page_num}"
        })
        page_num += 1
        if settings.MAX_PAGE_COUNT and page_num > settings.MAX_PAGE_COUNT:
            break

    page_count = len(pages_data)
    if not topics:
        topics = ["Catatan Pembahasan Teks"]

    return pages_data, topics[:10], page_count


def parse_and_validate_document(file_path: str, filename: str) -> Tuple[List[Dict[str, Any]], List[str], int, int, str]:
    """
    Dispatcher fungsi parser berdasarkan ekstensi berkas.
    Returns:
        - pages_data: List[{"page_number": int, "text": str, "title": str}]
        - topics: List[str]
        - file_size_bytes: int
        - page_count: int
        - source_type: str ('pdf' | 'docx' | 'pptx' | 'txt')
    """
    file_size_bytes = os.path.getsize(file_path)
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Ukuran berkas ({file_size_bytes / (1024*1024):.1f} MB) melebihi batas maksimum {settings.MAX_FILE_SIZE_MB} MB."
        )

    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        pages_data, topics, page_count = extract_pdf_content(file_path)
        source_type = "pdf"
    elif ext in [".docx", ".doc"]:
        pages_data, topics, page_count = extract_docx_content(file_path)
        source_type = "docx"
    elif ext in [".pptx", ".ppt"]:
        pages_data, topics, page_count = extract_pptx_content(file_path)
        source_type = "pptx"
    elif ext in [".txt", ".md"]:
        pages_data, topics, page_count = extract_txt_content(file_path)
        source_type = "txt"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Format berkas '{ext}' tidak didukung. Format yang diterima: .pdf, .docx, .pptx, .txt, .md"
        )

    return pages_data, topics, file_size_bytes, page_count, source_type
