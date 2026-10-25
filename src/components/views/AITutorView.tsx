import React, { useState } from 'react';
import { DifficultyLevel, LearningMode } from '../../types';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Lightbulb,
  GraduationCap,
  HelpCircle,
  Code2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  difficulty?: DifficultyLevel;
  mode?: LearningMode;
  timestamp: string;
}

export const AITutorView: React.FC<{ initialQuestion?: string }> = ({
  initialQuestion = '',
}) => {
  const { addXP, saveExplanation } = useStudent();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am **C Tutor AI**, your personal B.Tech C programming mentor.\n\nI can help you understand pointers, dynamic memory allocation, control flow, loops, arrays, structures, or college exam questions.\n\nChoose your **Difficulty Level** and **Learning Style** above, then ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialQuestion);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('auto');
  const [mode, setMode] = useState<LearningMode>('solve');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSend = async (questionToSend?: string) => {
    const textToSend = questionToSend || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      difficulty,
      mode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await api.askTutor({
        question: textToSend,
        difficulty,
        mode,
        history,
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        difficulty,
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addXP(15);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Unable to connect to AI tutor:** ${err.message || 'Please verify your network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleSave = (id: string, text: string) => {
    saveExplanation({
      title: `AI Tutor Note (${new Date().toLocaleDateString()})`,
      codeSnippet: '',
      content: text,
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] rounded-2xl border border-slate-800 bg-[#090e1a] overflow-hidden shadow-2xl">
      {/* Top Controls: Difficulty and Learning Mode bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0c1222] border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Level:</span>
            <div className="flex bg-[#080d17] p-0.5 rounded-lg border border-slate-700/60">
              {(['auto', 'beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium transition ${
                    difficulty === lvl
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Style Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400">Mode:</span>
            <div className="flex bg-[#080d17] p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setMode('learn')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  mode === 'learn'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Teach concept step by step before code"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Learn</span>
              </button>
              <button
                onClick={() => setMode('practice')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  mode === 'practice'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Progressive hints without revealing immediate solution"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Practice</span>
              </button>
              <button
                onClick={() => setMode('solve')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  mode === 'solve'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Complete compilable C code and explanation"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Solve</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.8 Flash • C99/C11 ISO Standard</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-4xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`flex flex-col space-y-1.5 rounded-2xl p-4 sm:p-5 text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-950/40 border border-purple-700/40 text-purple-100 rounded-tr-none'
                  : 'bg-[#0f172a] border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1 border-b border-slate-800/60 pb-1">
                <span className="font-semibold text-slate-300">
                  {msg.role === 'user' ? 'You' : 'C Tutor AI'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.mode && (
                    <span className="font-mono uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {msg.mode} mode
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Message text with basic markdown code formatting */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Assistant Message Actions */}
              {msg.role === 'assistant' && msg.id !== 'welcome' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    {copiedId === msg.id ? (
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

                  <button
                    onClick={() => handleSave(msg.id, msg.text)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    {savedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-400">Saved!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>C Tutor AI is crafting a tailored explanation...</span>
            </div>
          </div>
        )}
      </div>

      {/* Preset popular prompts bar */}
      <div className="px-4 py-2 bg-[#0a0f1d] border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 shrink-0 font-medium">Try asking:</span>
        {[
          'Write a C program to check whether a number is prime.',
          'Explain call-by-value with pointers vs standard variables.',
          'What is a dangling pointer vs memory leak in C?',
          'Explain bubble sort step-by-step with array diagram.',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/40 transition truncate max-w-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#0c1222] border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask a C programming question in ${mode.toUpperCase()} mode (${difficulty} level)...`}
            className="flex-1 rounded-xl bg-[#080d17] border border-slate-700/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
