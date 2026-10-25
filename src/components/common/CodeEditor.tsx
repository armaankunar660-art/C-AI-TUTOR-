import React, { useState } from 'react';
import { Copy, Check, Play, RefreshCw } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  onRun?: () => void;
  isRunning?: boolean;
  title?: string;
  showRunButton?: boolean;
  heightClass?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  readOnly = false,
  onRun,
  isRunning = false,
  title = 'C Source Code (main.c)',
  showRunButton = false,
  heightClass = 'min-h-[320px] max-h-[500px]',
}) => {
  const [copied, setCopied] = useState(false);

  const lines = (code || '').split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-[#0c1220] overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080d17] border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="ml-2 text-xs font-mono font-medium text-slate-400">{title}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
            C99/C11
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showRunButton && onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans shadow-md shadow-emerald-950/40 transition-all disabled:opacity-50"
              title="Compile and run with real GCC"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Code</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white rounded bg-slate-800/70 hover:bg-slate-700/80 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code editing area with line numbers */}
      <div className={`relative flex font-mono text-xs sm:text-sm leading-6 overflow-auto ${heightClass}`}>
        {/* Line numbers gutter */}
        <div className="select-none py-3 px-3 text-right bg-[#090e18] text-slate-600 border-r border-slate-800/60 font-mono min-w-[44px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea or code view */}
        <div className="relative flex-1">
          {readOnly ? (
            <pre className="py-3 px-4 text-slate-200 overflow-x-auto whitespace-pre font-mono">
              <code>{code}</code>
            </pre>
          ) : (
            <textarea
              value={code}
              onChange={(e) => onChange?.(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[300px] py-3 px-4 bg-transparent text-slate-100 font-mono resize-none focus:outline-none focus:ring-0 leading-6 whitespace-pre"
              style={{ tabSize: 4 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
