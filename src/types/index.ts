// Antarmuka tipe data frontend Qurio

export type DocumentSourceType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'youtube';

export interface DocumentItem {
  id: string;
  filename: string;
  file_path?: string;
  file_size_bytes: number;
  page_count: number;
  source_type?: DocumentSourceType;
  topics: string[];
  created_at: string;
}

export interface DocumentPageContent {
  page_number: number;
  text: string;
  title?: string;
  start_seconds?: number;
}

export interface DocumentContentResponse {
  document_id: string;
  filename: string;
  source_type: DocumentSourceType;
  pages: DocumentPageContent[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: (number | string)[];
  isStreaming?: boolean;
}

export interface SummaryData {
  document_id: string;
  executive_summary: string;
  key_points: string[];
  glossary: Record<string, string>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  relevant_page: number;
}

export interface QuizGenerateResponse {
  topic: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export interface QuestionResultDetail {
  question_id: number;
  question: string;
  options: string[];
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  relevant_page: number;
}

export interface QuizSubmitResponse {
  topic: string;
  total_questions: number;
  correct_count: number;
  percentage: number;
  message: string;
  details: QuestionResultDetail[];
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

// === Study Enhancements Types ===

export type ColorTheme = 'light' | 'dark' | 'warm';

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoPlayAudio: boolean;
}

export type SoundscapeType = 'rain' | 'ocean' | 'binaural' | 'stream';

export interface SoundscapeTrack {
  id: SoundscapeType;
  name: string;
  category: string;
  iconName: string;
  description: string;
  streamUrl?: string;
}

export type BookmarkColor = 'yellow' | 'green' | 'pink' | 'blue';

export interface BookmarkItem {
  id: string;
  document_id: string;
  member_id: string;
  page: number;
  quote: string;
  note?: string;
  color: BookmarkColor;
  created_at: string;
}

export interface StudyNote {
  id: string;
  document_id?: string | null;
  member_id: string;
  title: string;
  content: string;
  updated_at: string;
}

