"""
generate_docs_docx.py
Script to generate DOCUMENTATION_END_TO_END.docx from DOCUMENTATION_END_TO_END.md using python-docx.
Includes professional typography, headers, callouts, and styled tables.
"""

import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding for a cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)

def create_document():
    doc = Document()

    # Set page margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # -------------------------------------------------------------
    # Cover / Header Title
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(30)
    title_p.paragraph_format.space_after = Pt(6)
    title_run = title_p.add_run("QURIO: AI STUDY BUDDY")
    title_run.font.name = "Calibri"
    title_run.font.size = Pt(26)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(49, 46, 129) # Deep Indigo

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(20)
    sub_run = sub_p.add_run("Dokumentasi Arsitektur Sistem, Multi-Agent Engine & Panduan Teknis End-to-End")
    sub_run.font.name = "Calibri"
    sub_run.font.size = Pt(13)
    sub_run.font.color.rgb = RGBColor(79, 70, 229) # Indigo 600

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_after = Pt(24)
    meta_run = meta_p.add_run("Versi: 1.0.0  |  Tanggal: November 2026  |  Platform: FastAPI + React TypeScript + OpenRouter")
    meta_run.font.name = "Calibri"
    meta_run.font.size = Pt(10)
    meta_run.font.italic = True
    meta_run.font.color.rgb = RGBColor(100, 116, 139) # Slate 500

    # Horizontal divider rule
    divider_p = doc.add_paragraph()
    divider_p.paragraph_format.space_after = Pt(20)
    p_pr = divider_p._p.get_or_add_pPr()
    p_bdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="18" w:space="1" w:color="4F46E5"/></w:pBdr>')
    p_pr.append(p_bdr)

    # Read markdown source
    md_path = "DOCUMENTATION_END_TO_END.md"
    if not os.path.exists(md_path):
        print(f"File {md_path} tidak ditemukan!")
        return

    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(tbl_lines):
        if not tbl_lines:
            return
        # Parse rows
        rows_data = []
        for line in tbl_lines:
            line_str = line.strip()
            if not line_str.startswith("|"):
                continue
            # Check if divider row like |--|--|
            if re.match(r"^\|(\s*[-:]+[-| :]*)\|?$", line_str):
                continue
            cells = [c.strip() for c in line_str.split("|")[1:-1]]
            if cells:
                rows_data.append(cells)

        if not rows_data:
            return

        cols_count = max(len(r) for r in rows_data)
        tbl = doc.add_table(rows=len(rows_data), cols=cols_count)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        for r_idx, r_cells in enumerate(rows_data):
            for c_idx in range(cols_count):
                cell_text = r_cells[c_idx] if c_idx < len(r_cells) else ""
                cell = tbl.cell(r_idx, c_idx)
                cell.text = cell_text
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)

                # Style paragraph inside cell
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(2)
                cp.paragraph_format.space_after = Pt(2)
                if r_idx == 0:
                    # Header row
                    set_cell_background(cell, "312E81") # Deep Indigo
                    for run in cp.runs:
                        run.font.name = "Calibri"
                        run.font.size = Pt(9.5)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                else:
                    if r_idx % 2 == 1:
                        set_cell_background(cell, "F8FAFC") # Slate 50
                    else:
                        set_cell_background(cell, "FFFFFF")
                    for run in cp.runs:
                        run.font.name = "Calibri"
                        run.font.size = Pt(9)
                        run.font.color.rgb = RGBColor(30, 41, 59)

        # Space after table
        after_p = doc.add_paragraph()
        after_p.paragraph_format.space_before = Pt(6)
        after_p.paragraph_format.space_after = Pt(6)

    def flush_code(c_lines):
        if not c_lines:
            return
        code_p = doc.add_paragraph()
        code_p.paragraph_format.space_before = Pt(6)
        code_p.paragraph_format.space_after = Pt(8)
        code_p.paragraph_format.left_indent = Inches(0.2)
        
        # Border and background for code
        p_pr = code_p._p.get_or_add_pPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F1F5F9"/>') # Slate 100
        p_pr.append(shd)

        joined_code = "".join(c_lines)
        c_run = code_p.add_run(joined_code.rstrip())
        c_run.font.name = "Consolas"
        c_run.font.size = Pt(8.5)
        c_run.font.color.rgb = RGBColor(15, 23, 42)

    # Skip initial markdown title lines since cover is already written
    start_idx = 0
    for idx, l in enumerate(lines):
        if l.startswith("# 1. IKHTISAR") or l.startswith("# DAFTAR ISI"):
            start_idx = idx
            break

    for line in lines[start_idx:]:
        raw = line.rstrip("\r\n")

        # Code block handler
        if raw.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                flush_code(code_lines)
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(raw + "\n")
            continue

        # Table handler
        if raw.strip().startswith("|"):
            in_table = True
            table_lines.append(raw)
            continue
        elif in_table:
            in_table = False
            flush_table(table_lines)
            table_lines = []

        # Headings
        if raw.startswith("# "):
            h_text = raw[2:].strip()
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(20)
            hp.paragraph_format.space_after = Pt(8)
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(17)
            hrun.font.bold = True
            hrun.font.color.rgb = RGBColor(30, 27, 75) # Very dark indigo
        elif raw.startswith("## "):
            h_text = raw[3:].strip()
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(14)
            hp.paragraph_format.space_after = Pt(6)
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(13.5)
            hrun.font.bold = True
            hrun.font.color.rgb = RGBColor(49, 46, 129)
        elif raw.startswith("### "):
            h_text = raw[4:].strip()
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(10)
            hp.paragraph_format.space_after = Pt(4)
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(11.5)
            hrun.font.bold = True
            hrun.font.color.rgb = RGBColor(67, 56, 202)
        elif raw.startswith("---"):
            dp = doc.add_paragraph()
            dp.paragraph_format.space_before = Pt(8)
            dp.paragraph_format.space_after = Pt(8)
            p_pr = dp._p.get_or_add_pPr()
            p_bdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
            p_pr.append(p_bdr)
        elif raw.startswith("- ") or raw.startswith("* "):
            bp = doc.add_paragraph(style="List Bullet")
            bp.paragraph_format.space_before = Pt(2)
            bp.paragraph_format.space_after = Pt(2)
            b_text = raw[2:].strip()
            # Clean bold text
            parts = re.split(r"(\*\*.*?\*\*)", b_text)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = bp.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = bp.add_run(part)
                r.font.name = "Calibri"
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(30, 41, 59)
        elif re.match(r"^\d+\.\s+", raw):
            match = re.match(r"^\d+\.\s+(.*)$", raw)
            np = doc.add_paragraph(style="List Number")
            np.paragraph_format.space_before = Pt(2)
            np.paragraph_format.space_after = Pt(2)
            n_text = match.group(1) if match else raw
            parts = re.split(r"(\*\*.*?\*\*)", n_text)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = np.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = np.add_run(part)
                r.font.name = "Calibri"
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(30, 41, 59)
        elif raw.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(5)
            p.paragraph_format.line_spacing = 1.15
            parts = re.split(r"(\*\*.*?\*\*)", raw)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = p.add_run(part)
                r.font.name = "Calibri"
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(30, 41, 59)

    # In case ending with a table
    if in_table:
        flush_table(table_lines)

    output_path = "DOCUMENTATION_END_TO_END.docx"
    doc.save(output_path)
    print(f"Sukses! Dokumen Word berhasil dibuat: {output_path}")

if __name__ == "__main__":
    create_document()
