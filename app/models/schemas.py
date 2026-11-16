from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Document Schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_path: Optional[str] = None
    file_size_bytes: int
    page_count: int
    source_type: Optional[str] = "pdf"
    topics: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]

class YouTubeReferenceRequest(BaseModel):
    url: str

class DocumentPageContent(BaseModel):
    page_number: int
    text: str
    title: Optional[str] = None
    start_seconds: Optional[int] = None

class DocumentContentResponse(BaseModel):
    document_id: str
    filename: str
    source_type: str
    pages: List[DocumentPageContent]

# Chat Schemas
class ChatMessageItem(BaseModel):
    role: str
    content: str
    citations: Optional[List[Any]] = []

class ChatMessageResponse(BaseModel):
    id: str
    document_id: str
    user_id: str
    role: str
    content: str
    citations: Optional[List[Any]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    document_id: str
    question: str
    history: Optional[List[ChatMessageItem]] = []

class ChatResponse(BaseModel):
    answer: str
    citations: List[int] = []

# Summary Schemas
class SummaryRequest(BaseModel):
    document_id: str
    topic: Optional[str] = None
    force_refresh: Optional[bool] = False

class SummaryResponse(BaseModel):
    document_id: str
    executive_summary: str
    key_points: List[str]
    glossary: Dict[str, str]

# Quiz Schemas (Structured Output)
class QuizQuestion(BaseModel):
    id: int
    question: str = Field(description="Teks pertanyaan pilihan ganda")
    options: List[str] = Field(description="4 pilihan jawaban diawali huruf 'A. ...', 'B. ...', 'C. ...', 'D. ...'")
    correct_answer: str = Field(description="Huruf jawaban yang benar: 'A', 'B', 'C', atau 'D'")
    explanation: str = Field(description="Penjelasan akademis komprehensif mengapa opsi ini benar dan opsi lain salah")
    relevant_page: int = Field(description="Nomor halaman dokumen tempat materi ini ditemukan")

class QuizGenerateRequest(BaseModel):
    document_id: str
    topic: Optional[str] = "Semua Bagian Dokumen"
    num_questions: int = Field(default=5, ge=1, le=10)

class QuizGenerateResponse(BaseModel):
    topic: str
    total_questions: int
    questions: List[QuizQuestion]

class QuizSubmitItem(BaseModel):
    question_id: int
    user_answer: Optional[str] = None # 'A', 'B', 'C', 'D'

class QuizSubmitRequest(BaseModel):
    document_id: str
    topic: str
    answers: List[QuizSubmitItem]
    questions: List[QuizQuestion]

class QuestionResultDetail(BaseModel):
    question_id: int
    question: str
    options: List[str]
    user_answer: Optional[str]
    correct_answer: str
    is_correct: bool
    explanation: str
    relevant_page: int

class QuizSubmitResponse(BaseModel):
    topic: str
    total_questions: int
    correct_count: int
    percentage: int
    message: str
    details: List[QuestionResultDetail]

class QuizHistoryItem(BaseModel):
    id: str
    document_id: str
    user_id: str
    topic: str
    total_questions: int
    score: int
    quiz_data: Any
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# User & Preferences Schemas
class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    theme: str
    preferences: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserPreferencesUpdate(BaseModel):
    display_name: Optional[str] = None
    theme: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

# Bookmark Schemas
class BookmarkCreate(BaseModel):
    document_id: str
    page_number: int = 1
    time_label: Optional[str] = None
    color: str = "yellow"
    selected_text: Optional[str] = None
    note: Optional[str] = None

class BookmarkResponse(BaseModel):
    id: str
    document_id: str
    user_id: str
    page_number: int
    time_label: Optional[str] = None
    color: str
    selected_text: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Study Note Schemas
class StudyNoteSave(BaseModel):
    document_id: Optional[str] = None
    scope: str = "document" # 'document' atau 'global'
    content: str

class StudyNoteResponse(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    scope: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
