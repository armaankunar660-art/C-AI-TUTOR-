import React, { useState } from 'react';
import { C_CURRICULUM, CurriculumTopic } from '../../data/curriculum';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Terminal,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Search,
} from 'lucide-react';
import { NavItemKey } from '../layout/Sidebar';

interface LearnCViewProps {
  onOpenInPlayground: (code: string) => void;
  onStartQuizForTopic: (topicName: string) => void;
}

export const LearnCView: React.FC<LearnCViewProps> = ({
  onOpenInPlayground,
  onStartQuizForTopic,
}) => {
  const { state, toggleTopicCompletion } = useStudent();
  const [selectedTopicId, setSelectedTopicId] = useState<string>(C_CURRICULUM[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openVivaIndex, setOpenVivaIndex] = useState<number | null>(null);

  const categories = ['All', 'Fundamentals', 'Control Flow', 'Functions & Arrays', 'Memory & Pointers', 'Advanced C'];

  const filteredTopics = C_CURRICULUM.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeTopic: CurriculumTopic =
    C_CURRICULUM.find((t) => t.id === selectedTopicId) || C_CURRICULUM[0];

  const isCompleted = state.completedTopics.includes(activeTopic.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white">
              C Programming Structured Curriculum
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            16 comprehensive engineering chapters spanning syntax, pointers, data structures, and university viva prep.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Completed: </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">
              {state.completedTopics.length} / {C_CURRICULUM.length}
            </span>
          </div>
          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all"
              style={{
                width: `${Math.round((state.completedTopics.length / C_CURRICULUM.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar topic list + Content viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topic List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter */}
          <div className="p-3 rounded-xl border border-slate-800 bg-[#0c1220] space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/60 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap gap-1 text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Topics scroll list */}
          <div className="max-h-[650px] overflow-y-auto space-y-1.5 pr-1">
            {filteredTopics.map((topic) => {
              const active = topic.id === activeTopic.id;
              const done = state.completedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setOpenVivaIndex(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition ${
                    active
                      ? 'bg-[#141b2d] border-purple-500/50 shadow-md shadow-purple-950/40 text-white'
                      : 'bg-[#0c1220] border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : active
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {done ? '✓' : topic.number}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{topic.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{topic.category}</div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-purple-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Topic Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-6 shadow-xl">
            {/* Topic Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                    Chapter {activeTopic.number}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeTopic.category}</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-white">{activeTopic.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleTopicCompletion(activeTopic.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isCompleted
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? 'Completed' : 'Mark Complete (+50 XP)'}</span>
                </button>

                <button
                  onClick={() => onStartQuizForTopic(activeTopic.title)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Generate Quiz on this topic"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Quiz</span>
                </button>
              </div>
            </div>

            {/* Overview & Objectives */}
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{activeTopic.summary}</p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Learning Objectives</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeTopic.learningObjectives.map((obj, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#080d17] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Engineering Principles
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300 pl-1">
                  {activeTopic.keyConcepts.map((concept, i) => (
                    <li key={i} className="leading-relaxed">
                      {concept}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code Example with Playground Runner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Standard C Code Implementation
                </h4>
                <button
                  onClick={() => onOpenInPlayground(activeTopic.codeExample)}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Open & Run in GCC Playground</span>
                </button>
              </div>

              <CodeEditor
                code={activeTopic.codeExample}
                readOnly
                title={`${activeTopic.title} Code Sample`}
                heightClass="min-h-[220px]"
              />
            </div>

            {/* Common Mistakes & Viva Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Pitfalls */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Common Student Mistakes</span>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc list-inside">
                  {activeTopic.commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* Viva Exam Questions */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>College Viva Voce Questions</span>
                </div>
                <div className="space-y-2">
                  {activeTopic.vivaQuestions.map((viva, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#080d17] border border-slate-800 text-xs cursor-pointer hover:border-purple-500/40 transition"
                      onClick={() => setOpenVivaIndex(openVivaIndex === i ? null : i)}
                    >
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>Q: {viva.q}</span>
                        <span className="text-slate-500 text-[10px]">
                          {openVivaIndex === i ? '▲' : '▼'}
                        </span>
                      </div>
                      {openVivaIndex === i && (
                        <div className="mt-2 text-cyan-300 text-[11px] leading-relaxed border-t border-slate-800 pt-1.5">
                          Ans: {viva.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
