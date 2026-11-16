import os
import json
import logging
import hashlib
from typing import List, Generator, Dict, Any, Optional
from app.config import settings
from app.models.schemas import QuizGenerateResponse, QuizQuestion

logger = logging.getLogger(__name__)

def get_openrouter_client() -> Optional[Any]:
    """Menginisialisasi OpenAI client yang terhubung ke OpenRouter API."""
    if not settings.OPENROUTER_API_KEY:
        return None
    try:
        from openai import OpenAI
        return OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            timeout=15.0,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Qurio"
            }
        )
    except Exception as e:
        logger.warning(f"Gagal menginisialisasi OpenRouter client: {e}")
        return None

def generate_deterministic_embedding(text: str) -> List[float]:
    """Menghasilkan vector embedding deterministik 768 dimensi."""
    hasher = hashlib.sha256(text.encode('utf-8')).digest()
    vec = []
    for i in range(768):
        byte_val = hasher[i % len(hasher)]
        vec.append(round((byte_val / 255.0) * 2 - 1, 6))
    return vec

def get_embedding(text: str) -> List[float]:
    """
    Menghasilkan vector embedding 768 dimensi via OpenRouter atau fallback deterministik.
    """
    client = get_openrouter_client()
    if client:
        # Coba model embedding OpenRouter jika tersedia
        for emb_model in ["baai/bge-base-en-v1.5", "text-embedding-3-small"]:
            try:
                kwargs: Dict[str, Any] = {"model": emb_model, "input": text}
                if emb_model == "text-embedding-3-small":
                    kwargs["dimensions"] = 768
                res = client.embeddings.create(**kwargs)
                if res and res.data and len(res.data[0].embedding) == 768:
                    return res.data[0].embedding
            except Exception as e:
                logger.debug(f"OpenRouter embedding model {emb_model} tidak tersedia: {e}")
                continue
    
    return generate_deterministic_embedding(text)

# ==============================================================================
# PROMPT TUTOR AKADEMIS RESMI QURIO
# ==============================================================================

SYSTEM_TUTOR_PROMPT_DOC = """Anda adalah 'Qurio', seorang Asisten Akademis Formal yang bertugas membantu pelajar memahami materi pembelajaran secara faktual, objektif, dan terstruktur.

ATURAN WAJIB:
1. Jawab HANYA berdasarkan konteks materi dokumen yang diberikan.
2. Gaya bahasa harus FORMAL, LUGAS, SANTUN, dan TIDAK BERTELE-TELE.
3. JANGAN berspekulasi atau menambahkan informasi di luar teks materi. Jika materi tidak ada dalam konteks, jawab dengan jujur: 'Informasi tersebut tidak ditemukan dalam materi yang dipelajari.'
4. Pada akhir setiap poin atau penjelasan fakta penting, SERTAKAN SITASI nomor halaman dalam tag khusus: [Halaman X] (contoh: [Halaman 3]).
5. Gunakan format Markdown rapi dan notasi matematika LaTeX (misal $E=mc^2$) jika relevan.
"""

SYSTEM_TUTOR_PROMPT_YOUTUBE = """Anda adalah 'Qurio', seorang Asisten Akademis Formal yang bertugas membantu pelajar memahami materi video YouTube berdasarkan transkrip secara faktual, objektif, dan terstruktur.

ATURAN WAJIB SITASI WAKTU DI SETIAP KALIMAT / PARAGRAF (SANGAT KETAT):
1. Sumber materi ini adalah video YouTube (transkrip bertimestamp). DILARANG KERAS menggunakan sitasi nomor halaman seperti [Halaman X].
2. WAJIB MENYERTAKAN SITASI DI SETIAP KALIMAT PENJELAS, BUTIR POIN, DAN AKHIR PARAGRAF:
   Setiap kalimat yang menjelaskan fakta, konsep, definisi, langkah, atau argumen WAJIB diakhiri dengan tag sitasi menit atau rentang waktu video dalam format:
   [Menit MM:SS] atau [Menit MM:SS - MM:SS] (contoh: [Menit 01:46 - 01:58] atau [Menit 03:25]).
   JANGAN PERNAH menulis kalimat penjelasan tanpa tag sitasi menit di ujung kalimat tersebut!
3. Gaya bahasa harus FORMAL, LUGAS, SANTUN, dan TIDAK BERTELE-TELE.
4. Jawab HANYA berdasarkan transkrip yang diberikan. JANGAN berspekulasi. Jika tidak ada di transkrip, nyatakan: 'Informasi tersebut tidak ditemukan dalam transkrip video.'
5. Gunakan format Markdown rapi dan terstruktur.
"""

