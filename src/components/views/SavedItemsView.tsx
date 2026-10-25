import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import {
  Bookmark,
  Terminal,
  Trash2,
  Copy,
  Check,
  Code2,
  FileText,
} from 'lucide-react';

interface SavedItemsViewProps {
  onOpenInPlayground: (code: string) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  onOpenInPlayground,
}) => {
  const { state, deleteSavedProgram, deleteSavedExplanation } = useStudent();
  const [activeTab, setActiveTab] = useState<'programs' | 'explanations'>('programs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Saved Programs & Explanations
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Revisit, test, and copy your bookmarked C programs, algorithmic solutions, and AI mentor explanations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#080d17] p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('programs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'programs'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Programs ({state.savedPrograms.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('explanations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'explanations'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Explanations ({state.savedExplanations.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'programs' && (
        <div className="space-y-4">
          {state.savedPrograms.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] space-y-2">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Saved Programs Yet</div>
              <p className="text-xs text-slate-500">
                You can save programs from the Code Generator or Code Playground using the "Save" button.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {state.savedPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 space-y-3 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{prog.title}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {prog.topic} • {new Date(prog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(prog.id, prog.code)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Copy code"
                      >
                        {copiedId === prog.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSavedProgram(prog.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                        title="Delete program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <CodeEditor
                    code={prog.code}
                    readOnly
                    title="Saved C Code"
                    heightClass="min-h-[160px] max-h-[220px]"
                  />

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenInPlayground(prog.code)}
                      className="w-full py-2 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Open in GCC Playground</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'explanations' && (
        <div className="space-y-4">
          {state.savedExplanations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Saved Explanations</div>
              <p className="text-xs text-slate-500">
                Save useful AI tutor explanations and exam revision notes to keep them handy for final exam reviews.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {state.savedExplanations.map((expl) => (
                <div
                  key={expl.id}
                  className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{expl.title}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(expl.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(expl.id, expl.content)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Copy note"
                      >
                        {copiedId === expl.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSavedExplanation(expl.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-300 max-h-[220px] overflow-y-auto pr-1">
                    {expl.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
