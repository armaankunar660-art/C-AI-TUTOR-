import React, { useState } from 'react';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import { DifficultyLevel } from '../../types';
import {
  Bug,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  BookMarked,
  Terminal,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface DebugCodeViewProps {
  initialCode?: string;
  initialError?: string;
  onOpenInPlayground: (code: string) => void;
  onNavigateToMistakes: () => void;
}

const DEFAULT_BUGGY_CODE = `#include <stdio.h>

int main(void) {
    int *ptr = NULL;

    // Bug: Dereferencing NULL pointer causes Segmentation Fault
    *ptr = 100;

    printf("Value: %d\\n", *ptr);
    return 0;
}`;

export const DebugCodeView: React.FC<DebugCodeViewProps> = ({
  initialCode,
  initialError = '',
  onOpenInPlayground,
  onNavigateToMistakes,
}) => {
  const { addXP, addMistakeNote } = useStudent();
  const [code, setCode] = useState(initialCode || DEFAULT_BUGGY_CODE);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToNotebook, setSavedToNotebook] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.debugCode({
        code,
        errorMessage,
        expectedBehavior,
        difficulty,
      });
      setAnalysis(res.analysis);
      addXP(35);
    } catch (err: any) {
      setError(err.message || 'Debug analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractCorrectedCode = (markdown: string): string => {
    const match = markdown.match(/```(?:c|C)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : '';
  };

  const correctedCode = extractCorrectedCode(analysis);

  const handleCopyCorrected = async () => {
    try {
      await navigator.clipboard.writeText(correctedCode || analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSaveToMistakes = () => {
    addMistakeNote({
      title: errorMessage ? `Bug: ${errorMessage.slice(0, 35)}...` : 'C Debugging Session Note',
      topic: 'Debugging',
      bugType: errorMessage.includes('seg') ? 'Runtime' : 'Compilation',
      buggyCode: code,
      errorMessage,
      correctedCode: correctedCode || '// Check analysis for corrected logic',
      explanation: analysis.slice(0, 500) + '...',
      personalNotes: expectedBehavior,
    });
    setSavedToNotebook(true);
    setTimeout(() => setSavedToNotebook(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-2 mb-1">
          <Bug className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold font-display text-white">
            AI C Debugging Assistant
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Identify segmentation faults, memory leaks, dangling pointers, syntax bugs, and undefined behavior with exact code fixes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Buggy Code & Context (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            title="Faulty / Buggy C Source Code"
            heightClass="min-h-[340px] max-h-[460px]"
          />

          <div className="rounded-xl border border-slate-800 bg-[#0c1220] p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Compiler Error Message or Runtime Fault (Optional)
              </label>
              <input
                type="text"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g. segmentation fault (core dumped) or error: expected ';' before '}'"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-rose-300 placeholder-slate-600 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Behavior / Goal (Optional)
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g. should print the array elements in sorted ascending order"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Level:</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="rounded-lg bg-[#080d17] border border-slate-700/70 px-2 py-1 text-xs text-slate-200"
                >
                  <option value="auto">Auto</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <button
                onClick={handleDebug}
                disabled={isLoading || !code.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Faults...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Diagnose & Fix Bug</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Diagnosis & Fixes (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!analysis && !isLoading && (
            <div className="h-[480px] rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <Bug className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">
                Diagnosis & Corrected Code will appear here
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                Paste your buggy C code on the left, optionally enter any error messages, and click "Diagnose & Fix Bug".
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-[480px] rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-rose-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-400" />
              <div className="text-sm font-medium">Scanning memory operations, syntax, and pointers...</div>
              <p className="text-xs text-slate-500">Isolating root causes and preparing verified corrected code.</p>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="space-y-4">
              {/* Corrected Code panel if available */}
              {correctedCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Corrected C Program</span>
                    </span>
                    <button
                      onClick={() => onOpenInPlayground(correctedCode)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Test in GCC Playground</span>
                    </button>
                  </div>
                  <CodeEditor
                    code={correctedCode}
                    title="Fixed C Code"
                    heightClass="min-h-[220px] max-h-[340px]"
                  />
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0c1220] border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCorrected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Fixed Code'}</span>
                  </button>

                  <button
                    onClick={handleSaveToMistakes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition"
                    title="Save this mistake and fix to your personal Mistake Notebook"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>{savedToNotebook ? 'Saved to Mistake Notebook!' : 'Save to Mistake Notebook'}</span>
                  </button>
                </div>

                <button
                  onClick={onNavigateToMistakes}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  View Mistake Notebook →
                </button>
              </div>

              {/* Full Analysis Breakdown */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Full Bug Classification & Root Cause
                </h4>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-300 max-h-[380px] overflow-y-auto pr-2">
                  {analysis}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