def generate_chat_stream(
    question: str,
    context_chunks: List[Dict[str, Any]],
    history: List[Dict[str, Any]] = None,
    source_type: str = "pdf",
    topics: Optional[List[str]] = None
) -> Generator[str, None, None]:
    """Menghasilkan streaming response token via OpenRouter API."""
    is_yt = source_type == "youtube"
    system_prompt = SYSTEM_TUTOR_PROMPT_YOUTUBE if is_yt else SYSTEM_TUTOR_PROMPT_DOC

    if is_yt:
        formatted_chunks = []
        for c in context_chunks:
            p_num = c.get("page_number", 1)
            if topics and 1 <= p_num <= len(topics):
                time_range = topics[p_num - 1]
            else:
                s_min = (p_num - 1) * 2
                e_min = p_num * 2
                time_range = f"Menit {s_min:02d}:00 - {e_min:02d}:00"
            formatted_chunks.append(f"[Konteks Transkrip Video - Segmen {time_range}]:\n{c['content']}")
        context_text = "\n\n---\n\n".join(formatted_chunks)

        prompt = f"""Berikut adalah kutipan transkrip materi dari video YouTube:
{context_text}

Pertanyaan Siswa: {question}

Instruksi Khusus Sitasi (Wajib Dipatuhi 100%):
1. Berikan jawaban akademis formal yang terstruktur, padat, dan akurat berdasarkan transkrip.
2. WAJIB MENYERTAKAN SITASI DI SETIAP KALIMAT ATAU PARAGRAF:
   Setiap kalimat fakta, butir penjelasan (*bullet point*), dan setiap paragraf WAJIB diakhiri dengan tag sitasi menit atau rentang waktu video dalam format [Menit MM:SS] atau [Menit MM:SS - MM:SS] (misal: [Menit 01:46 - 01:58] atau [Menit 04:12]) berdasarkan timestamp yang tercantum pada transkrip di atas.
   Pastikan tidak ada satupun kalimat penjelasan fakta yang terlewat tanpa tag sitasi waktu!
   Jika ada lebih dari satu referensi waktu, tuliskan secara terpisah, misalnya: [Menit 01:46 - 01:52] [Menit 05:03].
3. DILARANG KERAS menggunakan format sitasi nomor halaman [Halaman X]."""
    else:
        context_text = "\n\n---\n\n".join([
            f"[Konteks Halaman {c['page_number']}]:\n{c['content']}"
            for c in context_chunks
        ])
        
        prompt = f"""Berikut adalah kutipan materi dari dokumen belajar siswa:
{context_text}

Pertanyaan Siswa: {question}

Instruksi: Berikan jawaban akademis formal yang tepat, ringkas, dan sertakan sitasi [Halaman X] untuk fakta yang bersangkutan."""

    # 1. OpenRouter Streaming (Model Free tanpa batasan ketat)
    or_client = get_openrouter_client()
    if or_client:
        candidate_models = [settings.OPENROUTER_MODEL, "openrouter/free", "google/gemma-4-31b-it:free", "meta-llama/llama-3.3-70b-instruct:free"]
        for model_name in candidate_models:
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                ]
                if history:
                    for h in history[-6:]:
                        role = "assistant" if h.get("role") == "assistant" else "user"
                        messages.append({"role": role, "content": h.get("content", "")})
                messages.append({"role": "user", "content": prompt})

                stream = or_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    stream=True,
                    temperature=0.3,
                    timeout=15.0
                )
                has_yielded = False
                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        has_yielded = True
                        yield chunk.choices[0].delta.content
                if has_yielded:
                    return
            except Exception as e:
                logger.warning(f"OpenRouter chat model {model_name} gagal: {e}, mencoba alternatif...")
                continue

    # Fallback streaming jika koneksi OpenRouter belum dikonfigurasi / offline
    if is_yt:
        yield f"Berdasarkan analisis transkrip materi video YouTube:\n\n"
        if context_chunks:
            ref_page = context_chunks[0]['page_number']
            if topics and 1 <= ref_page <= len(topics):
                time_label = topics[ref_page - 1]
            else:
                time_label = f"Menit {(ref_page - 1) * 2:02d}:00 - {ref_page * 2:02d}:00"
            sample_snippet = context_chunks[0]['content'][:150].replace("\n", " ")
            yield f"Pembahasan materi terkait pertanyaan '{question}' diuraikan secara rinci pada video ini [{time_label}].\n\n"
            yield f"Transkrip menyatakan secara langsung bahwa konsep ini relevan dengan topik yang dipelajari: \"{sample_snippet}...\" [{time_label}].\n\n"
            yield f"Setiap segmen video memberikan uraian terstruktur guna mempermudah pemahaman siswa [{time_label}].\n"
        else:
            yield "Informasi terkait belum ditemukan dalam transkrip video yang dipilih.\n"
    else:
        yield f"Berdasarkan analisis materi pada dokumen:\n\n"
        if context_chunks:
            ref_page = context_chunks[0]['page_number']
            sample_snippet = context_chunks[0]['content'][:200]
            yield f"Materi terkait pertanyaan '{question}' ditemukan pada [Halaman {ref_page}]:\n\n"
            yield f"> \"{sample_snippet}...\"\n\n"
            yield f"Penjelasan akademis menunjukkan konsep tersebut berperan penting dalam materi ini. [Halaman {ref_page}]\n"
        else:
            yield "Informasi terkait belum ditemukan dalam konteks dokumen yang dipilih.\n"

