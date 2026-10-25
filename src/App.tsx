import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/common/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';

import { DashboardView } from './components/views/DashboardView';
import { AITutorView } from './components/views/AITutorView';
import { LearnCView } from './components/views/LearnCView';
import { GenerateCodeView } from './components/views/GenerateCodeView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { ExplainCodeView } from './components/views/ExplainCodeView';
import { DebugCodeView } from './components/views/DebugCodeView';
import { ExamPrepView } from './components/views/ExamPrepView';
import { QuizzesView } from './components/views/QuizzesView';
import { DailyChallengesView } from './components/views/DailyChallengesView';
import { ScreenshotSolverView } from './components/views/ScreenshotSolverView';
import { FlashcardsView } from './components/views/FlashcardsView';
import { ProgressView } from './components/views/ProgressView';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { MistakeNotebookView } from './components/views/MistakeNotebookView';
import { SavedItemsView } from './components/views/SavedItemsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { Trophy, X, Sparkles } from 'lucide-react';

const TITLE_MAP: Record<NavItemKey, string> = {
  dashboard: 'Engineering Dashboard',
  'ai-tutor': 'AI C Programming Mentor',
  'learn-c': 'Structured C Curriculum',
  'generate-code': 'AI Code Generator',
  'code-playground': 'Interactive GCC Playground',
  'explain-code': 'Code Architecture Explainer',
  'debug-code': 'AI Bug & Segfault Debugger',
  'exam-prep': 'B.Tech University Exam Prep',
  quizzes: 'Practice Quizzes & MCQs',
  'daily-challenges': 'Daily Coding Challenges',
  'screenshot-solver': 'Multimodal Screenshot Solver',
  flashcards: 'Active Recall Flashcards',
  'my-progress': 'Learning Analytics & Milestones',
  'study-planner': 'Revision Calendar & Planner',
  'mistake-notebook': 'Personal Mistake Notebook',
  'saved-items': 'Saved Programs & Notes',
  'profile-settings': 'Student Profile & Settings',
};

