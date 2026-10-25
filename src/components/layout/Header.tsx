import React from 'react';
import { Menu, Flame, Zap, ShieldCheck, User } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { calculateLevel } from '../../utils/gamification';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAuth: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAuth,
  title,
}) => {
  const { state } = useStudent();
  const { level, currentXp, nextLevelXp } = calculateLevel(state.xp);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#080d19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {state.profile.college} • {state.profile.semester}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* GCC Compiler Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real GCC 12</span>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/50 text-xs font-semibold text-amber-300">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{state.streakDays} {state.streakDays === 1 ? 'Day' : 'Days'}</span>
        </div>

        {/* Level and XP Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-800/60 text-xs text-purple-200">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span className="font-bold text-white">Lv. {level}</span>
          <span className="text-[11px] text-purple-300 font-mono hidden sm:inline">
            ({currentXp}/{nextLevelXp} XP)
          </span>
        </div>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 transition group"
          title="Manage Student Account & Goals"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
            {state.profile.name ? state.profile.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-medium text-slate-200 group-hover:text-white hidden sm:inline max-w-[120px] truncate">
            {state.profile.name}
          </span>
        </button>
      </div>
    </header>
  );
};
