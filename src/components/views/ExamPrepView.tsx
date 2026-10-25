import React, { useState } from 'react';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
} from 'lucide-react';

interface ExamPrepViewProps {
  onOpenInPlayground: (code: string) => void;
}

const PRESET_EXAM_TOPICS = [
  {
    topic: 'Functions & Storage Classes',
    question: 'Explain call by value in C with a swap function example and state why C does not have native call by reference.',
    mark: '5-mark',
  },
  {
    topic: 'Structures and Unions',
    question: 'Differentiate between structure and union in C with respect to memory allocation, syntax, and access mechanism.',
    mark: '10-mark',
  },
  {
    topic: 'Dynamic Memory Allocation',
    question: 'Explain malloc(), calloc(), realloc(), and free() with their syntax and return types.',
    mark: '10-mark',
  },
  {
    topic: 'Pointers & Memory',
    question: 'What is a pointer? Explain the use of & and * operators with a 2-mark concise definition.',
    mark: '2-mark',
  },
  {
    topic: 'Strings & String Functions',
    question: 'Write 2-mark syntax and usage for strlen, strcpy, strcat, and strcmp.',
    mark: '2-mark',
  },
  {
    topic: 'Control Flow & Loops',
    question: 'Give quick revision notes on break vs continue and entry-controlled vs exit-controlled loops.',
    mark: 'quick-revision',
  },
];

export const ExamPrepView: React.FC<ExamPrepViewProps> = () => {
  const { state, addXP, saveExplanation } = useStudent();
  const [topic, setTopic] = useState('Pointers and Dynamic Memory');
  const [question, setQuestion] = useState('');
  const [markFormat, setMarkFormat] = useState<'2-mark' | '5-mark' | '10-mark' | 'quick-revision'>('5-mark');
  const [examAnswer, setExamAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate days remaining until target exam date
  const examDate = state.profile.examDate ? new Date(state.profile.examDate) : null;
  const today = new Date();
  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleGenerate = async (t?: string, q?: string, m?: typeof markFormat) => {
    const finalTopic = t || topic;
    const finalQuestion = q !== undefined ? q : question;
    const finalFormat = m || markFormat;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.generateExamAnswer({
        topic: finalTopic,
        question: finalQuestion,
        markFormat: finalFormat,
      });
      setExamAnswer(res.answer);
      addXP(30);
    } catch (err: any) {
      setError(err.message || 'Exam material generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(examAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    saveExplanation({
      title: `Exam Model Answer (${markFormat.toUpperCase()} - ${topic})`,
      codeSnippet: '',
      content: examAnswer,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Countdown Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">
              B.Tech C Examination Preparation Mode
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate university-standard model answers formatted precisely for 2-mark definitions, 5-mark structured questions, and 10-mark comprehensive answers.
          </p>
        </div>

        {/* Exam Countdown Card */}
        <div className="p-5 rounded-2xl border border-purple-800/40 bg-gradient-to-br from-purple-950/30 to-[#0c1220] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>C Semester Exam Target</span>
            </span>
            <div className="text-2xl font-bold font-display text-white">
              {daysUntilExam !== null ? (
                <>
                  {daysUntilExam} <span className="text-xs font-normal text-purple-300">days left</span>
                </>
              ) : (
                'Set Date in Profile'
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {state.profile.examDate || 'No date configured'}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Syllabus Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Pointers, Dynamic Memory, Recursion..."
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Specific Exam Question (Optional)
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. 'Explain the difference between malloc and calloc with syntax and small example.' or leave blank for top syllabus questions."
                rows={3}
                className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Answer Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Mark Weightage & Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: '2-mark', label: '2-Mark Answer', desc: 'Concise definition & syntax' },
                  { key: '5-mark', label: '5-Mark Answer', desc: 'Concepts + code example' },
                  { key: '10-mark', label: '10-Mark Answer', desc: 'Full program & diagrams' },
                  { key: 'quick-revision', label: 'Quick Revision', desc: 'Last-minute bullet points' },
                ].map((fmt) => (
                  <button
                    key={fmt.key}
                    type="button"
                    onClick={() => setMarkFormat(fmt.key as any)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      markFormat === fmt.key
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-[#080d17] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !topic.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Exam Model Answer...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Model Answer</span>
                </>
              )}
            </button>
          </div>

          {/* Popular University Questions */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Frequently Asked College Questions
            </span>
            <div className="space-y-1.5">
              {PRESET_EXAM_TOPICS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(item.topic);
                    setQuestion(item.question);
                    setMarkFormat(item.mark as any);
                    handleGenerate(item.topic, item.question, item.mark as any);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#080d17] hover:bg-[#101728] border border-slate-800/80 hover:border-amber-500/40 text-left transition text-xs flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                      {item.question}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.topic} • {item.mark}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Model Answer Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!examAnswer && !isLoading && (
            <div className="h-[480px] rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <Award className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">
                Exam Model Answer will appear here
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                Select a topic and mark format (2M, 5M, 10M) to generate complete standard answers with code and explanations.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-[480px] rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-amber-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <div className="text-sm font-medium">Preparing university grade answer...</div>
              <p className="text-xs text-slate-500">Formatting definitions, syntax rules, C code samples, and step-by-step reasoning.</p>
            </div>
          )}

          {examAnswer && !isLoading && (
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 uppercase">
                    {markFormat}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                    <span>{saved ? 'Saved!' : 'Save Note'}</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-300 max-h-[520px] overflow-y-auto pr-2">
                {examAnswer}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 italic">
                * Note: AI generated model answers are designed for revision and practice; always align with your college university syllabus guidelines.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
