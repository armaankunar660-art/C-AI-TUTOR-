import React, { useState } from 'react';
import { DifficultyLevel, LearningMode } from '../../types';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import {
  Code2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  FileQuestion,
  Bug,
  Terminal,
  ArrowRight,
} from 'lucide-react';

interface GenerateCodeViewProps {
  onOpenInPlayground: (code: string) => void;
  onExplainCode: (code: string) => void;
  onDebugCode: (code: string) => void;
}

export const GenerateCodeView: React.FC<GenerateCodeViewProps> = ({
  onOpenInPlayground,
  onExplainCode,
  onDebugCode,
}) => {
  const { addXP, saveProgram } = useStudent();
  const [problem, setProblem] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [mode, setMode] = useState<LearningMode>('solve');
  const [expectedInput, setExpectedInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!problem.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.generateCode({
        problem,
        difficulty,
        mode,
        expectedInput,
        expectedOutput,
      });
      setGeneratedResult(res.text);
      addXP(30);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract C code snippet from markdown block if present
  const extractCode = (markdown: string): string => {
    const match = markdown.match(/```(?:c|C)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : markdown;
  };

  const pureCode = extractCode(generatedResult);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pureCode || generatedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    saveProgram({
      title: problem.slice(0, 40) + '...',
      code: pureCode,
      topic: 'Generated Code',
      difficulty,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold font-display text-white">
            AI C Code Generator
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Generate standard, compilable C code with full headers, algorithmic reasoning, edge case notes, and input/output examples.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config & Problem Formulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Problem Statement / Assignment Specification
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe your program in detail (e.g., 'Write a program to transpose an N x M matrix dynamically allocated with malloc and calculate the sum of each row')..."
                rows={5}
                className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-500 text-[10px] w-full">Popular B.Tech Programs:</span>
              {[
                'Matrix Transpose with Dynamic Memory',
                'Reverse Singly Linked List',
                'Check Palindrome String using Pointers',
                'Armstrong Number Checker',
                'Binary Search Recursive',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProblem(preset)}
                  className="px-2 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Difficulty & Mode */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="auto">Auto Adaptive</option>
                  <option value="beginner">Beginner (Simple C)</option>
                  <option value="intermediate">Intermediate (Standard)</option>
                  <option value="advanced">Advanced (Pointers & Opt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Learning Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as LearningMode)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="solve">Solve Mode (Full Code)</option>
                  <option value="learn">Learn Mode (Concept First)</option>
                  <option value="practice">Practice Mode (Hints)</option>
                </select>
              </div>
            </div>

            {/* Optional Expected I/O */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Sample Input (Optional)
                </label>
                <input
                  type="text"
                  value={expectedInput}
                  onChange={(e) => setExpectedInput(e.target.value)}
                  placeholder="e.g. 5 or 3 3"
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Sample Output (Optional)
                </label>
                <input
                  type="text"
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  placeholder="e.g. 120 or Palindrome"
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !problem.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Complete C Program...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate C Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {!generatedResult && !isLoading && (
            <div className="h-[450px] rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <Code2 className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">
                Generated Program will appear here
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                Enter your C programming assignment or algorithm problem on the left and click "Generate C Code".
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-[450px] rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-purple-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              <div className="text-sm font-medium">C Tutor AI is crafting standard C code...</div>
              <p className="text-xs text-slate-500">Formulating standard headers, algorithm steps, and edge cases.</p>
            </div>
          )}

          {generatedResult && !isLoading && (
            <div className="space-y-4">
              {/* Code viewer */}
              <CodeEditor
                code={pureCode}
                title="Generated C Program"
                heightClass="min-h-[350px] max-h-[480px]"
              />

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0c1220] border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenInPlayground(pureCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-md transition"
                    title="Execute in Playground"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run in GCC Playground</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                    <span>{saved ? 'Saved!' : 'Save Program'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onExplainCode(pureCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Explain</span>
                  </button>

                  <button
                    onClick={() => onDebugCode(pureCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    <Bug className="w-3.5 h-3.5 text-rose-400" />
                    <span>Debug</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="Regenerate alternative solution"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Markdown Explanation view */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Full Algorithmic Notes & Analysis
                </h4>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-300">
                  {generatedResult}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
