import React from 'react';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Code2,
  Terminal,
  FileQuestion,
  Bug,
  GraduationCap,
  HelpCircle,
  Flame,
  ScanText,
  Layers,
  BarChart3,
  CalendarCheck,
  BookMarked,
  Bookmark,
  UserCog,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'ai-tutor'
  | 'learn-c'
  | 'generate-code'
  | 'code-playground'
  | 'explain-code'
  | 'debug-code'
  | 'exam-prep'
  | 'quizzes'
  | 'daily-challenges'
  | 'screenshot-solver'
  | 'flashcards'
  | 'my-progress'
  | 'study-planner'
  | 'mistake-notebook'
  | 'saved-items'
  | 'profile-settings';

interface SidebarProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core Mentor',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'ai-tutor', label: 'AI Tutor', icon: Bot, badge: 'Gemini' },
      { key: 'learn-c', label: 'Learn C', icon: BookOpen, badge: '16 Topics' },
    ],
  },
  {
    title: 'Coding Laboratory',
    items: [
      { key: 'code-playground', label: 'Code Playground', icon: Terminal, badge: 'GCC' },
      { key: 'generate-code', label: 'Generate Code', icon: Code2 },
      { key: 'explain-code', label: 'Explain Code', icon: FileQuestion },
      { key: 'debug-code', label: 'Debug Code', icon: Bug },
    ],
  },
  {
    title: 'Exams & Practice',
    items: [
      { key: 'exam-prep', label: 'Exam Preparation', icon: GraduationCap, badge: 'B.Tech' },
      { key: 'quizzes', label: 'Practice Quizzes', icon: HelpCircle },
      { key: 'daily-challenges', label: 'Daily Challenges', icon: Flame },
      { key: 'screenshot-solver', label: 'Screenshot Solver', icon: ScanText, badge: 'Vision' },
      { key: 'flashcards', label: 'Flashcards', icon: Layers },
    ],
  },
  {
    title: 'Student Hub',
    items: [
      { key: 'my-progress', label: 'My Progress', icon: BarChart3 },
      { key: 'study-planner', label: 'Study Planner', icon: CalendarCheck },
      { key: 'mistake-notebook', label: 'Mistake Notebook', icon: BookMarked },
      { key: 'saved-items', label: 'Saved Items', icon: Bookmark },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'profile-settings', label: 'Profile & Settings', icon: UserCog },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onSelect,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#080d19] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/70">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b101e] rounded-[10px] flex items-center justify-center font-mono font-bold text-white text-base">
              C<span className="text-cyan-400 font-sans">AI</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-white tracking-tight">C TUTOR AI</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[11px] text-purple-300/80 font-medium">B.Tech Engineering Mentor</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelect(item.key);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 text-purple-200 border border-purple-500/30 shadow-sm shadow-purple-950/50'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-purple-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Navigation Item 18: Logout */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                onLogout();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span>Logout / Switch User</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-rose-500/50" />
            </button>
          </div>
        </div>

        {/* Footer compiler badge */}
        <div className="p-3 border-t border-slate-800/60 bg-[#060a14]">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono">GCC 12 Sandbox</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
