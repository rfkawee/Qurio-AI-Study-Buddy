import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Info, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  notice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, notice }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleMode = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Harap isi alamat email dan kata sandi.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Format email tidak valid.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback dev mode jika Supabase belum dipasang
        localStorage.setItem('qurio_user_email', cleanEmail);
        setTimeout(() => {
          setLoading(false);
          onSuccess(cleanEmail);
          onClose();
        }, 400);
        return;
      }

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Alamat email ini sudah terdaftar. Silakan beralih ke menu Masuk.');
          }
          throw error;
        }

        // Jika email confirmation dinonaktifkan di Supabase, session langsung terbentuk
        if (data.session && data.user) {
          const userEm = data.user.email || cleanEmail;
          localStorage.setItem('qurio_user_email', userEm);
          onSuccess(userEm);
          onClose();
        } else if (data.user) {
          // Jika email confirmation aktif
          setSuccessMsg('Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masuk sekarang (atau periksa konfirmasi email jika diaktifkan).');
          setIsRegister(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email atau kata sandi tidak sesuai. Silakan periksa kembali.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Email belum dikonfirmasi. Silakan buka tautan verifikasi di email Anda.');
          }
          throw error;
        }

        if (data.user) {
          const userEm = data.user.email || cleanEmail;
          localStorage.setItem('qurio_user_email', userEm);
          onSuccess(userEm);
          onClose();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Autentikasi gagal. Silakan coba beberapa saat lagi.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!isSupabaseConfigured) {
        // Fallback Google simulated login di dev mode
        localStorage.setItem('qurio_user_email', 'pelajar.google@gmail.com');
        onSuccess('pelajar.google@gmail.com');
        onClose();
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghubungkan akun Google. Silakan coba lagi.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#25344B]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-[#e2eaf2] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2eaf2]">
          <div>
            <h2 className="text-sm font-bold text-[#25344B]">
              {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Qurio'}
            </h2>
            <p className="text-[11px] text-[#7487a3] mt-0.5">
              {isRegister ? 'Simpan materi dan riwayat belajar Anda' : 'Lanjutkan sesi belajar bersama Qurio'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7487a3] hover:text-[#25344B] hover:bg-[#F5F7FB] transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {notice && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-[#ebf3fd] border border-[#A9D8FF]/70 text-[#397DE0] text-xs flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-[#397DE0]" />
              <span>{notice}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-[#f0fbf5] border border-[#A9E5C1] text-[#059669] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#059669]" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tombol Login Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 border border-[#e2eaf2] rounded-xl font-semibold text-[#25344B] hover:bg-[#F5F7FB] transition-all cursor-pointer text-xs mb-3.5 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          <div className="relative flex py-1.5 items-center mb-3">
            <div className="grow border-t border-[#e2eaf2]"></div>
            <span className="shrink mx-2.5 text-[#7487a3] text-[10px] uppercase tracking-wider font-semibold">Atau via Email</span>
            <div className="grow border-t border-[#e2eaf2]"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#475a75] mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#7487a3] absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#e2eaf2] bg-[#F5F7FB] focus:bg-white rounded-xl focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20 transition-all text-[#25344B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475a75] mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#7487a3] absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs border border-[#e2eaf2] bg-[#F5F7FB] focus:bg-white rounded-xl focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20 transition-all text-[#25344B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#7487a3] hover:text-[#25344B] cursor-pointer"
                  aria-label="Tampilkan sandi"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-[#475a75] mb-1">Ulangi Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#7487a3] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#e2eaf2] bg-[#F5F7FB] focus:bg-white rounded-xl focus:outline-hidden focus:border-[#397DE0] focus:ring-2 focus:ring-[#397DE0]/20 transition-all text-[#25344B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#397DE0] hover:bg-[#2e68bf] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Akun Qurio' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-3.5 text-center">
            <button
              type="button"
              onClick={() => handleToggleMode(!isRegister)}
              className="text-[11px] text-[#397DE0] hover:underline font-semibold cursor-pointer"
            >
              {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Buat akun gratis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
