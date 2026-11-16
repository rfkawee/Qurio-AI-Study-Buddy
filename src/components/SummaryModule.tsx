import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Loader2, CheckCircle2, RotateCw } from 'lucide-react';
import type { DocumentItem, SummaryData } from '../types';
import { fetchSummary, fetchExistingSummary } from '../lib/api';

interface SummaryModuleProps {
  document: DocumentItem | null;
}

export const SummaryModule: React.FC<SummaryModuleProps> = ({ document }) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Memuat ringkasan dari cache lokal, database backend, atau trigger generasi baru
  const loadSummary = async (forceRefresh: boolean = false) => {
    if (!document) return;

    // 1. Jika bukan forceRefresh, cek cache localStorage terlebih dahulu untuk respon instan
    if (!forceRefresh) {
      const cached = localStorage.getItem(`qurio_summary_${document.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.executive_summary) {
            setSummaryData(parsed);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      // 2. Jika bukan forceRefresh, periksa apakah backend sudah memiliki ringkasan tersimpan di database
      if (!forceRefresh) {
        const existing = await fetchExistingSummary(document.id);
        if (existing && existing.executive_summary) {
          setSummaryData(existing);
          localStorage.setItem(`qurio_summary_${document.id}`, JSON.stringify(existing));
          setLoading(false);
          return;
        }
      }

      // 3. Jika belum ada atau user secara eksplisit meminta perbarui, panggil AI generator
      const data = await fetchSummary(document.id, undefined, forceRefresh);
      setSummaryData(data);
      localStorage.setItem(`qurio_summary_${document.id}`, JSON.stringify(data));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat ringkasan.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (document) {
      // Cek cache lokal terlebih dahulu untuk menghindari jeda loading visual
      const cached = localStorage.getItem(`qurio_summary_${document.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.executive_summary) {
            setSummaryData(parsed);
            return;
          }
        } catch {
          // ignore
        }
      }

      setSummaryData(null);
      loadSummary(false);
    }
  }, [document?.id]);

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `RINGKASAN EKSEKUTIF:\n${summaryData.executive_summary}\n\nPOIN-POIN KUNCI:\n${summaryData.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nGLOSARIUM:\n${Object.entries(summaryData.glossary).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-[#7487a3] text-xs">
        Pilih materi terlebih dahulu untuk melihat ringkasan dokumen bersama Qurio.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F7FB] overflow-y-auto p-4 space-y-4 font-sans">
      {/* Header Ringkasan */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2eaf2] flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-[#25344B] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFD66B] fill-[#FFD66B]" />
              <span className="text-sm">Intisari Materi Belajar</span>
            </h2>
            {summaryData && !loading && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0fbf5] text-[#059669] border border-[#A9E5C1] text-[10px] font-semibold font-sans">
                <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                <span>Tersimpan</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7487a3] mt-0.5 font-mono">
            Berdasarkan {document.page_count} halaman materi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summaryData && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e2eaf2] bg-white hover:bg-[#F5F7FB] text-[#25344B] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#397DE0]" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          )}

          <button
            onClick={() => loadSummary(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#397DE0] text-white text-xs font-semibold hover:bg-[#2e68bf] transition-all cursor-pointer disabled:opacity-50 shadow-sm hover:shadow"
            title="Susun ulang ringkasan dengan analisis baru"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menganalisis...' : 'Perbarui'}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-[#397DE0] animate-spin mx-auto mb-2.5" />
          <p className="text-xs text-[#25344B] font-semibold">Qurio sedang menyusun rangkuman materi & daftar istilah...</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {summaryData && !loading && (
        <div className="space-y-4">
          {/* Ringkasan Utama */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2eaf2] shadow-sm">
            <h3 className="font-bold text-[#397DE0] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#397DE0]"></span>
              <span>Ringkasan Utama</span>
            </h3>
            <p className="text-xs text-[#25344B] leading-relaxed text-pretty">
              {summaryData.executive_summary}
            </p>
          </section>

          {/* Poin-Poin Kunci */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2eaf2] shadow-sm">
            <h3 className="font-bold text-[#b45309] text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FFD66B]"></span>
              <span>Poin-Poin Inti ({summaryData.key_points.length} Butir)</span>
            </h3>
            <ul className="space-y-2.5 mt-2">
              {summaryData.key_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-[#25344B] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#ebf3fd] text-[#397DE0] border border-[#A9D8FF]/70 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Glosarium Definisi Istilah */}
          {Object.keys(summaryData.glossary).length > 0 && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e2eaf2] shadow-sm">
              <h3 className="font-bold text-[#059669] text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A9E5C1]"></span>
                <span>Daftar Istilah Penting (Glosarium)</span>
              </h3>
              <div className="divide-y divide-[#e2eaf2] mt-2">
                {Object.entries(summaryData.glossary).map(([term, definition], idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <span className="font-bold text-xs text-[#25344B]">{term}</span>
                    <span className="sm:col-span-2 text-xs text-[#475a75] leading-relaxed">{definition}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
