import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader2, Bookmark, Trash2, Clock } from 'lucide-react';
import type { DocumentItem, ChatMessage } from '../types';
import { sendChatStreaming, fetchChatHistory, clearChatHistory } from '../lib/api';

interface ChatModuleProps {
  document: DocumentItem | null;
  onJumpToPage: (pageNumber: number) => void;
}

export const ChatModule: React.FC<ChatModuleProps> = ({ document, onJumpToPage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isYouTube = document?.source_type === 'youtube' || (document?.filename ? document.filename.startsWith('[YouTube]') : false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Muat riwayat chat dari server khusus untuk member_id aktif & dokumen ini
  useEffect(() => {
    let isMounted = true;
    if (document) {
      const loadHistory = async () => {
        try {
          const history = await fetchChatHistory(document.id);
          if (isMounted) {
            if (history && history.length > 0) {
              setMessages(history);
            } else {
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: isYouTube
                    ? `Halo! Saya Asisten Belajar Qurio. Transkrip video **${document.filename}** (${document.page_count} segmen waktu) telah siap dipelajari. Tanyakan konsep, topik, atau isi video apa pun yang ingin Anda diskusikan.`
                    : `Halo! Saya Asisten Belajar Qurio. Dokumen **${document.filename}** (${document.page_count} halaman) telah siap dipelajari. Tanyakan konsep, rumus, atau materi apa pun yang ingin Anda diskusikan.`,
                  citations: [],
                },
              ]);
            }
          }
        } catch (err) {
          console.error('Error fetching chat history:', err);
        }
      };
      loadHistory();
    } else {
      setMessages([]);
    }
    return () => {
      isMounted = false;
    };
  }, [document?.id]);

  const handleClearChat = async () => {
    if (!document) return;
    if (window.confirm('Bersihkan riwayat percakapan untuk materi ini?')) {
      await clearChatHistory(document.id);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: isYouTube
            ? `Riwayat percakapan telah dibersihkan. Silakan ajukan pertanyaan baru seputar video **${document.filename}**.`
            : `Riwayat percakapan telah dibersihkan. Silakan ajukan pertanyaan baru seputar dokumen **${document.filename}**.`,
          citations: [],
        },
      ]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || !document || isLoading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      citations: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    await sendChatStreaming(
      document.id,
      userText,
      (token) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + token }
              : msg
          )
        );
      },
      (citations) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, citations, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      },
      (errorMsg) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: `Terjadi kendala: ${errorMsg}`, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    );
  };

  // Helper untuk merender tag [Halaman X] dan [Menit ...] menjadi tombol sitasi modern
  const renderMessageContent = (content: string) => {
    // Regex menangkap [Halaman X] dan [Menit ...] dengan dukungan rentang waktu atau multi-timestamp
    const parts = content.split(/(\[Halaman\s+\d+\]|\[Menit\s+[^\]]+\])/gi);
    return parts.map((part, i) => {
      const pageMatch = part.match(/\[Halaman\s+(\d+)\]/i);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1], 10);
        return (
          <button
            key={i}
            onClick={() => onJumpToPage(pageNum)}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full border border-[#A9D8FF]/80 bg-[#ebf3fd] hover:bg-[#397DE0] text-[#397DE0] hover:text-white font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
            title={`Buka Halaman ${pageNum}`}
          >
            <Bookmark className="w-3 h-3 text-[#FFD66B]" />
            <span>[Hal {pageNum}]</span>
          </button>
        );
      }

      const minuteMatch = part.match(/\[Menit\s+([^\]]+)\]/i);
      if (minuteMatch) {
        const fullContent = minuteMatch[1].trim();
        // Cari timestamp pertama untuk menghitung segmen tujuan
        const firstTimeMatch = fullContent.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
        let totalSec = 0;
        if (firstTimeMatch) {
          const timeParts = firstTimeMatch[1].split(':').map((v) => parseInt(v, 10) || 0);
          if (timeParts.length === 3) {
            totalSec = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          } else {
            totalSec = timeParts[0] * 60 + timeParts[1];
          }
        } else {
          totalSec = (parseInt(fullContent, 10) || 0) * 60;
        }

        // Interval 2 menit (120 detik) per segmen di youtube_parser
        const calculatedPage = Math.floor(totalSec / 120) + 1;
        const maxPages = document?.page_count || 1;
        const targetPage = Math.min(maxPages, Math.max(1, calculatedPage));

        return (
          <button
            key={i}
            onClick={() => onJumpToPage(targetPage)}
            className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded border border-rose-200 bg-rose-50/90 hover:bg-rose-100 text-rose-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            title={`Lompat ke Transkrip Video Menit ${fullContent}`}
          >
            <Clock className="w-3 h-3 text-rose-600" />
            <span>[Menit {fullContent}]</span>
          </button>
        );
      }

      return <span key={i}>{part}</span>;
    });
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-[#7487a3] text-xs">
        Pilih materi terlebih dahulu untuk memulai sesi Tanya Jawab bersama Qurio.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sub-bar Riwayat Chat */}
      <div className="px-4 py-2.5 bg-[#F5F7FB] border-b border-[#e2eaf2] flex items-center justify-between text-xs text-[#7487a3] shrink-0">
        <span className="font-semibold text-[#25344B] text-[11px] truncate max-w-[200px]">
          Riwayat Diskusi ({messages.filter(m => m.id !== 'welcome').length} pesan)
        </span>
        {messages.filter(m => m.id !== 'welcome').length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[#7487a3] hover:text-rose-600 transition-colors cursor-pointer text-[11px] font-semibold"
            title="Bersihkan riwayat percakapan materi ini"
          >
            <Trash2 className="w-3 h-3" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Area Obrolan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-extrabold shadow-2xs ${
                  isUser ? 'bg-[#25344B] text-white' : 'bg-[#397DE0] text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <span>Q</span>}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-[#25344B] text-white rounded-br-xs'
                    : 'bg-[#F5F7FB] border border-[#e2eaf2] text-[#25344B] rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</div>

                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#397DE0] ml-1 animate-pulse align-middle" />
                )}

                {/* Sitasi Lampiran Jika Ada */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#e2eaf2] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-[#7487a3] font-medium">
                      {isYouTube ? 'Segmen Video Terkait:' : 'Halaman Dokumen Terkait:'}
                    </span>
                    {msg.citations.map((item, idx) => {
                      const pageNum = typeof item === 'number' ? item : parseInt(String(item), 10) || 1;
                      const topicLabel =
                        isYouTube && document.topics && document.topics[pageNum - 1]
                          ? document.topics[pageNum - 1]
                          : isYouTube
                          ? `Menit ${(pageNum - 1) * 2}:00 - ${pageNum * 2}:00`
                          : `Hal ${pageNum}`;

                      return (
                        <button
                          key={idx}
                          onClick={() => onJumpToPage(pageNum)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[10px] font-semibold transition-all cursor-pointer shadow-2xs ${
                            isYouTube
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-[#ebf3fd] hover:bg-[#397DE0] text-[#397DE0] hover:text-white border-[#A9D8FF]/70'
                          }`}
                          title={isYouTube ? `Buka Segmen Video ${topicLabel}` : `Buka Halaman ${pageNum}`}
                        >
                          {isYouTube ? (
                            <Clock className="w-2.5 h-2.5 text-rose-600" />
                          ) : (
                            <Bookmark className="w-2.5 h-2.5 text-[#FFD66B]" />
                          )}
                          <span>{topicLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Form Input Pertanyaan Modern */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#e2eaf2] bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={
            isYouTube
              ? 'Tanyakan materi video ini (sitasi menit/rentang waktu otomatis)...'
              : 'Tanyakan materi belajar pada Qurio...'
          }
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2eaf2] bg-[#F5F7FB] hover:bg-white focus:bg-white text-xs text-[#25344B] placeholder:text-[#7487a3] focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20 transition-all"
        />

        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-[#397DE0] hover:bg-[#2e68bf] disabled:opacity-40 disabled:hover:bg-[#397DE0] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm hover:shadow"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
};
