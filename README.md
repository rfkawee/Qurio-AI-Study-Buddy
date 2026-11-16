# Qurio: AI Study Buddy

Qurio is an interactive, multi-agent academic study companion designed for students and self-learners. Powered by FastAPI, React 18, TypeScript, and OpenRouter LLMs with PostgreSQL pgvector RAG, Qurio transforms study documents and educational videos into active learning sessions.

---

## Key Features

1. **Dual-View Split Screen Interface**
   - **Left Panel**: In-app reader for PDF, Word (.docx), PowerPoint (.pptx), plain text (.txt), and embedded YouTube video player.
   - **Right Panel**: Three interactive study modules (Chat Tutor, Structured Summary, and Quiz Assessment).

2. **Academic Tutor (RAG Chat Agent)**
   - Answers student questions strictly based on the uploaded document or video transcript.
   - Grounded responses with precise citations: `[Halaman X]` for documents and `[Menit MM:SS]` for YouTube timestamps.
   - Interactive auto-jump: Clicking citation badges immediately navigates the left viewer to the exact source.

3. **Structured Assessment (Quiz Master Agent)**
   - Generates customized multiple-choice quizzes (1-10 questions) targeting specific chapters or topics.
   - Comprehensive feedback: In-depth explanations for why the correct option is right and other options are incorrect.
   - Exam mode with simultaneous submission and score analytics.

4. **Executive Summary & Concept Agent**
   - Synthesizes key takeaways into an executive overview, exam-focused key bullet points, and a technical terms glossary.

5. **Integrated Study Toolkit**
   - **Pomodoro Timer**: Customizable focus and break intervals with audio notifications.
   - **Lofi Beats Player**: Integrated ambient soundscapes for focused studying.
   - **Mini Notes**: Document-scoped and global scratchpad notes.
   - **Visual Bookmarks**: Save and jump to key reading locations.
   - **Theme Switcher**: Multiple ergonomic color palettes.

---

## System Architecture

```
User (Student / Learner)
   │
   ├── Upload Study Materials (PDF, DOCX, PPTX, TXT, YouTube URL)
   ▼
[Qurio Multi-Agent Engine]
   ├── Document Ingestion & Topic Agent (Extraction, Chunking, Embeddings)
   ├── Academic Tutor Agent (Cosine Distance Similarity Search & SSE Streaming)
   ├── Summary & Concept Agent (Executive Brief, Core Takeaways, Glossary)
   └── Quiz Assessment Master (Structured Pydantic JSON Output)
   ▼
[PostgreSQL + pgvector / Supabase Storage]
   ├── users & study_notes
   ├── documents & document_chunks (768-dim embeddings)
   └── chat_messages, quiz_results & bookmarks
```

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, PyPDF, python-docx, python-pptx, youtube-transcript-api.
- **Frontend**: React 18, TypeScript (Strict), Vite 6, Tailwind CSS, Lucide Icons.
- **AI & Reasoning**: OpenRouter API (LLM inference, structured output, and text embeddings).
- **Database**: PostgreSQL 16 with pgvector extension (Supabase-ready) / Local SQLite development mode.
- **Deployment**: Docker, Docker Compose, Nginx.

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher (LTS recommended)
- OpenRouter API Key

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rfkawee/Qurio-AI-Study-Buddy.git
   cd Qurio-AI-Study-Buddy
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and provide your `OPENROUTER_API_KEY`.

3. **Install dependencies:**
   ```bash
   # Python dependencies
   pip install -r requirements.txt

   # Node.js dependencies
   npm install
   ```

4. **Launch the application:**
   - **On Windows:** Double-click `run.bat` or run:
     ```cmd
     run.bat
     ```
   - **Manual CLI:**
     ```bash
     # Terminal 1: Backend
     python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

     # Terminal 2: Frontend
     npm run dev
     ```

5. **Access the web app:**
   - Frontend UI: `http://localhost:5173`
   - Backend API Docs: `http://127.0.0.1:8000/docs`

---

## Verification & Testing

- **Backend Unit Tests:**
  ```bash
  python -m pytest tests/ -v
  ```
- **Frontend Typecheck & Build:**
  ```bash
  npm run build
  ```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
