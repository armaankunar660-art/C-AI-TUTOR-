import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { NavItemKey } from '../layout/Sidebar';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  CalendarCheck,
  Flame,
  ArrowRight,
  Terminal,
  Bug,
  Code2,
  Trophy,
  CheckCircle2,
  Clock,
  Send,
  Zap,
} from 'lucide-react';
import { C_CURRICULUM } from '../../data/curriculum';
import { calculateLevel, ACHIEVEMENTS } from '../../utils/gamification';

interface DashboardViewProps {
  onNavigate: (key: NavItemKey) => void;
  onQuickAskTutor: (question: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onQuickAskTutor,
}) => {
  const { state, toggleTopicCompletion } = useStudent();
  const [quickQuestion, setQuickQuestion] = useState('');

  const { level, currentXp, nextLevelXp, progressPercent } = calculateLevel(state.xp);

  // Calculate actual statistics from stored data
  const totalTopics = C_CURRICULUM.length;
  const completedTopicsCount = state.completedTopics.length;
  const topicsPercent = Math.round((completedTopicsCount / totalTopics) * 100);

  const totalQuizzes = state.quizHistory.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(
          state.quizHistory.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes
        )
      : null;

  const totalTargets = state.studyTargets.length;
  const completedTargets = state.studyTargets.filter((t) => t.status === 'Completed').length;

  // Next recommended topic
  const nextTopic =
    C_CURRICULUM.find((topic) => !state.completedTopics.includes(topic.id)) ||
    C_CURRICULUM[0];

  // Weak topics calculation from quizzes with < 60% score
  const weakTopics = Array.from(
    new Set(
      state.quizHistory
        .filter((q) => q.percentage < 60)
        .map((q) => q.topic)
    )
  );

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    onQuickAskTutor(quickQuestion);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome & Quick AI Tutor Section */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#120e2e] via-[#0d1326] to-[#080d19] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered C Programming Companion</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">{state.profile.name || 'Engineer'}</span>! 👋
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            "Programs must be written for people to read, and only incidentally for machines to execute."
            <span className="block mt-1 text-xs text-slate-400 italic font-mono">
              — Harold Abelson • Ready for your C syllabus session today?
            </span>
          </p>

          {/* Quick AI Ask Box */}
          <form onSubmit={handleAskSubmit} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                placeholder="Ask C Tutor AI anything (e.g., 'Explain pointer arithmetic with diagram' or 'Write prime sieve in C')..."
                className="w-full rounded-xl bg-[#090e1a]/90 border border-purple-500/40 pl-4 pr-28 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium text-xs shadow-md transition"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] text-slate-400">Quick prompts:</span>
              {[
                'Why call-by-value in C?',
                'Memory leak in malloc()',
                'Bubble sort in C',
                'Dangling pointer',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onQuickAskTutor(suggestion)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* 2. Real Progress Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Topics Completed */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Topics Done</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">
            {completedTopicsCount} <span className="text-xs font-normal text-slate-500">/ {totalTopics}</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${topicsPercent}%` }}
            />
          </div>
        </div>

        {/* Quiz Average */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Quiz Average</span>
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">
            {avgQuizScore !== null ? `${avgQuizScore}%` : <span className="text-xs font-normal text-slate-500">No quizzes yet</span>}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalQuizzes} {totalQuizzes === 1 ? 'attempt' : 'attempts'} logged
          </span>
        </div>

        {/* Study Targets Completed */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Study Targets</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">
            {completedTargets} <span className="text-xs font-normal text-slate-500">/ {totalTargets}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {totalTargets - completedTargets} pending
          </span>
        </div>

        {/* Coding Challenges */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Challenges</span>
            <Terminal className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">
            {state.completedChallenges.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Solved in Sandbox</span>
        </div>

        {/* Current Learning Streak */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 to-[#0c1220] shadow-sm">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-white">
            {state.streakDays} <span className="text-xs font-normal text-amber-300/80">days</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Keep it rolling today!</span>
        </div>
      </div>

      {/* 3. Action Hub: Continue Learning & Recommended Lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Next Lesson Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-base font-bold font-display text-white">
                Recommended Next Topic
              </h3>
            </div>
            <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
              Chapter {nextTopic.number}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800/80 space-y-2">
            <h4 className="text-lg font-bold text-slate-100">{nextTopic.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{nextTopic.summary}</p>
            <div className="pt-2 flex flex-wrap gap-2">
              {nextTopic.learningObjectives.slice(0, 2).map((obj, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {obj}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('learn-c')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition"
            >
              <span>Open Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleTopicCompletion(nextTopic.id)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              {state.completedTopics.includes(nextTopic.id) ? 'Mark as Incomplete' : 'Mark as Completed (+50 XP)'}
            </button>
          </div>
        </div>

        {/* Level & XP Mastery Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Rank & Mastery</span>
            </h3>
            <span className="text-xs font-bold text-amber-300 font-mono">Level {level}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{currentXp} XP</span>
              <span>{nextLevelXp} XP (Next Level)</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {nextLevelXp - currentXp} XP needed for Level {level + 1}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/70">
            <span className="text-xs font-medium text-slate-300 block mb-2">Recent Badges:</span>
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENTS.slice(0, 3).map((ach) => {
                const unlocked = state.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border ${
                      unlocked
                        ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                    }`}
                    title={ach.description}
                  >
                    <Trophy className="w-3 h-3" />
                    <span>{ach.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Access Lab Tools Grid */}
      <div>
        <h3 className="text-base font-bold font-display text-white mb-4">
          Coding Laboratory Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('code-playground')}
            className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] hover:border-purple-500/50 hover:bg-[#11172a] text-left transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Code Playground</h4>
            <p className="text-xs text-slate-400">Write C code and run with real GCC 12 compiler</p>
          </button>

          <button
            onClick={() => onNavigate('generate-code')}
            className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] hover:border-purple-500/50 hover:bg-[#11172a] text-left transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Code Generator</h4>
            <p className="text-xs text-slate-400">Generate compilable C solutions with algorithm notes</p>
          </button>

          <button
            onClick={() => onNavigate('debug-code')}
            className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] hover:border-purple-500/50 hover:bg-[#11172a] text-left transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Debug Code</h4>
            <p className="text-xs text-slate-400">Fix segfaults, pointer bugs, and syntax errors</p>
          </button>

          <button
            onClick={() => onNavigate('exam-prep')}
            className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] hover:border-purple-500/50 hover:bg-[#11172a] text-left transition group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Exam Prep</h4>
            <p className="text-xs text-slate-400">2-mark, 5-mark & 10-mark college university answers</p>
          </button>
        </div>
      </div>

      {/* 5. Upcoming Targets & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Targets */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Upcoming Study Targets</span>
            </h3>
            <button
              onClick={() => onNavigate('study-planner')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Open Planner →
            </button>
          </div>

          {state.studyTargets.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No pending targets. Add goals in the Study Planner.
            </div>
          ) : (
            <div className="space-y-2">
              {state.studyTargets.slice(0, 3).map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#080d17] border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        target.priority === 'High'
                          ? 'bg-rose-400'
                          : target.priority === 'Medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{target.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Due: {target.dueDate} • {target.topic}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      target.status === 'Completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {target.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Topics Analysis */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Topic Revision Focus</span>
            </h3>
            <button
              onClick={() => onNavigate('quizzes')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              Practice Quizzes →
            </button>
          </div>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Topics where your quiz scores were under 60%:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 border border-slate-800/80 rounded-xl bg-[#080d17] space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <div className="font-semibold text-slate-200">No weak topics recorded yet!</div>
              <p className="text-[11px] text-slate-500">
                Complete practice quizzes to let AI map out areas needing revision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
