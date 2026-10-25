import React, { useState } from 'react';
import { api } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { DifficultyLevel, QuizQuestion } from '../../types';
import {
  HelpCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  ArrowRight,
  Trophy,
  History,
} from 'lucide-react';

interface QuizzesViewProps {
  initialTopic?: string;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({ initialTopic = 'Loops & Control Flow' }) => {
  const { state, recordQuizResult } = useStudent();
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [count, setCount] = useState<number>(5);
  const [questionType, setQuestionType] = useState<string>('mcq');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setIsQuizComplete(false);
    setScore(0);

    try {
      const res = await api.generateQuiz({
        topic,
        difficulty,
        count,
        questionType,
      });

      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        throw new Error('Malformed quiz response from AI. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerSubmitted[currentIndex]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswers[currentIndex] === undefined) return;
    setIsAnswerSubmitted((prev) => ({
      ...prev,
      [currentIndex]: true,
    }));

    // Update score
    const currentQ = questions[currentIndex];
    if (selectedAnswers[currentIndex] === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      // Quiz Finished!
      const totalScore = score + (selectedAnswers[currentIndex] === questions[currentIndex].correctIndex ? 1 : 0);
      setIsQuizComplete(true);

      // Record in student context
      recordQuizResult({
        topic,
        difficulty,
        score: totalScore,
        totalQuestions: questions.length,
      });
    }
  };

  const currentQ = questions[currentIndex];
  const hasConfirmedCurrent = isAnswerSubmitted[currentIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold font-display text-white">
            AI-Powered C Practice Quizzes
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Personalized interactive tests covering conceptual definitions, pointer outputs, loop conditions, and syntax diagnostics.
        </p>
      </div>

      {!questions.length && !isLoading && !isQuizComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quiz Configuration Panel */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-5">
            <h3 className="text-base font-bold font-display text-white">
              Configure Your Practice Quiz
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                C Syllabus Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Loops, Pointers, Arrays, Dynamic Memory..."
                className="w-full rounded-xl bg-[#080d17] border border-slate-700/70 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Fundamentals', 'Loops & Patterns', 'Functions', 'Pointers & Memory', 'Structures', 'Dynamic Memory'].map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Questions</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Format</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-200"
                >
                  <option value="mcq">Standard MCQs</option>
                  <option value="predict-output">Predict Output</option>
                  <option value="find-error">Find the Error</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Generate Quiz Questions</span>
            </button>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Recent Quiz History</span>
            </h3>

            {state.quizHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No past quizzes. Take your first quiz today to track performance!
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {state.quizHistory.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#080d17] border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{att.topic}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(att.date).toLocaleDateString()} • {att.difficulty}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-sm ${
                          att.percentage >= 70
                            ? 'text-emerald-400'
                            : att.percentage >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {att.score}/{att.totalQuestions}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-12 text-center text-purple-300 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          <div className="text-sm font-semibold text-white">Generating Quiz with Gemini...</div>
          <p className="text-xs text-slate-400">Verifying C code snippets, options, and accurate explanations.</p>
        </div>
      )}

      {/* Active Quiz Player */}
      {questions.length > 0 && !isQuizComplete && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-6 shadow-2xl">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono font-bold text-purple-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-mono">
              Score: {score} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {currentQ.question}
            </h3>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#080d17] border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-[#080d17] border-slate-800 text-slate-300 hover:border-slate-700';

              if (hasConfirmedCurrent) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200';
                } else {
                  btnStyle = 'bg-[#080d17]/40 border-slate-850 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-purple-950/50 border-purple-500 text-purple-100 shadow-sm';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasConfirmedCurrent}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm transition ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasConfirmedCurrent && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasConfirmedCurrent && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation once confirmed */}
          {hasConfirmedCurrent && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-1.5 animate-in fade-in duration-200">
              <span className="font-bold text-purple-300 block">Explanation:</span>
              <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              {currentQ.testedConcept && (
                <div className="text-[11px] text-cyan-400 font-mono pt-1">
                  Concept tested: {currentQ.testedConcept}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            {!hasConfirmedCurrent ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedAnswers[currentIndex] === undefined}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                Confirm Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz & View Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Final Results Screen */}
      {isQuizComplete && (
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-[#0c1220] p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 mx-auto flex items-center justify-center shadow-lg shadow-amber-950/40">
            <Trophy className="w-8 h-8 text-slate-950" />
          </div>

          <div>
            <h3 className="text-2xl font-bold font-display text-white">Quiz Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your results have been recorded to your B.Tech progress profile.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080d17] border border-slate-800 flex items-center justify-around">
            <div>
              <div className="text-3xl font-bold text-white font-mono">
                {score} / {questions.length}
              </div>
              <span className="text-xs text-slate-400">Total Score</span>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <span className="text-xs text-slate-400">Accuracy</span>
            </div>
          </div>

          <button
            onClick={() => {
              setQuestions([]);
              setIsQuizComplete(false);
            }}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
          >
            Take Another Practice Quiz
          </button>
        </div>
      )}
    </div>
  );
};
