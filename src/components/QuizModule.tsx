import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, Sparkles, Loader2, Bookmark, RefreshCw } from 'lucide-react';
import type { DocumentItem, QuizQuestion, QuizSubmitResponse } from '../types';
import { fetchQuiz, submitQuizAnswers } from '../lib/api';

interface QuizModuleProps {
  document: DocumentItem | null;
  onJumpToPage: (pageNumber: number) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ document, onJumpToPage }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua Bagian Dokumen');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);

  const handleGenerateQuiz = async () => {
    if (!document) return;
    setLoading(true);
    setErrorMsg(null);
    setQuizResult(null);
    setUserAnswers({});

    const activeTopic = selectedTopic === 'Kustom' ? customTopic.trim() || 'Topik Pilihan' : selectedTopic;

    try {
      const res = await fetchQuiz(document.id, activeTopic, numQuestions);
      setQuestions(res.questions);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat kuis.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    if (quizResult) return; // Kuis sudah disubmit, tidak bisa diganti
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const handleSubmitAll = async () => {
    if (!document || questions.length === 0) return;

    // Cek apakah ada soal yang belum dijawab
    const unansweredCount = questions.filter((q) => !userAnswers[q.id]).length;
    if (unansweredCount > 0) {
      if (!confirm(`Terdapat ${unansweredCount} butir soal yang belum dijawab. Tetap kirim jawaban sekarang?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.id,
        user_answer: userAnswers[q.id] || null,
      }));

      const activeTopic = selectedTopic === 'Kustom' ? customTopic || 'Topik Pilihan' : selectedTopic;
      const result = await submitQuizAnswers(document.id, activeTopic, payloadAnswers, questions);
      setQuizResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengevaluasi kuis.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 text-xs">
        Pilih materi terlebih dahulu untuk membuka modul kuis evaluasi.
      </div>
    );
  }

  const topicOptions = ['Semua Bagian Dokumen', ...(document.topics || []), 'Kustom'];

  return (
    <div className="h-full flex flex-col bg-slate-50/50 overflow-y-auto p-4 space-y-4">
      {/* Konfigurasi Kuis Modern */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Pengaturan Kuis Pilihan Ganda</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Pilih Topik */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475a75] mb-1">
              Topik / Bab Materi:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={loading || submitting}
              className="w-full py-2 px-3 text-xs border border-[#e2eaf2] rounded-xl bg-white text-[#25344B] focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20"
            >
              {topicOptions.map((top, idx) => (
                <option key={idx} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Soal */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475a75] mb-1">
              Jumlah Butir Soal:
            </label>
            <div className="flex items-center gap-2">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono tabular-nums transition-all cursor-pointer border ${
                    numQuestions === num
                      ? 'bg-[#397DE0] text-white border-[#397DE0] shadow-sm'
                      : 'bg-white text-[#475a75] border-[#e2eaf2] hover:bg-[#F5F7FB]'
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedTopic === 'Kustom' && (
          <div className="mb-3.5">
            <label className="block text-[11px] font-semibold text-[#475a75] mb-1">
              Tulis Topik Kustom:
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Contoh: Mekanisme Difusi dan Osmosis"
              className="w-full py-2 px-3.5 text-xs border border-[#e2eaf2] rounded-xl bg-white text-[#25344B] focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20"
            />
          </div>
        )}

        <button
          onClick={handleGenerateQuiz}
          disabled={loading || submitting}
          className="w-full py-2.5 px-4 bg-[#397DE0] hover:bg-[#2e68bf] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Qurio sedang menyusun kuis...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD66B]" />
              <span>{questions.length > 0 ? 'Buat Ulang Kuis' : 'Buat Soal Kuis Sekarang'}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Banner Hasil Kuis Pasca Submit */}
      {quizResult && (
        <div className="bg-white border border-[#A9E5C1] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#25344B] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span>Skor Evaluasi: <span className="text-[#397DE0]">{quizResult.percentage}%</span> ({quizResult.correct_count} / {quizResult.total_questions} Benar)</span>
              </h3>
              <p className="text-xs text-[#475a75] mt-1">{quizResult.message}</p>
            </div>
            <button
              onClick={handleGenerateQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2eaf2] hover:bg-[#F5F7FB] text-[#25344B] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#397DE0]" />
              <span>Latihan Lagi</span>
            </button>
          </div>
        </div>
      )}

      {/* Daftar Soal */}
      {questions.length > 0 && (
        <div className="space-y-3.5">
          {questions.map((q, idx) => {
            const detail = quizResult?.details.find((d) => d.question_id === q.id);
            const userChoice = userAnswers[q.id];

            return (
              <div
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white transition-all shadow-sm ${
                  detail
                    ? detail.is_correct
                      ? 'border-[#A9E5C1] bg-[#f0fbf5]/50'
                      : 'border-rose-300 bg-rose-50/40'
                    : 'border-[#e2eaf2]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-xs text-[#25344B] leading-snug">
                    <span className="text-[#397DE0] font-mono mr-1.5 font-bold">#{idx + 1}</span>
                    {q.question}
                  </h4>
                  {detail && (
                    <span className="shrink-0">
                      {detail.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </span>
                  )}
                </div>

                {/* 4 Opsi Jawaban */}
                <div className="space-y-2 mt-2.5">
                  {q.options.map((opt, oIdx) => {
                    const letter = opt.trim().substring(0, 1).toUpperCase();
                    const isSelected = userChoice === letter;
                    let optionClass = 'border-[#e2eaf2] bg-white hover:border-[#A9D8FF] hover:bg-[#F5F7FB] text-[#25344B]';

                    if (detail) {
                      if (letter === detail.correct_answer) {
                        optionClass = 'border-[#10b981] bg-[#f0fbf5] text-[#065f46] font-semibold';
                      } else if (isSelected && !detail.is_correct) {
                        optionClass = 'border-rose-300 bg-rose-50 text-rose-900 line-through opacity-80';
                      } else {
                        optionClass = 'border-slate-100 bg-[#F5F7FB]/50 text-[#7487a3]';
                      }
                    } else if (isSelected) {
                      optionClass = 'border-[#397DE0] bg-[#ebf3fd] text-[#25344B] font-semibold ring-1 ring-[#397DE0]';
                    }

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, letter)}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${optionClass} ${
                          quizResult ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isSelected && !quizResult
                              ? 'bg-[#397DE0] text-white'
                              : 'bg-[#F5F7FB] text-[#475a75] border border-[#e2eaf2]'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Detail Pembahasan Pasca Submit */}
                {detail && (
                  <div className="mt-3.5 pt-3.5 border-t border-[#e2eaf2] space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F7FB] border border-[#e2eaf2] text-[#25344B] leading-relaxed">
                      <span className="font-bold text-[#25344B] block mb-1">Pembahasan Akademis Qurio:</span>
                      {detail.explanation}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#7487a3]">Rujukan Dokumen:</span>
                      <button
                        onClick={() => onJumpToPage(detail.relevant_page)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ebf3fd] hover:bg-[#397DE0] text-[#397DE0] hover:text-white border border-[#A9D8FF]/70 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title={`Buka Halaman ${detail.relevant_page} di PDF`}
                      >
                        <Bookmark className="w-3 h-3 text-[#FFD66B]" />
                        <span>[Halaman {detail.relevant_page}]</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tombol Submit Semua Jawaban */}
          {!quizResult && (
            <div className="pt-2">
              <button
                onClick={handleSubmitAll}
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#397DE0] hover:bg-[#2e68bf] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Mengevaluasi Jawaban Anda...</span>
                  </>
                ) : (
                  <span>Submit Semua Jawaban</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
