import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Notebook,
  DocumentItem,
  SmartNote,
  PracticeQuestion,
  ExamResult,
  RecentActivityItem,
  AnalyticsData,
} from './types';
import { apiService } from './services/apiService';
import { Toast, ToastState } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { DashboardView } from './components/DashboardView';
import { NotebookWorkspace } from './components/NotebookWorkspace';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { CreateNotebookModal } from './components/CreateNotebookModal';
import { PDFUploaderModal } from './components/PDFUploaderModal';
import { SmartNotesModal } from './components/SmartNotesModal';
import { QuestionGeneratorModal } from './components/QuestionGeneratorModal';
import { ExamModal } from './components/ExamModal';
import { ExamResultModal } from './components/ExamResultModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DeleteNotebookModal } from './components/DeleteNotebookModal';
import { RecentActivityView } from './components/RecentActivityView';
import { NotebooksView } from './components/NotebooksView';

type AppView = 'landing' | 'auth' | 'dashboard' | 'workspace' | 'analytics' | 'settings' | 'recent' | 'notebooks';

export default function App() {
  // App state
  const [profile, setProfile] = useState<StudentProfile | null>(() => apiService.getProfile());
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const prof = apiService.getProfile();
    return prof ? 'dashboard' : 'auth';
  });
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => apiService.getNotebooks());
  const [activeNotebookId, setActiveNotebookId] = useState<string>(() => {
    const list = apiService.getNotebooks();
    return list.length > 0 ? list[0].id : '';
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(() =>
    apiService.getRecentActivity()
  );
  const [analytics, setAnalytics] = useState<AnalyticsData>(() => apiService.getAnalytics());

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('study_ai_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('study_ai_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation / UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Modal States
  const [isCreateNotebookOpen, setIsCreateNotebookOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const [isDeletingNotebook, setIsDeletingNotebook] = useState(false);
  const [isPDFUploaderOpen, setIsPDFUploaderOpen] = useState(false);
  const [isSmartNotesOpen, setIsSmartNotesOpen] = useState(false);
  const [isQuestionGenOpen, setIsQuestionGenOpen] = useState(false);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [isExamResultOpen, setIsExamResultOpen] = useState(false);
  const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);

  // Active modal payload data
  const [activeNote, setActiveNote] = useState<SmartNote | null>(null);
  const [examQuestions, setExamQuestions] = useState<PracticeQuestion[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      isOpen: true,
      message,
      type,
    });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  };

  // Find active notebook
  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId) || notebooks[0];

  // Refresh local data from service
  const refreshNotebooks = () => {
    const fresh = apiService.getNotebooks();
    setNotebooks(fresh);
    setRecentActivity(apiService.getRecentActivity());
    setAnalytics(apiService.getAnalytics());
  };

  // Navigation Handlers
  const handleNavigate = (page: string) => {
    if (page === 'login') {
      setAuthMode('login');
      setCurrentView('auth');
    } else if (page === 'register') {
      setAuthMode('register');
      setCurrentView('auth');
    } else if (page === 'auth') {
      setAuthMode('login');
      setCurrentView('auth');
    } else if (page === 'notebooks') {
      setCurrentView('notebooks');
    } else if (page === 'recent') {
      setCurrentView('recent');
    } else if (page === 'dashboard' || page === 'analytics' || page === 'settings' || page === 'landing') {
      setCurrentView(page as AppView);
    } else if (page === 'workspace') {
      setCurrentView('workspace');
    }
  };

  const handleOpenNotebook = (id: string) => {
    setActiveNotebookId(id);
    setCurrentView('workspace');
  };

  // Auth Handlers
  const handleAuthSuccess = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    const userNotebooks = apiService.getNotebooks(newProfile.id);
    setNotebooks(userNotebooks);
    if (userNotebooks.length > 0) {
      setActiveNotebookId(userNotebooks[0].id);
    } else {
      setActiveNotebookId('');
    }
    setRecentActivity(apiService.getRecentActivity(newProfile.id));
    setAnalytics(apiService.getAnalytics(newProfile.id));
    setCurrentView('dashboard');
    showToast(`Welcome, ${newProfile.name}!`);
  };

  const handleLogout = () => {
    apiService.logout();
    setProfile(null);
    setNotebooks([]);
    setActiveNotebookId('');
    setRecentActivity([]);
    setAuthMode('login');
    setCurrentView('auth');
    showToast('Logged out successfully. Sign in anytime to access your dashboard.', 'info');
  };

  // Notebook creation
  const handleCreateNotebook = (title: string, description: string, code?: string) => {
    const newNb = apiService.createNotebook(title, description, code);
    refreshNotebooks();
    setActiveNotebookId(newNb.id);
    setIsCreateNotebookOpen(false);
    setCurrentView('workspace');
    showToast(`Notebook "${title}" created successfully`);
  };

  // PDF Upload completed
  const handleUploadComplete = (newDoc: DocumentItem) => {
    refreshNotebooks();
    setIsPDFUploaderOpen(false);
    showToast(`"${newDoc.name}" ingested and indexed into knowledge base`);
  };

  // Document Delete
  const handleDeleteDocument = async (docId: string) => {
    if (!activeNotebook) return;
    await apiService.deleteDocumentFromBackend(docId, activeNotebook.id);
    refreshNotebooks();
    showToast('Document removed from knowledge base', 'info');
  };

  // Notebook Delete Prompt & Confirmation
  const handlePromptDeleteNotebook = (notebookId: string) => {
    const target = notebooks.find((nb) => nb.id === notebookId);
    if (target) {
      setNotebookToDelete(target);
    }
  };

  const handleConfirmDeleteNotebook = async (notebookId: string) => {
    setIsDeletingNotebook(true);
    try {
      const target = notebooks.find((nb) => nb.id === notebookId);
      apiService.deleteNotebook(notebookId);

      const updatedNotebooks = apiService.getNotebooks();
      setNotebooks(updatedNotebooks);
      setRecentActivity(apiService.getRecentActivity());
      setAnalytics(apiService.getAnalytics());

      // If currently open notebook was deleted, switch to another notebook or back to dashboard
      if (activeNotebookId === notebookId) {
        if (updatedNotebooks.length > 0) {
          setActiveNotebookId(updatedNotebooks[0].id);
        } else {
          setActiveNotebookId('');
          setCurrentView('dashboard');
        }
      }

      setNotebookToDelete(null);
      showToast(
        `Notebook "${target?.title || 'Course'}" and study data removed`,
        'info'
      );
    } finally {
      setIsDeletingNotebook(false);
    }
  };

  // Clear All Data Handler
  const handleClearAllData = async () => {
    try {
      await apiService.clearAllData();
      setProfile(null);
      setNotebooks([]);
      setActiveNotebookId('');
      setRecentActivity([]);
      setAnalytics(apiService.getAnalytics());
      setCurrentView('auth');
      showToast('All login data, documents, and notebooks have been wiped.', 'info');
    } catch {
      showToast('Cleared local data.', 'info');
    }
  };

  // Document Preview
  const handlePreviewDocument = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsDocPreviewOpen(true);
  };

  // Smart Notes Trigger
  const handleOpenSmartNotes = () => {
    if (!activeNotebook) return;
    const notes = apiService.generateSmartNotes(activeNotebook.id);
    setActiveNote(notes);
    setIsSmartNotesOpen(true);
  };

  const handleSaveSmartNote = (note: SmartNote) => {
    apiService.saveSmartNotes(note);
    refreshNotebooks();
    showToast('Smart Notes saved to study repository');
  };

  const handleRegenerateSmartNote = () => {
    if (!activeNotebook) return;
    const refreshed = apiService.generateSmartNotes(activeNotebook.id);
    setActiveNote(refreshed);
    showToast('Notes regenerated from latest syllabus chunks');
  };

  // Exam Trigger
  const handleStartExam = (notebookId?: string) => {
    const targetId = notebookId || activeNotebookId;
    setActiveNotebookId(targetId);
    const questions = apiService.getExamQuestions(targetId);
    setExamQuestions(questions);
    setIsExamOpen(true);
  };

  const handleStartExamWithCustomQuestions = (questions: PracticeQuestion[]) => {
    setExamQuestions(questions);
    setIsExamOpen(true);
  };

  const handleSubmitExam = (answers: Record<number, number>, timeTakenSeconds: number) => {
    if (!activeNotebook) return;
    const result = apiService.submitExam(
      activeNotebook.id,
      examQuestions,
      answers,
      timeTakenSeconds
    );
    setExamResult(result);
    setIsExamOpen(false);
    setIsExamResultOpen(true);
    refreshNotebooks();
  };

  // Profile update
  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    const updatedProf = apiService.updateProfile(updated);
    setProfile(updatedProf);
    showToast('Profile settings saved');
  };

  // If in landing mode
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
        <Navbar
          activePage="landing"
          onNavigate={handleNavigate}
          profile={profile}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <LandingPage
          onGetStarted={() => {
            setAuthMode('register');
            setCurrentView('auth');
          }}
          onSignIn={() => {
            setAuthMode('login');
            setCurrentView('auth');
          }}
        />
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      </div>
    );
  }

  // If in auth mode or not logged in
  if (currentView === 'auth' || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
        <Navbar
          activePage="auth"
          onNavigate={handleNavigate}
          profile={profile}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <AuthPages
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setCurrentView('landing')}
        />
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      </div>
    );
  }

  // Student authenticated view (Dashboard, Workspace, Analytics, Settings)
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] font-sans antialiased text-[#0F172A] dark:text-slate-100 overflow-hidden">
      {/* Sidebar (Left Persistent on Desktop / Drawer on Mobile) */}
      <Sidebar
        activePage={currentView}
        onNavigate={handleNavigate}
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        onSelectNotebook={handleOpenNotebook}
        onCreateNotebook={() => setIsCreateNotebookOpen(true)}
        onDeleteNotebook={handlePromptDeleteNotebook}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        profile={profile}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Column (Navbar + View Canvas) */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <Navbar
          activePage={currentView}
          activeNotebookTitle={currentView === 'workspace' ? activeNotebook?.title : undefined}
          onNavigate={handleNavigate}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          profile={profile}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && profile && (
            <DashboardView
              profile={profile}
              notebooks={notebooks}
              onOpenNotebook={handleOpenNotebook}
              onCreateNotebook={() => setIsCreateNotebookOpen(true)}
              onOpenAnalytics={() => setCurrentView('analytics')}
              onStartExam={handleStartExam}
              onDeleteNotebook={handlePromptDeleteNotebook}
              onClearAllData={handleClearAllData}
            />
          )}

          {currentView === 'notebooks' && (
            <NotebooksView
              notebooks={notebooks}
              onOpenNotebook={handleOpenNotebook}
              onCreateNotebook={() => setIsCreateNotebookOpen(true)}
              onStartExam={handleStartExam}
              onDeleteNotebook={handlePromptDeleteNotebook}
            />
          )}

          {currentView === 'workspace' && activeNotebook && (
            <NotebookWorkspace
              notebook={activeNotebook}
              onOpenUploadModal={() => setIsPDFUploaderOpen(true)}
              onOpenSmartNotes={handleOpenSmartNotes}
              onOpenQuestionGen={() => setIsQuestionGenOpen(true)}
              onStartExam={() => handleStartExam(activeNotebook.id)}
              onOpenAnalytics={() => setCurrentView('analytics')}
              onDeleteDocument={handleDeleteDocument}
              onPreviewDocument={handlePreviewDocument}
              onShowToast={showToast}
              onDeleteNotebook={handlePromptDeleteNotebook}
              onBackToNotebooks={() => setCurrentView('notebooks')}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              onGoToNotebook={(subject) => {
                const matched = notebooks.find(
                  (n) => n.title.toLowerCase().includes((subject || '').toLowerCase())
                );
                if (matched) {
                  handleOpenNotebook(matched.id);
                } else {
                  handleOpenNotebook(notebooks[0].id);
                }
              }}
              onTakePracticeExam={() => handleStartExam(activeNotebookId)}
            />
          )}

          {currentView === 'recent' && (
            <RecentActivityView
              activity={recentActivity}
              notebooks={notebooks}
              onOpenNotebook={handleOpenNotebook}
              onClearRecent={() => {
                apiService.clearRecentActivity();
                setRecentActivity([]);
                showToast('Recent activity timeline cleared', 'info');
              }}
              onStartExam={handleStartExam}
            />
          )}

          {currentView === 'settings' && profile && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              theme={theme}
              onSetTheme={setTheme}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={isCreateNotebookOpen}
        onClose={() => setIsCreateNotebookOpen(false)}
        onCreate={(data) => handleCreateNotebook(data.title, data.description || '', data.code)}
        onCreateNotebook={handleCreateNotebook}
      />

      {/* PDF Uploader Modal */}
      <PDFUploaderModal
        isOpen={isPDFUploaderOpen}
        notebookId={activeNotebook?.id || ''}
        notebookTitle={activeNotebook?.title || 'Notebook'}
        onClose={() => setIsPDFUploaderOpen(false)}
        onUploadComplete={handleUploadComplete}
        onSuccess={(docData) => {
          handleUploadComplete({
            id: 'doc_' + Date.now(),
            notebookId: activeNotebook?.id || '',
            name: docData.name,
            size: docData.size,
            pages: docData.pages,
            uploadDate: 'Just now',
            status: 'ready',
            extractedChunksCount: docData.pages * 4,
            previewSnippet: `Preview of ${docData.name} - Extracted pages and indexed successfully into FAISS.`,
          });
        }}
      />

      {/* Smart Notes Modal */}
      {activeNote && (
        <SmartNotesModal
          isOpen={isSmartNotesOpen}
          onClose={() => setIsSmartNotesOpen(false)}
          note={activeNote}
          onSaveNote={handleSaveSmartNote}
          onRegenerate={handleRegenerateSmartNote}
        />
      )}

      {/* Question Generator Modal */}
      <QuestionGeneratorModal
        isOpen={isQuestionGenOpen}
        onClose={() => setIsQuestionGenOpen(false)}
        notebookTitle={activeNotebook?.title || 'Notebook'}
        onStartExamWithQuestions={handleStartExamWithCustomQuestions}
      />

      {/* Timed Practice Exam Modal */}
      <ExamModal
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
        notebookId={activeNotebook?.id || 'nb_dbms'}
        notebookTitle={activeNotebook?.title || 'Course'}
        questions={examQuestions}
        onSubmitExam={handleSubmitExam}
      />

      {/* Exam Result Modal */}
      <ExamResultModal
        isOpen={isExamResultOpen}
        result={examResult}
        onClose={() => setIsExamResultOpen(false)}
        onReviewWeakTopics={() => {
          setIsExamResultOpen(false);
          setIsQuestionGenOpen(true);
        }}
        onRetakeExam={() => {
          setIsExamResultOpen(false);
          handleStartExam(activeNotebookId);
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isDocPreviewOpen}
        document={previewDoc}
        onClose={() => setIsDocPreviewOpen(false)}
      />

      {/* Delete Student Notebook Confirmation Modal */}
      <DeleteNotebookModal
        isOpen={Boolean(notebookToDelete)}
        notebook={notebookToDelete}
        onClose={() => setNotebookToDelete(null)}
        onConfirmDelete={handleConfirmDeleteNotebook}
        isDeleting={isDeletingNotebook}
      />

      {/* Notification Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}