# ==============================================================================
# PEMBUATAN KUIS TERSTRUKTUR (OPENROUTER JSON)
# ==============================================================================

def generate_structured_quiz(
    topic: str,
    num_questions: int,
    context_chunks: List[Dict[str, Any]]
) -> QuizGenerateResponse:
    """Membuat kuis pilihan ganda terstruktur dengan skema Pydantic via OpenRouter."""
    context_text = "\n\n".join([
        f"(Halaman {c['page_number']}): {c['content']}"
        for c in context_chunks[:15]
    ])

    prompt = f"""Buatkan {num_questions} butir soal pilihan ganda akademis berdasarkan materi berikut:
Topik: {topic}

Konteks Dokumen:
{context_text}

Aturan Kuis:
1. Setiap soal harus memiliki 4 opsi jawaban diawali huruf 'A. ', 'B. ', 'C. ', 'D. '.
2. Berikan kunci jawaban yang tepat ('A', 'B', 'C', atau 'D').
3. Berikan analisis akademis mendalam mengapa jawaban tersebut benar dan mengapa opsi lain salah.
4. Tulis nomor halaman rujukan dokumen yang valid."""

    or_client = get_openrouter_client()
    if or_client:
        candidate_models = [settings.OPENROUTER_MODEL, "openrouter/free", "google/gemma-4-31b-it:free", "meta-llama/llama-3.3-70b-instruct:free"]
        for model_name in candidate_models:
            try:
                system_quiz = (
                    "Anda adalah Quiz & Assessment Master. Buat kuis pilihan ganda akademis berdasarkan materi teks. "
                    "Kembalikan HANYA JSON murni yang sesuai dengan skema: "
                    '{"topic": string, "total_questions": int, "questions": [{"id": int, "question": string, "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct_answer": "A"|"B"|"C"|"D", "explanation": string, "relevant_page": int}]}'
                )
                res = or_client.chat.completions.create(
                    model=model_name,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": system_quiz},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                raw_text = res.choices[0].message.content or "{}"
                data = json.loads(raw_text)
                if isinstance(data, list):
                    data = {"topic": topic, "total_questions": len(data), "questions": data}
                elif "questions" not in data and "quiz" in data:
                    data["questions"] = data["quiz"]
                if "topic" not in data:
                    data["topic"] = topic
                if "total_questions" not in data:
                    data["total_questions"] = len(data.get("questions", []))
                
                # Standarisasi format opsi A., B., C., D.
                for idx, q in enumerate(data.get("questions", [])):
                    if "id" not in q:
                        q["id"] = idx + 1
                    opts = q.get("options", [])
                    formatted_opts = []
                    prefixes = ["A. ", "B. ", "C. ", "D. "]
                    for i, opt in enumerate(opts[:4]):
                        opt_str = str(opt).strip()
                        if not any(opt_str.startswith(p) for p in ["A.", "B.", "C.", "D."]):
                            formatted_opts.append(f"{prefixes[i]}{opt_str}")
                        else:
                            formatted_opts.append(opt_str)
                    while len(formatted_opts) < 4:
                        formatted_opts.append(f"{prefixes[len(formatted_opts)]}Opsi pelengkap.")
                    q["options"] = formatted_opts
                    if not q.get("correct_answer") or q["correct_answer"] not in ["A", "B", "C", "D"]:
                        q["correct_answer"] = "A"
                    if not q.get("relevant_page"):
                        q["relevant_page"] = context_chunks[0]["page_number"] if context_chunks else 1

                if data.get("questions"):
                    return QuizGenerateResponse(**data)
            except Exception as e:
                logger.warning(f"OpenRouter quiz model {model_name} gagal: {e}, mencoba berikutnya...")
                continue

    # Fallback kuis jika OpenRouter offline
    sample_page = context_chunks[0]['page_number'] if context_chunks else 1
    fallback_questions = []
    for i in range(1, num_questions + 1):
        fallback_questions.append(QuizQuestion(
            id=i,
            question=f"Berdasarkan pembahasan pada {topic}, manakah pernyataan berikut yang paling tepat mengenai konsep utama? (Soal Latihan #{i})",
            options=[
                f"A. Konsep utama dibahas secara mendalam dengan prinsip fundamental pada halaman {sample_page}.",
                "B. Konsep tersebut tidak relevan dengan pembahasan dokumen.",
                "C. Materi ini hanya bersifat hipotesis tanpa bukti faktual.",
                "D. Tidak ada kesimpulan yang dapat ditarik dari pembahasan tersebut."
            ],
            correct_answer="A",
            explanation=f"Opsi A benar karena prinsip fundamental materi dijelaskan secara eksplisit pada konteks dokumen. Opsi B, C, dan D tidak sesuai dengan fakta teks.",
            relevant_page=sample_page
        ))

    return QuizGenerateResponse(
        topic=topic,
        total_questions=len(fallback_questions),
        questions=fallback_questions
    )

# ==============================================================================
# RINGKASAN MATERI (OPENROUTER JSON)
# ==============================================================================

def generate_document_summary(
    doc_title: str,
    combined_context: str,
    topic: Optional[str] = None
) -> Dict[str, Any]:
    """Membuat ringkasan eksekutif, poin inti, dan glosarium via OpenRouter."""
    prompt = f"""Buatkan telaah materi pembelajaran terstruktur dalam format JSON murni:
Dokumen: {doc_title}
Topik Spesifik: {topic or 'Seluruh Materi'}

Konteks Materi:
{combined_context[:15000]}

Format JSON Wajib:
{{
  "executive_summary": "1-2 paragraf ringkasan eksekutif padat...",
  "key_points": ["Poin 1...", "Poin 2...", "Poin 3..."],
  "glossary": {{"Istilah 1": "Definisi...", "Istilah 2": "Definisi..."}}
}}"""

    or_client = get_openrouter_client()
    if or_client:
        candidate_models = [settings.OPENROUTER_MODEL, "openrouter/free", "google/gemma-4-31b-it:free", "meta-llama/llama-3.3-70b-instruct:free"]
        for model_name in candidate_models:
            try:
                res = or_client.chat.completions.create(
                    model=model_name,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": "Anda adalah Asisten Akademis Formal. Selalu keluarkan JSON murni sesuai skema yang diminta."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )
                raw = res.choices[0].message.content or "{}"
                data = json.loads(raw)
                if isinstance(data, list) and len(data) > 0:
                    data = data[0]
                if "executive_summary" in data:
                    return {
                        "executive_summary": data.get("executive_summary", ""),
                        "key_points": data.get("key_points", []),
                        "glossary": data.get("glossary", {})
                    }
            except Exception as e:
                logger.warning(f"OpenRouter summary model {model_name} gagal: {e}, mencoba alternatif...")
                continue

    # Fallback akademis jika OpenRouter offline
    return {
        "executive_summary": (
            f"Dokumen '{doc_title}' mencakup pembahasan akademis komprehensif. "
            f"Materi ini menekankan pada pemahaman konsep fundamental, hubungan kausalitas antar variabel, "
            f"serta aplikasi praktis dalam konteks studi terkait."
        ),
        "key_points": [
            f"Konsep dasar diperkenalkan secara sistematis pada bab awal ({topic or 'Pendahuluan'}).",
            "Prinsip kerja dan metodologi utama dijabarkan dengan pembuktian analitis yang runtut.",
            "Analisis komparatif menunjukkan pentingnya validasi parameter dalam pemecahan masalah.",
            "Kesimpulan materi menegaskan integrasi antara teori dengan implementasi nyata pada studi kasus."
        ],
        "glossary": {
            "Konsep Fundamental": "Gagasan dasar yang menjadi fondasi bangunan teori suatu bidang ilmu.",
            "Analisis Kausal": "Pendekatan kajian untuk mengidentifikasi hubungan sebab-akibat antar fenomena.",
            "Validasi Parameter": "Proses verifikasi kecocokan nilai acuan terhadap standar ilmiah yang berlaku."
        }
    }
