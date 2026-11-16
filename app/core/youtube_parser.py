import re
import logging
import requests
import httpx
from typing import List, Dict, Any, Tuple, Optional
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from app.config import settings

logger = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def extract_youtube_video_id(url: str) -> Optional[str]:
    """Ekstraksi 11-karakter YouTube Video ID dari berbagai varian URL."""
    if not url:
        return None
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?\/]|$)',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})(?:[&?\/]|$)',
        r'(?:embed\/)([0-9A-Za-z_-]{11})(?:[&?\/]|$)',
        r'(?:shorts\/)([0-9A-Za-z_-]{11})(?:[&?\/]|$)'
    ]
    for pattern in patterns:
        m = re.search(pattern, url.strip())
        if m:
            return m.group(1)
    return None

def format_seconds_to_time(seconds: float) -> str:
    """Konversi detik ke format MM:SS atau HH:MM:SS."""
    sec = int(seconds)
    hours = sec // 3600
    minutes = (sec % 3600) // 60
    rem_sec = sec % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{rem_sec:02d}"
    return f"{minutes:02d}:{rem_sec:02d}"

async def fetch_youtube_metadata(video_id: str) -> Dict[str, str]:
    """Mengambil metadata judul dan author dari YouTube oEmbed endpoint."""
    target_url = f"https://www.youtube.com/watch?v=dQw4w9WgXcQ" if not video_id else f"https://www.youtube.com/watch?v={video_id}"
    oembed_url = f"https://www.youtube.com/oembed?url={target_url}&format=json"

    try:
        async with httpx.AsyncClient(timeout=8.0, headers={"User-Agent": USER_AGENT}) as client:
            resp = await client.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "title": data.get("title", f"Video YouTube ({video_id})"),
                    "author_name": data.get("author_name", "YouTube Creator"),
                    "thumbnail_url": data.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
                }
    except Exception as e:
        logger.warning(f"Gagal mengambil oEmbed metadata YouTube: {e}")

    return {
        "title": f"Video YouTube ({video_id})",
        "author_name": "YouTube Creator",
        "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
    }

def fetch_youtube_transcripts(video_id: str) -> List[Dict[str, Any]]:
    """Mengambil transkrip teks takarir dari video YouTube."""
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    try:
        api = YouTubeTranscriptApi(http_client=session)
        # Coba ambil transkrip dalam bahasa Indonesia ('id') atau Inggris ('en', 'en-US')
        fetched = api.fetch(video_id, languages=["id", "en", "en-US"])
        snippets = []
        for s in fetched.snippets:
            snippets.append({
                "text": s.text.replace("\n", " ").strip(),
                "start": s.start,
                "duration": s.duration
            })
        return snippets
    except Exception as e:
        logger.warning(f"Fetch default transcript gagal, mencoba fallback: {e}")
        try:
            # Fallback jika transcript languages tidak cocok spesifik
            api = YouTubeTranscriptApi(http_client=session)
            t_list = api.list(video_id)
            available = list(t_list)
            if not available:
                raise Exception("Tidak ada takarir yang tersedia.")

            # Ambil transcript pertama yang ada
            first_t = available[0]
            fetched = first_t.fetch()
            snippets = []
            for s in fetched.snippets:
                snippets.append({
                    "text": s.text.replace("\n", " ").strip(),
                    "start": s.start,
                    "duration": s.duration
                })
            return snippets
        except Exception as err:
            logger.error(f"Gagal mengambil transkrip YouTube untuk {video_id}: {err}")
            raise HTTPException(
                status_code=400,
                detail="Video YouTube ini tidak memiliki takarir (subtitles/transkrip) aktif. Silakan pilih video yang memiliki takarir atau unggah materi berkas (PDF/Word/PPTX/TXT)."
            )

def process_youtube_reference(video_id: str, metadata: Dict[str, str]) -> Tuple[List[Dict[str, Any]], List[str], int]:
    """
    Mengelompokkan transkrip YouTube ke dalam segmen menit bertimestamp (pages_data).
    Setiap segmen merepresentasikan rentang 2 menit (misal Menit 00:00 - 02:00).
    """
    snippets = fetch_youtube_transcripts(video_id)
    if not snippets:
        raise HTTPException(
            status_code=400,
            detail="Transkrip video YouTube kosong atau tidak dapat diakses."
        )

    # Kelompokkan ke interval 120 detik (2 menit) per halaman/segmen
    SEGMENT_SECONDS = 120
    pages_data = []
    topics = []

    current_segment_index = 0
    current_segment_lines = []
    start_time_of_segment = 0.0

    for s in snippets:
        start_sec = s["start"]
        time_tag = format_seconds_to_time(start_sec)
        line = f"[{time_tag}] {s['text']}"

        # Jika sudah melewati durasi segmen
        if start_sec >= (current_segment_index + 1) * SEGMENT_SECONDS and current_segment_lines:
            end_time_tag = format_seconds_to_time(start_sec)
            start_tag = format_seconds_to_time(start_time_of_segment)
            segment_title = f"Menit {start_tag} - {end_time_tag}"

            pages_data.append({
                "page_number": current_segment_index + 1,
                "text": "\n".join(current_segment_lines),
                "title": segment_title,
                "start_seconds": int(start_time_of_segment)
            })
            topics.append(segment_title)

            current_segment_index += 1
            current_segment_lines = [line]
            start_time_of_segment = start_sec

            if settings.MAX_PAGE_COUNT and current_segment_index >= settings.MAX_PAGE_COUNT:
                break
        else:
            current_segment_lines.append(line)

    # Tambahkan segmen terakhir
    if current_segment_lines and (not settings.MAX_PAGE_COUNT or current_segment_index < settings.MAX_PAGE_COUNT):
        last_sec = snippets[-1]["start"] + snippets[-1]["duration"]
        start_tag = format_seconds_to_time(start_time_of_segment)
        end_tag = format_seconds_to_time(last_sec)
        segment_title = f"Menit {start_tag} - {end_tag}"

        pages_data.append({
            "page_number": current_segment_index + 1,
            "text": "\n".join(current_segment_lines),
            "title": segment_title,
            "start_seconds": int(start_time_of_segment)
        })
        topics.append(segment_title)

    page_count = len(pages_data)
    if not topics:
        topics = ["Transkrip Pembahasan Video"]

    return pages_data, topics[:10], page_count
