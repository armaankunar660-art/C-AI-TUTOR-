import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { MistakeEntry } from '../../types';
import { CodeEditor } from '../common/CodeEditor';
import {
  BookMarked,
  Search,
  Trash2,
  Bug,
  AlertTriangle,
  CheckCircle,
  Terminal,
  Filter,
} from 'lucide-react';

interface MistakeNotebookViewProps {
  onOpenInPlayground: (code: string) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  onOpenInPlayground,
}) => {
  const { state, deleteMistakeNote } = useStudent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBugType, setSelectedBugType] = useState('All');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    state.mistakeNotes[0]?.id || null
  );

  const bugTypes = ['All', 'Syntax', 'Compilation', 'Runtime', 'Logical', 'Memory / Pointer', 'Undefined Behavior'];

  const filteredEntries = state.mistakeNotes.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedBugType === 'All' || m.bugType === selectedBugType;
    return matchesSearch && matchesType;
  });

  const activeEntry: MistakeEntry | undefined =
    state.mistakeNotes.find((m) => m.id === selectedEntryId) || filteredEntries[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Personal C Mistake Notebook
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Learn from your errors: log compiler warnings, segmentation faults, and memory bugs for targeted pre-exam revision.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>{state.mistakeNotes.length} logged mistakes</span>
        </div>
      </div>

      {state.mistakeNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] space-y-3">
          <Bug className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Your Mistake Notebook is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Whenever you diagnose bugs in the AI Debugger, click "Save to Mistake Notebook" to collect your common pitfalls here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Search & Entry List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3 rounded-xl border border-slate-800 bg-[#0c1220] space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mistakes..."
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/60 pl-9 pr-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-wrap gap-1 text-[10px]">
                {bugTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedBugType(type)}
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      selectedBugType === type
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
              {filteredEntries.map((m) => {
                const isActive = activeEntry?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedEntryId(m.id)}
                    className={`w-full p-3 rounded-xl text-left border transition ${
                      isActive
                        ? 'bg-rose-950/20 border-rose-500/60 text-white shadow-md'
                        : 'bg-[#0c1220] border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                        {m.bugType}
                      </span>
                      <span className="text-slate-500">
                        {new Date(m.dateAdded).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold truncate text-slate-100">{m.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{m.topic}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Mistake Detail View (8 cols) */}
          {activeEntry && (
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                        {activeEntry.bugType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{activeEntry.topic}</span>
                    </div>
                    <h3 className="text-lg font-bold font-display text-white">
                      {activeEntry.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenInPlayground(activeEntry.correctedCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition"
                      title="Run fixed version in Playground"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Test in Playground</span>
                    </button>
                    <button
                      onClick={() => deleteMistakeNote(activeEntry.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {activeEntry.errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs font-mono">
                    <span className="font-bold block text-rose-400 mb-0.5">Error Message:</span>
                    {activeEntry.errorMessage}
                  </div>
                )}

                {/* Buggy Code vs Corrected Code Side-by-side or stacked */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Original Buggy Code</span>
                    </span>
                    <CodeEditor
                      code={activeEntry.buggyCode}
                      readOnly
                      title="Buggy Snippet"
                      heightClass="min-h-[180px] max-h-[260px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Corrected Standard Code</span>
                    </span>
                    <CodeEditor
                      code={activeEntry.correctedCode}
                      readOnly
                      title="Fixed Snippet"
                      heightClass="min-h-[180px] max-h-[260px]"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <span className="font-bold text-slate-200 block">Explanation of the Mistake:</span>
                  <div className="whitespace-pre-wrap">{activeEntry.explanation}</div>
                </div>

                {activeEntry.personalNotes && (
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200">
                    <span className="font-bold text-purple-300 block mb-0.5">Student Notes:</span>
                    {activeEntry.personalNotes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