const MainApp: React.FC = () => {
  const { currentUser, isGuest, loading: authLoading, logOut, exitGuest } = useAuth();
  const { recentUnlockedBadge, clearRecentBadge } = useStudent();
  const [activeItem, setActiveItem] = useState<NavItemKey>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthScreenModalOpen, setIsAuthScreenModalOpen] = useState(false);

  // Cross-view state pass-throughs
  const [playgroundCode, setPlaygroundCode] = useState<string>('');
  const [explainCode, setExplainCode] = useState<string>('');
  const [debugCode, setDebugCode] = useState<string>('');
  const [debugError, setDebugError] = useState<string>('');
  const [tutorQuestion, setTutorQuestion] = useState<string>('');
  const [quizTopic, setQuizTopic] = useState<string>('Loops & Control Flow');

  // If Firebase Auth is checking stored session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center p-4 text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-xl mb-4 animate-pulse">
          <div className="w-full h-full bg-[#0b101e] rounded-[14px] flex items-center justify-center font-mono font-bold text-white text-lg">
            C<span className="text-cyan-400">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <span className="inline-block w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying student session...</span>
        </div>
      </div>
    );
  }

  // If not logged in and not exploring as guest: Show public Sign In / Sign Up gateway
  if (!currentUser && !isGuest) {
    return <AuthScreen />;
  }

  const handleOpenInPlayground = (code: string) => {
    setPlaygroundCode(code);
    setActiveItem('code-playground');
  };

  const handleExplainCode = (code: string) => {
    setExplainCode(code);
    setActiveItem('explain-code');
  };

  const handleDebugCode = (code: string, error?: string) => {
    setDebugCode(code);
    if (error) setDebugError(error);
    setActiveItem('debug-code');
  };

  const handleQuickAskTutor = (question: string) => {
    setTutorQuestion(question);
    setActiveItem('ai-tutor');
  };

  const handleStartQuizForTopic = (topicName: string) => {
    setQuizTopic(topicName);
    setActiveItem('quizzes');
  };

  const handleLogout = async () => {
    if (currentUser) {
      await logOut();
    } else {
      exitGuest();
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      {/* Sidebar (desktop fixed, mobile drawer) */}
      <Sidebar
        activeItem={activeItem}
        onSelect={(key) => setActiveItem(key)}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Guest Mode Banner */}
        {!currentUser && isGuest && (
          <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-cyan-950/90 border-b border-purple-500/40 px-4 sm:px-6 py-2 text-xs flex items-center justify-between text-slate-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Exploring in <strong>Guest / Preview Mode</strong>. Progress is local to this browser.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthScreenModalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm transition"
              >
                Sign Up / Log In
              </button>
              <button
                onClick={exitGuest}
                className="text-slate-400 hover:text-white underline text-xs"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        <Header
          title={TITLE_MAP[activeItem] || 'C Tutor AI'}
          onToggleMobileMenu={() => setIsOpenMobile(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeItem === 'dashboard' && (
            <DashboardView
              onNavigate={(key) => setActiveItem(key)}
              onQuickAskTutor={handleQuickAskTutor}
            />
          )}

          {activeItem === 'ai-tutor' && (
            <AITutorView initialQuestion={tutorQuestion} />
          )}

          {activeItem === 'learn-c' && (
            <LearnCView
              onOpenInPlayground={handleOpenInPlayground}
              onStartQuizForTopic={handleStartQuizForTopic}
            />
          )}

          {activeItem === 'code-playground' && (
            <PlaygroundView
              initialCode={playgroundCode}
              onExplainCode={handleExplainCode}
              onDebugCode={handleDebugCode}
            />
          )}

          {activeItem === 'generate-code' && (
            <GenerateCodeView
              onOpenInPlayground={handleOpenInPlayground}
              onExplainCode={handleExplainCode}
              onDebugCode={handleDebugCode}
            />
          )}

          {activeItem === 'explain-code' && (
            <ExplainCodeView
              initialCode={explainCode}
              onOpenInPlayground={handleOpenInPlayground}
            />
          )}

          {activeItem === 'debug-code' && (
            <DebugCodeView
              initialCode={debugCode}
              initialError={debugError}
              onOpenInPlayground={handleOpenInPlayground}
              onNavigateToMistakes={() => setActiveItem('mistake-notebook')}
            />
          )}

          {activeItem === 'exam-prep' && (
            <ExamPrepView onOpenInPlayground={handleOpenInPlayground} />
          )}

          {activeItem === 'quizzes' && (
            <QuizzesView initialTopic={quizTopic} />
          )}

          {activeItem === 'daily-challenges' && (
            <DailyChallengesView onOpenInPlayground={handleOpenInPlayground} />
          )}

          {activeItem === 'screenshot-solver' && <ScreenshotSolverView />}

          {activeItem === 'flashcards' && <FlashcardsView />}

          {activeItem === 'my-progress' && <ProgressView />}

          {activeItem === 'study-planner' && <StudyPlannerView />}

          {activeItem === 'mistake-notebook' && (
            <MistakeNotebookView onOpenInPlayground={handleOpenInPlayground} />
          )}

          {activeItem === 'saved-items' && (
            <SavedItemsView onOpenInPlayground={handleOpenInPlayground} />
          )}

          {activeItem === 'profile-settings' && (
            <ProfileSettingsView
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Student Account & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAuthScreen={() => setIsAuthScreenModalOpen(true)}
      />

      {/* Auth Screen Modal for Guest users wanting to sign in/up */}
      {isAuthScreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setIsAuthScreenModalOpen(false)}
              className="absolute -top-10 right-0 text-slate-300 hover:text-white flex items-center gap-1 text-xs"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <AuthScreen onSuccess={() => setIsAuthScreenModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StudentProvider>
        <MainApp />
      </StudentProvider>
    </AuthProvider>
  );
};

export default App;
