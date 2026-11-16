import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, Award, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardModal } from './components/DashboardModal';
import { SettingsModal } from './components/SettingsModal';
import { LogoutModal } from './components/LogoutModal';
import { DocumentSidebar } from './components/DocumentSidebar';
import { PDFViewerPanel } from './components/PDFViewerPanel';
import { ChatModule } from './components/ChatModule';
import { SummaryModule } from './components/SummaryModule';
import { QuizModule } from './components/QuizModule';
import { PomodoroModal } from './components/study/PomodoroModal';
import { LofiPlayerModal } from './components/study/LofiPlayerModal';
import { ThemeSelector } from './components/study/ThemeSelector';
import { MiniNotesDrawer } from './components/study/MiniNotesDrawer';
import { BookmarkDrawer } from './components/study/BookmarkDrawer';
import { AddBookmarkModal } from './components/study/AddBookmarkModal';
import { AddYouTubeModal } from './components/AddYouTubeModal';
import type { 
  DocumentItem, ColorTheme, PomodoroMode, 
  PomodoroSettings, SoundscapeType, BookmarkItem 
} from './types';
import { fetchDocuments, uploadDocument } from './lib/api';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { getMemberId, setMemberId, clearMemberId, generateMemberId } from './lib/auth';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'quiz'>('chat');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAddYouTubeOpen, setIsAddYouTubeOpen] = useState(false);
  
  // Ambil email & Member ID dari localStorage agar sesi tidak hilang saat refresh
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('qurio_user_email') || null;
  });
  const [memberId, setMemberIdState] = useState<string>(() => {
    return getMemberId();
  });

  // State untuk menyimpan file sementara saat user mengunggah sebelum login
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAutoUploading, setIsAutoUploading] = useState(false);

  // === Study Enhancements States ===
  // 1. Color Theme (khusus diterapkan di page Ruang Belajar, bukan di Header atau Landing)
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('qurio_color_theme');
    if (saved === 'dark' || saved === 'warm') {
      return saved as ColorTheme;
    }
    return 'light';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    // Pastikan root html/body tidak membawa data-theme agar LandingPage dan Header tetap bersih
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('qurio_color_theme', currentTheme);
  }, [currentTheme]);

  // 2. Pomodoro Timer
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('focus');
  const [pomodoroCycle, setPomodoroCycle] = useState(0);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('qurio_pomo_settings');
    return saved ? JSON.parse(saved) : {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      autoPlayAudio: true,
    };
  });
  const [pomodoroTimeRemaining, setPomodoroTimeRemaining] = useState<number>(25 * 60);

  useEffect(() => {
    localStorage.setItem('qurio_pomo_settings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

  const pomoMinutes = Math.floor(pomodoroTimeRemaining / 60);
  const pomoSeconds = pomodoroTimeRemaining % 60;
  const pomodoroDisplayTime = `${String(pomoMinutes).padStart(2, '0')}:${String(pomoSeconds).padStart(2, '0')}`;

  // 3. Lo-Fi Music & Ambience
  const [isLofiModalOpen, setIsLofiModalOpen] = useState(false);
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const [lofiTrackId, setLofiTrackId] = useState<SoundscapeType>('rain');
  const [lofiVolume, setLofiVolume] = useState<number>(0.5);

  // 4. Mini Notes
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // 5. Bookmarks & Highlights
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem(`qurio_bookmarks_${memberId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`qurio_bookmarks_${memberId}`);
    setBookmarks(saved ? JSON.parse(saved) : []);
  }, [memberId]);

  const handleAddBookmark = (newBm: BookmarkItem) => {
    setBookmarks((prev) => {
      const updated = [newBm, ...prev];
      localStorage.setItem(`qurio_bookmarks_${memberId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem(`qurio_bookmarks_${memberId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const loadDocuments = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        if (!activeDoc || !docs.some(d => d.id === activeDoc.id)) {
          setActiveDoc(docs[0]);
        }
      } else {
        setActiveDoc(null);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    // 1. Pulihkan sesi aktif dari Supabase (khususnya setelah redirect login Google OAuth atau reload)
    const initAuthSession = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error fetching Supabase session:', error);
          }
          if (session?.user?.email) {
            const email = session.user.email;
            const newMemberId = generateMemberId(email, session.user.id);
            setUserEmail(email);
            setMemberId(newMemberId);
            setMemberIdState(newMemberId);
            localStorage.setItem('qurio_user_email', email);
            loadDocuments();
          }
        } catch (err) {
          console.error('Failed to init auth session:', err);
        }
      }
    };

    initAuthSession();

    // 2. Pasang realtime auth listener dari Supabase
    let authSub: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user?.email) {
          const email = session.user.email;
          const newMemberId = generateMemberId(email, session.user.id);
          setUserEmail(email);
          setMemberId(newMemberId);
          setMemberIdState(newMemberId);
          localStorage.setItem('qurio_user_email', email);
          loadDocuments();
        } else if (event === 'SIGNED_OUT') {
          clearMemberId();
          setMemberIdState('MBR-GUEST');
          setUserEmail(null);
          localStorage.removeItem('qurio_user_email');
          loadDocuments();
        }
      });
      authSub = data.subscription;
    }

    loadDocuments();

    return () => {
      if (authSub) {
        authSub.unsubscribe();
      }
    };
  }, []);

  const handleSelectDoc = (doc: DocumentItem) => {
    setActiveDoc(doc);
    setCurrentPage(1);
  };

  const handleOpenAuth = (noticeMsg?: string) => {
    setAuthNotice(noticeMsg || null);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out from Supabase:', err);
      }
    }
    clearMemberId();
    setMemberIdState('MBR-GUEST');
    localStorage.removeItem('qurio_user_email');
    setUserEmail(null);
    setActiveDoc(null);
    setView('landing');
    loadDocuments();
  };

  const handleFileSelectedPreAuth = (file: File) => {
    setPendingFile(file);
    setAuthNotice(`File "${file.name}" siap diproses. Silakan masuk terlebih dahulu untuk langsung membuka materi di ruang belajar.`);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = async (email: string) => {
    const newMemberId = generateMemberId(email);
    setUserEmail(email);
    setMemberId(newMemberId);
    setMemberIdState(newMemberId);
    localStorage.setItem('qurio_user_email', email);
    setIsAuthOpen(false);
    setAuthNotice(null);
    loadDocuments();

    if (pendingFile) {
      const fileToUpload = pendingFile;
      setPendingFile(null);
      setIsAutoUploading(true);

      try {
        const newDoc = await uploadDocument(fileToUpload);
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
        setActiveDoc(newDoc);
        setCurrentPage(1);
        setView('workspace');
      } catch (err: unknown) {
        console.error('Auto upload error:', err);
        const msg = err instanceof Error ? err.message : 'Gagal mengunggah file PDF setelah login.';
        alert(msg);
      } finally {
        setIsAutoUploading(false);
      }
    }
  };

  const handleUploadSuccess = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setActiveDoc(newDoc);
    setCurrentPage(1);
    setView('workspace');
  };

  const handleOpenWorkspace = (doc?: DocumentItem) => {
    if (doc) {
      setActiveDoc(doc);
      setCurrentPage(1);
    } else if (documents.length > 0 && !activeDoc) {
      setActiveDoc(documents[0]);
    }
    setView('workspace');
  };

  const handleJumpToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F7FB] font-sans text-[#25344B]">
      {view === 'landing' ? (
        <div className="flex-1 overflow-y-auto">
          <LandingPage
            userEmail={userEmail}
            memberId={memberId}
            documents={documents}
            onOpenAuth={handleOpenAuth}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onUploadSuccess={handleUploadSuccess}
            onOpenWorkspace={handleOpenWorkspace}
            onFileSelectedPreAuth={handleFileSelectedPreAuth}
            isAutoUploading={isAutoUploading}
            onOpenDashboard={() => setIsDashboardOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAddYouTube={() => {
              if (!userEmail) {
                handleOpenAuth('Silakan masuk terlebih dahulu untuk menambahkan materi video YouTube.');
              } else {
                setIsAddYouTubeOpen(true);
              }
            }}
          />
        </div>
      ) : (
        <>
          {/* Navbar Workspace Minimalis */}
          <Navbar
            activeDoc={activeDoc}
            userEmail={userEmail}
            memberId={memberId}
            documentsCount={documents.length}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onBackToLanding={() => setView('landing')}
            onOpenDashboard={() => setIsDashboardOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenPomodoro={() => setIsPomodoroModalOpen(true)}
            pomodoroRunning={pomodoroRunning}
            pomodoroTime={pomodoroDisplayTime}
            onOpenLofi={() => setIsLofiModalOpen(true)}
            lofiPlaying={lofiPlaying}
            onOpenThemeSelector={() => setIsThemeModalOpen(true)}
            currentTheme={currentTheme}
            onOpenNotes={() => setIsNotesDrawerOpen(true)}
            onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
            bookmarksCount={activeDoc ? bookmarks.filter((b) => b.document_id === activeDoc.id).length : bookmarks.length}
          />

          {/* Main Workspace Dual-Panel (Ruang Belajar dengan Theme terisolasi) */}
          <div className="flex-1 flex overflow-hidden bg-white" data-theme={currentTheme}>
            {/* Sidebar Perpustakaan Materi */}
            {isSidebarOpen && (
              <DocumentSidebar
                documents={documents}
                activeDoc={activeDoc}
                onSelectDoc={handleSelectDoc}
                onRefreshDocs={loadDocuments}
                onOpenAddYouTube={() => setIsAddYouTubeOpen(true)}
              />
            )}

            {/* Split-Screen 50:50 Dual View */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
              {/* Panel Kiri: In-App PDF Viewer (50%) */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 flex flex-col overflow-hidden relative">
                {/* Tombol Sidebar Toggle di Sudut Kiri PDF Panel */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1 rounded bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
                    aria-label={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex-1 h-full pl-8">
                  <PDFViewerPanel
                    document={activeDoc}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onOpenAddBookmark={() => setIsAddBookmarkModalOpen(true)}
                    bookmarksCount={activeDoc ? bookmarks.filter((b) => b.document_id === activeDoc.id).length : 0}
                    onOpenBookmarkDrawer={() => setIsBookmarkDrawerOpen(true)}
                  />
                </div>
              </div>

              {/* Panel Kanan: 3 Modul Belajar dengan Floating Island Header (50%) */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col overflow-hidden bg-white relative">
                {/* FLOATING ISLAND HEADER TAB SWITCHER */}
                <div className="h-12 border-b border-[#e2eaf2] px-4 flex items-center justify-center shrink-0 bg-white/95 backdrop-blur-md">
                  <div className="flex items-center gap-1 bg-[#F5F7FB] p-1 rounded-xl border border-[#e2eaf2] shadow-2xs">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'chat'
                          ? 'bg-white text-[#397DE0] shadow-2xs ring-1 ring-[#A9D8FF]/70'
                          : 'text-[#475a75] hover:text-[#25344B]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#397DE0]" />
                      <span>Tanya Jawab</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'summary'
                          ? 'bg-white text-[#397DE0] shadow-2xs ring-1 ring-[#A9D8FF]/70'
                          : 'text-[#475a75] hover:text-[#25344B]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>Ringkasan</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'quiz'
                          ? 'bg-white text-[#397DE0] shadow-2xs ring-1 ring-[#A9D8FF]/70'
                          : 'text-[#475a75] hover:text-[#25344B]'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Kuis Evaluasi</span>
                    </button>
                  </div>
                </div>

                {/* Konten Modul Terpilih (Persistent Tab Memory) */}
                <div className="flex-1 overflow-hidden bg-white relative">
                  <div className={`h-full w-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
                    <ChatModule
                      document={activeDoc}
                      onJumpToPage={handleJumpToPage}
                    />
                  </div>

                  <div className={`h-full w-full ${activeTab === 'summary' ? 'block' : 'hidden'}`}>
                    <SummaryModule
                      document={activeDoc}
                    />
                  </div>

                  <div className={`h-full w-full ${activeTab === 'quiz' ? 'block' : 'hidden'}`}>
                    <QuizModule
                      document={activeDoc}
                      onJumpToPage={handleJumpToPage}
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      )}

      {/* Modal Autentikasi Terpusat */}
      <AuthModal
        isOpen={isAuthOpen}
        notice={authNotice}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthNotice(null);
          setPendingFile(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Modal Dashboard Belajar */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        userEmail={userEmail}
        memberId={memberId}
        documents={documents}
      />

      {/* Modal Pengaturan */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmail={userEmail}
        memberId={memberId}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* Modal Konfirmasi Keluar (Logout) */}
      <LogoutModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        userEmail={userEmail}
      />

      {/* === STUDY TOOLKIT MODALS & DRAWERS === */}
      {/* 1. Pomodoro Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroModalOpen}
        onClose={() => setIsPomodoroModalOpen(false)}
        isRunning={pomodoroRunning}
        setIsRunning={setPomodoroRunning}
        timeRemaining={pomodoroTimeRemaining}
        setTimeRemaining={setPomodoroTimeRemaining}
        mode={pomodoroMode}
        setMode={setPomodoroMode}
        cycleCount={pomodoroCycle}
        setCycleCount={setPomodoroCycle}
        settings={pomodoroSettings}
        setSettings={setPomodoroSettings}
      />

      {/* 2. Lo-Fi & Ambient Soundscape Modal */}
      <LofiPlayerModal
        isOpen={isLofiModalOpen}
        onClose={() => setIsLofiModalOpen(false)}
        isPlaying={lofiPlaying}
        setIsPlaying={setLofiPlaying}
        currentTrackId={lofiTrackId}
        setCurrentTrackId={setLofiTrackId}
        volume={lofiVolume}
        setVolume={setLofiVolume}
      />

      {/* 3. Color Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 4. Mini Notes Scratchpad Drawer */}
      <MiniNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        activeDoc={activeDoc}
        memberId={memberId}
      />

      {/* 5. Highlight Text Bookmarks Drawer */}
      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        activeDoc={activeDoc}
        bookmarks={bookmarks}
        onDeleteBookmark={handleDeleteBookmark}
        onOpenAddModal={() => setIsAddBookmarkModalOpen(true)}
        onJumpToPage={handleJumpToPage}
      />

      {/* 6. Form Tambah Bookmark / Sorot Halaman Aktif */}
      {activeDoc && (
        <AddBookmarkModal
          isOpen={isAddBookmarkModalOpen}
          onClose={() => setIsAddBookmarkModalOpen(false)}
          documentId={activeDoc.id}
          memberId={memberId}
          currentPage={currentPage}
          onAddBookmark={handleAddBookmark}
        />
      )}

      {/* 7. Modal Tambah Referensi Video YouTube */}
      <AddYouTubeModal
        isOpen={isAddYouTubeOpen}
        onClose={() => setIsAddYouTubeOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default App;
