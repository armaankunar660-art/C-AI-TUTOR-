import React, { useState, useEffect } from 'react';
import { CodeEditor } from '../common/CodeEditor';
import { api } from '../../services/api';
import { CompilerResult } from '../../types';
import { useStudent } from '../../context/StudentContext';
import {
  Play,
  RotateCcw,
  Trash2,
  Bookmark,
  FileQuestion,
  Bug,
  Clock,
  Terminal,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const STARTER_TEMPLATES: Record<string, { title: string; code: string; defaultStdin?: string }> = {
  hello: {
    title: 'Hello World',
    code: `// Hello World in C - Dennis Ritchie Standard
#include <stdio.h>

int main(void) {
    printf("Hello, World from C Tutor AI!\\n");
    printf("Compiling with real GCC sandbox.\\n");
    return 0;
}`,
    defaultStdin: '',
  },
  prime: {
    title: 'Prime Checker',
    code: `// Prime Number Checker in C
#include <stdio.h>
#include <stdbool.h>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main(void) {
    int num;
    printf("Enter an integer to test prime: ");
    if (scanf("%d", &num) != 1) {
        printf("Invalid input!\\n");
        return 1;
    }

    if (isPrime(num)) {
        printf("%d is a PRIME number.\\n", num);
    } else {
        printf("%d is NOT a prime number.\\n", num);
    }
    return 0;
}`,
    defaultStdin: '17',
  },
  calculator: {
    title: 'Calculator',
    code: `// Simple Arithmetic Calculator in C
#include <stdio.h>

int main(void) {
    char op;
    double a, b;

    printf("Enter operator (+, -, *, /) and two numbers:\\n");
    if (scanf(" %c %lf %lf", &op, &a, &b) != 3) {
        printf("Failed to read input!\\n");
        return 1;
    }

    switch (op) {
        case '+':
            printf("%.2f + %.2f = %.2f\\n", a, b, a + b);
            break;
        case '-':
            printf("%.2f - %.2f = %.2f\\n", a, b, a - b);
            break;
        case '*':
            printf("%.2f * %.2f = %.2f\\n", a, b, a * b);
            break;
        case '/':
            if (b == 0.0) {
                printf("Error: Division by zero is undefined!\\n");
            } else {
                printf("%.2f / %.2f = %.2f\\n", a, b, a / b);
            }
            break;
        default:
            printf("Error: Unknown operator '%c'\\n", op);
            break;
    }
    return 0;
}`,
    defaultStdin: '* 12.5 4.0',
  },
  factorial: {
    title: 'Factorial (Recursion)',
    code: `// Factorial Calculation using Recursion in C
#include <stdio.h>

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main(void) {
    int n;
    printf("Enter a non-negative number: ");
    if (scanf("%d", &n) != 1 || n < 0) {
        printf("Please enter a valid non-negative integer.\\n");
        return 1;
    }

    printf("Factorial of %d = %lld\\n", n, factorial(n));
    return 0;
}`,
    defaultStdin: '6',
  },
  sorting: {
    title: 'Bubble Sort',
    code: `// Bubble Sort with Early Exit in C
#include <stdio.h>
#include <stdbool.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break; // Array is sorted
    }
}

int main(void) {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Original array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    bubbleSort(arr, n);

    printf("Sorted array:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    return 0;
}`,
    defaultStdin: '',
  },
};

interface PlaygroundViewProps {
  initialCode?: string;
  onExplainCode: (code: string) => void;
  onDebugCode: (code: string, error?: string) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  initialCode,
  onExplainCode,
  onDebugCode,
}) => {
  const { addXP, saveProgram } = useStudent();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('prime');
  const [code, setCode] = useState<string>(
    initialCode || STARTER_TEMPLATES.prime.code
  );
  const [stdin, setStdin] = useState<string>(
    STARTER_TEMPLATES.prime.defaultStdin || ''
  );
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [compilerInfo, setCompilerInfo] = useState<string>('GCC 12 (Online Sandbox)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    api.getCompilerStatus().then((info) => {
      if (info && info.version) {
        setCompilerInfo(info.version);
      }
    });
  }, []);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    setCode(STARTER_TEMPLATES[key].code);
    setStdin(STARTER_TEMPLATES[key].defaultStdin || '');
    setResult(null);
  };

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await api.runCode(code, stdin);
      setResult(res);
      if (res.success) {
        addXP(25);
      }
    } catch (err: any) {
      setResult({
        success: false,
        phase: 'execution',
        stdout: '',
        stderr: err.message || 'Execution error',
        exitCode: 1,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (STARTER_TEMPLATES[selectedTemplate]) {
      setCode(STARTER_TEMPLATES[selectedTemplate].code);
      setStdin(STARTER_TEMPLATES[selectedTemplate].defaultStdin || '');
    }
    setResult(null);
  };

  const handleSave = () => {
    saveProgram({
      title: `${STARTER_TEMPLATES[selectedTemplate]?.title || 'Playground Program'} (${new Date().toLocaleDateString()})`,
      code,
      topic: 'Playground',
      difficulty: 'intermediate',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Template Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Interactive C Code Playground
            </h2>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Real GCC execution with standard input and compiler error diagnostics.</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <ShieldCheck className="w-3 h-3" />
              {compilerInfo}
            </span>
          </p>
        </div>

        {/* Templates */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Template:</span>
          {Object.entries(STARTER_TEMPLATES).map(([key, tpl]) => (
            <button
              key={key}
              onClick={() => handleSelectTemplate(key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                selectedTemplate === key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={handleRun}
            isRunning={isRunning}
            showRunButton
            title="C Editor (main.c)"
            heightClass="min-h-[420px] max-h-[550px]"
          />

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'Compiling with GCC...' : 'Run Code (GCC)'}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                title="Reset code to original template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
              </button>

              <button
                onClick={() => onExplainCode(code)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
                title="Send code to AI Explainer"
              >
                <FileQuestion className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explain</span>
              </button>

              <button
                onClick={() => onDebugCode(code, result?.compilationError || result?.stderr)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
                title="Send code to AI Debugger"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Debug</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Input & Output Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Custom Standard Input (stdin) */}
          <div className="rounded-xl border border-slate-800 bg-[#0c1220] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Standard Input (stdin)</span>
              <span className="text-[10px] text-slate-500 font-mono">Passed to scanf() / getchar()</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter stdin values (e.g. 17 or * 12.5 4.0)..."
              rows={2}
              className="w-full rounded-lg bg-[#080d17] border border-slate-700/60 p-2.5 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Execution Output Console */}
          <div className="rounded-xl border border-slate-800 bg-[#080d17] overflow-hidden shadow-xl flex flex-col h-[340px]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#050810] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-medium text-slate-300">Execution Output</span>
              </div>

              <div className="flex items-center gap-3">
                {result && (
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {result.executionTimeMs}ms
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        result.success
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      Exit: {result.exitCode}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setResult(null)}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title="Clear Console"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Console Screen */}
            <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-[#070b14] space-y-3">
              {!result && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                  <Play className="w-6 h-6 stroke-1 text-slate-600" />
                  <p className="text-xs">Click "Run Code" to compile and execute with GCC.</p>
                </div>
              )}

              {isRunning && (
                <div className="h-full flex items-center justify-center text-xs text-purple-300 space-y-2 animate-pulse font-mono">
                  <span>[Compiling main.c with GCC 12...]</span>
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  {/* Compilation Error Notice if any */}
                  {result.compilationError && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>GCC Compilation Failed</span>
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap text-rose-200 overflow-x-auto">
                        {result.compilationError}
                      </pre>
                    </div>
                  )}

                  {/* Compilation Warnings if any */}
                  {result.warnings && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs space-y-1">
                      <span className="font-semibold text-[11px]">GCC Warnings (-Wall -Wextra):</span>
                      <pre className="text-[10px] whitespace-pre-wrap text-amber-200">
                        {result.warnings}
                      </pre>
                    </div>
                  )}

                  {/* Standard Output (stdout) */}
                  {result.stdout && (
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">
                        stdout:
                      </div>
                      <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                        {result.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Standard Error (stderr) if not compilation error */}
                  {!result.compilationError && result.stderr && (
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-rose-500 mb-1">
                        stderr:
                      </div>
                      <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed">
                        {result.stderr}
                      </pre>
                    </div>
                  )}

                  {result.success && !result.stdout && (
                    <div className="text-slate-500 italic text-[11px]">
                      Program terminated cleanly with code 0 (no output printed).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
