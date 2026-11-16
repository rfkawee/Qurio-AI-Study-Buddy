import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Copy, Check, Download, Trash2, 
  Bold, Italic, Heading2, List, CheckSquare, 
  Quote, FileText, Globe 
} from 'lucide-react';
import type { DocumentItem } from '../../types';

interface MiniNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentItem | null;
  memberId: string;
}

export const MiniNotesDrawer: React.FC<MiniNotesDrawerProps> = ({
  isOpen,
  onClose,
  activeDoc,
  memberId,
}) => {
  const [scope, setScope] = useState<'doc' | 'global'>('doc');
  const [docNotes, setDocNotes] = useState<string>('');
  const [globalNotes, setGlobalNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('Tersimpan');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Key storage identifiers
  const docKey = activeDoc ? `qurio_notes_${memberId}_${activeDoc.id}` : null;
  const globalKey = `qurio_notes_${memberId}_global`;

  // Load saved notes when doc or scope changes
  useEffect(() => {
    if (docKey) {
      const savedDoc = localStorage.getItem(docKey);
      setDocNotes(savedDoc || '');
    }
    const savedGlobal = localStorage.getItem(globalKey);
    setGlobalNotes(savedGlobal || '');
  }, [docKey, globalKey]);

  // Handle auto-save with debounce
  const handleNoteChange = (text: string) => {
    setSaveStatus('Menyimpan...');
    if (scope === 'doc') {
      setDocNotes(text);
      if (docKey) {
        localStorage.setItem(docKey, text);
      }
    } else {
      setGlobalNotes(text);
      localStorage.setItem(globalKey, text);
    }
    setTimeout(() => {
      setSaveStatus('Tersimpan');
    }, 400);
  };

  const currentText = scope === 'doc' ? docNotes : globalNotes;

  // Insert formatting markdown
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentText.substring(start, end);
    const replacement = `${prefix}${selected || 'teks'}${suffix}`;

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    handleNoteChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = scope === 'doc' && activeDoc 
      ? `catatan-${activeDoc.filename.replace(/\.pdf$/i, '')}.md` 
      : `catatan-belajar-${new Date().toISOString().slice(0, 10)}.md`;
    
    const blob = new Blob([currentText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Hapus seluruh catatan ini? Tindakan tidak dapat dibatalkan.')) {
      handleNoteChange('');
    }
  };

  if (!isOpen) return null;

  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
  const charCount = currentText.length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-[#e2eaf2] flex flex-col font-sans">
      {/* Header Drawer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaf2] bg-[#F5F7FB]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📝</span>
          <div>
            <h2 className="text-sm font-bold text-[#25344B]">Mini Notes Scratchpad</h2>
            <div className="flex items-center gap-2 text-[11px] text-[#7487a3]">
              <span className="text-[#059669] font-semibold">{saveStatus}</span>
              <span>•</span>
              <span className="tabular-nums font-mono">{wordCount} kata</span>
              <span>•</span>
              <span className="tabular-nums font-mono">{charCount} karakter</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-white transition cursor-pointer"
          title="Tutup Panel Catatan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#e2eaf2] bg-white">
        <button
          onClick={() => setScope('doc')}
          disabled={!activeDoc}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            scope === 'doc'
              ? 'bg-[#ebf3fd] text-[#397DE0] border border-[#A9D8FF]/70 shadow-2xs'
              : 'text-[#475a75] hover:bg-[#F5F7FB] border border-transparent disabled:opacity-40'
          }`}
          title={activeDoc ? activeDoc.filename : 'Pilih dokumen terlebih dahulu'}
        >
          <FileText className="w-3.5 h-3.5 text-[#397DE0]" />
          <span className="truncate max-w-[130px]">
            {activeDoc ? activeDoc.filename : 'Dokumen'}
          </span>
        </button>

        <button
          onClick={() => setScope('global')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            scope === 'global'
              ? 'bg-[#ebf3fd] text-[#397DE0] border border-[#A9D8FF]/70 shadow-2xs'
              : 'text-[#475a75] hover:bg-[#F5F7FB] border border-transparent'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#397DE0]" />
          <span>Catatan Umum</span>
        </button>
      </div>

      {/* Formatting Quick Toolbar */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-slate-100 bg-slate-50/50 overflow-x-auto text-slate-600">
        <button
          onClick={() => insertFormatting('**', '**')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Tebal (Bold)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertFormatting('*', '*')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Miring (Italic)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertFormatting('## ')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Judul Bab (H2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertFormatting('\n- ')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Daftar Butir (Bullet)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertFormatting('\n- [ ] ')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Daftar Tugas (Checklist)"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertFormatting('\n> ')}
          className="p-1 rounded hover:bg-slate-200/70 transition cursor-pointer"
          title="Kutipan (Quote)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition cursor-pointer"
            title="Salin Catatan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition cursor-pointer"
            title="Unduh sebagai Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Bersihkan Catatan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="flex-1 p-4 flex flex-col bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={
            scope === 'doc'
              ? `Tulis poin-poin penting, rumus, atau to-do list untuk materi ${activeDoc?.filename || 'ini'}...`
              : 'Tulis ide, rangkuman umum, atau pengingat belajar pribadi Anda di sini...'
          }
          className="w-full h-full resize-none border-none focus:outline-hidden text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 font-mono"
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Mendukung sintaks Markdown sederhana</span>
        <button
          onClick={onClose}
          className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          Sembunyikan
        </button>
      </div>
    </div>
  );
};
