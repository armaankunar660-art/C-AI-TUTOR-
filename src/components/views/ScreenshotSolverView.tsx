import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import {
  ScanText,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bookmark,
  FileQuestion,
  Bug,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export const ScreenshotSolverView: React.FC = () => {
  const { addXP, saveExplanation } = useStudent();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [action, setAction] = useState<'explain' | 'solve' | 'debug' | 'notes' | 'mcq'>('explain');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Max file size is 10MB.');
      return;
    }

    setMimeType(file.type);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async (actionToUse?: typeof action) => {
    if (!imageBase64 || isLoading) return;
    const finalAction = actionToUse || action;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.analyzeScreenshot({
        imageBase64,
        mimeType,
        action: finalAction,
        customPrompt,
      });
      setResult(res.result);
      addXP(35);
    } catch (err: any) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    saveExplanation({
      title: `Screenshot Solution (${action.toUpperCase()} - ${new Date().toLocaleDateString()})`,
      codeSnippet: '',
      content: result,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-2 mb-1">
          <ScanText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold font-display text-white">
            Multimodal AI Screenshot & Question Solver
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Upload screenshots of C programming assignments, compiler errors, lecture slides, or textbook photos for instant multimodal analysis with Gemini 3.8 Flash.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Upload & Action Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-5 space-y-4 shadow-xl">
            {/* Upload Zone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!imageBase64 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-56 rounded-xl border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 bg-[#080d17] hover:bg-[#0c1324] cursor-pointer flex flex-col items-center justify-center p-6 text-center transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  Click to upload screenshot or photo
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports PNG, JPG, WebP up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-56 bg-black flex items-center justify-center">
                  <img
                    src={imageBase64}
                    alt="Uploaded question preview"
                    className="max-h-56 object-contain"
                  />
                  <button
                    onClick={() => {
                      setImageBase64(null);
                      setResult('');
                    }}
                    className="absolute top-2 right-2 text-xs bg-black/80 hover:bg-black text-slate-200 px-2 py-1 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'explain', label: 'Explain Question', icon: FileQuestion },
                  { key: 'solve', label: 'Solve C Program', icon: Sparkles },
                  { key: 'debug', label: 'Debug This Code', icon: Bug },
                  { key: 'notes', label: 'Generate Notes', icon: BookOpen },
                  { key: 'mcq', label: 'Create MCQs', icon: HelpCircle },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.key}
                      onClick={() => setAction(act.key as any)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition ${
                        action === act.key
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm'
                          : 'bg-[#080d17] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Follow-up / Specific question */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Custom Question or Specific Focus (Optional)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. 'What causes line 14 to throw a warning?'"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => handleProcess()}
              disabled={isLoading || !imageBase64}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Image with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process Image</span>
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

          {!result && !isLoading && (
            <div className="h-[480px] rounded-2xl border border-dashed border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">
                AI Vision Solution will appear here
              </div>
              <p className="text-xs max-w-sm text-slate-500">
                Upload any programming screenshot, test question, or lecture slide on the left and select an action.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-[480px] rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col items-center justify-center p-8 text-center text-cyan-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="text-sm font-medium">Extracting text & evaluating visual C semantics...</div>
              <p className="text-xs text-slate-500">Gemini 3.8 Flash multimodal reasoning in progress.</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Multimodal AI Analysis
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
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
