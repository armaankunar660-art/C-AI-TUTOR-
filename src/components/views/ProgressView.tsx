import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { C_CURRICULUM } from '../../data/curriculum';
import { calculateLevel, ACHIEVEMENTS } from '../../utils/gamification';
import {
  BarChart3,
  Trophy,
  Flame,
  BookOpen,
  HelpCircle,
  CalendarCheck,
  Terminal,
  Bug,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { state } = useStudent();
  const { level, currentXp, nextLevelXp, progressPercent } = calculateLevel(state.xp);

  const totalTopics = C_CURRICULUM.length;
  const completedTopicsCount = state.completedTopics.length;
  const topicPercent = Math.round((completedTopicsCount / totalTopics) * 100);

  const totalQuizzes = state.quizHistory.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(
          state.quizHistory.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes
        )
      : 0;

  const totalTargets = state.studyTargets.length;
  const completedTargets = state.studyTargets.filter((t) => t.status === 'Completed').length;
  const targetPercent = totalTargets > 0 ? Math.round((completedTargets / totalTargets) * 100) : 0;

  // Weak topics calculation from quizzes where score < 60%
  const weakTopics = Array.from(
    new Set(
      state.quizHistory
        .filter((q) => q.percentage < 60)
        .map((q) => q.topic)
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold font-display text-white">
            Personal Learning Analytics & Progress
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Real-time metrics calculated from your C curriculum completions, quiz submissions, debugging logs, and active streaks.
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Curriculum Progress</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {completedTopicsCount} <span className="text-xs text-slate-500 font-normal">/ {totalTopics}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${topicPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400">{topicPercent}% completed</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quiz Accuracy</span>
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {totalQuizzes > 0 ? `${avgQuizScore}%` : 'N/A'}
          </div>
          <span className="text-[11px] text-slate-400">{totalQuizzes} quizzes attempted</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Study Targets</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {completedTargets} <span className="text-xs text-slate-500 font-normal">/ {totalTargets}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400">{targetPercent}% finished</span>
        </div>

        <div className="p-5 rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-[#0c1220] space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {state.streakDays} <span className="text-xs font-normal text-amber-300">Days</span>
          </div>
          <span className="text-[11px] text-slate-400">Consecutive learning days</span>
        </div>
      </div>

      {/* Level & XP Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display text-white">
              B.Tech Engineering Mastery Level
            </h3>
          </div>
          <span className="font-mono text-sm font-bold text-amber-300">
            Level {level} ({state.xp} Total XP)
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Current: {currentXp} XP</span>
            <span>Next Level: {nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badges and achievements */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Achievement Badges
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = state.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isUnlocked
                      ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800/70 text-slate-500 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{ach.title}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    {ach.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic-wise completion matrix & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Status Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-white">
            Topic-Wise Completion Matrix
          </h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {C_CURRICULUM.map((topic) => {
              const done = state.completedTopics.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#080d17] border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] ${
                        done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {done ? '✓' : topic.number}
                    </span>
                    <span className={done ? 'text-slate-200 font-medium' : 'text-slate-400'}>
                      {topic.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      done
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {done ? 'Mastered' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Topics Analysis */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-400" />
            <span>Targeted Weak Topics & Revision Focus</span>
          </h3>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Based on your actual practice quiz attempts, the following topics had accuracy below 60%:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <div
                    key={topic}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircleIcon className="w-4 h-4 text-rose-400" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-xl bg-[#080d17] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-semibold text-slate-200">No weak topics recorded!</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                As you take quizzes, any topics scoring under 60% will be highlighted here for targeted exam revision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
