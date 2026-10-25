import React, { useState } from 'react';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import {
  FileQuestion,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  Terminal,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface ExplainCodeViewProps {
  initialCode?: string;
  onOpenInPlayground: (code: string) => void;
}

const DEFAULT_SAMPLE_CODE = `#include <stdio.h>

// Function that demonstrates pointer dereferencing and swap in C
void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main(void) {
    int a = 15, b = 25;
    printf("Before swap: a = %d, b = %d\\n", a, b);

    // Passing memory addresses by value
    swap(&a, &b);

    printf("After swap:  a = %d, b = %d\\n", a, b);
    return 0;
}`;

export const ExplainCodeView: React.FC<ExplainCodeViewProps> = ({
  initialCode,
  onOpenInPlayground,
}) => {
  const { addXP, saveExplanation } = useStudent();
  const [code, setCode] = useState(initialCode || DEFAULT_SAMPLE_CODE);
  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState(true);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.explainCode({ code, isBeginnerFriendly });
      setExplanation(res.explanation);
      addXP(25);
    } catch (err: any) {
      setError(err.message || 'Explanation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    saveExplanation({
      title: `Code Explanation (${new Date().toLocaleDateString()})`,
      codeSnippet: code.slice(0, 100),
      content: explanation,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileQuestion className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-display text-white">
              AI C Code Explainer
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Line-by-line architectural breakdown, memory and pointer behavior, time complexity, and expected output.
          </p>
        </div>

        {/* Beginner friendly toggle */}
        <button
          onClick={() => setIsBeginnerFriendly(!isBeginnerFriendly)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          {isBeginnerFriendly ? (
            <ToggleRight className="w-5 h-5 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-slate-500" />
          )}
          <span>Beginner-Friendly Analogy Mode: {isBeginnerFriendly ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            title="C Code to Explain"
            heightClass="min-h-[380px] max-h-[500px]"
          />

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleExplain}
              disabled={isLoading || !code.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing C Semantics & Memory...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain This C Program</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenInPlayground(code)}
              className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
              title="Open and run code in GCC Playground"
            >
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Playground</span>
            </button>
          </div>
        </div>

        {/* Right: Detailed Explanation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!explanation && !isLoading && (
            <div className="h-[450px] rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <FileQuestion className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">
                Detailed AI Breakdown will appear here
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                Paste any C code snippet or program on the left, then click "Explain This C Program".
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-[450px] rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-cyan-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="text-sm font-medium">Deconstructing logic and memory layout...</div>
              <p className="text-xs text-slate-500">Examining variables, pointer references, stack frames, and control flow.</p>
            </div>
          )}

          {explanation && !isLoading && (
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Comprehensive Explanation
                </span>
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

              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-300 max-h-[500px] overflow-y-auto pr-2">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
