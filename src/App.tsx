import React, { useState } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/common/AuthModal';

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
import { Trophy, X } from 'lucide-react';

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
  const { recentUnlockedBadge, clearRecentBadge } = useStudent();
  const [activeItem, setActiveItem] = useState<NavItemKey>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cross-view state pass-throughs
  const [playgroundCode, setPlaygroundCode] = useState<string>('');
  const [explainCode, setExplainCode] = useState<string>('');
  const [debugCode, setDebugCode] = useState<string>('');
  const [debugError, setDebugError] = useState<string>('');
  const [tutorQuestion, setTutorQuestion] = useState<string>('');
  const [quizTopic, setQuizTopic] = useState<string>('Loops & Control Flow');

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

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      {/* Achievement Unlocked Toast */}
      {recentUnlockedBadge && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-400/50 shadow-2xl text-white animate-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Trophy className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
              Achievement Unlocked!
            </div>
            <div className="text-sm font-bold text-white">{recentUnlockedBadge}</div>
          </div>
          <button
            onClick={clearRecentBadge}
            className="text-purple-300 hover:text-white p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar (desktop fixed, mobile drawer) */}
      <Sidebar
        activeItem={activeItem}
        onSelect={(key) => setActiveItem(key)}
        onLogout={() => setIsAuthModalOpen(true)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
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
            <ProfileSettingsView onOpenAuthModal={() => setIsAuthModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Student Account & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudentProvider>
      <MainApp />
    </StudentProvider>
  );
};

export default App;
