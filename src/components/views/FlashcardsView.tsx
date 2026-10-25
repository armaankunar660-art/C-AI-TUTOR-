import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { FlashcardItem } from '../../types';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { state, toggleFlashcardKnown, addCustomFlashcard, addXP } = useStudent();
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);

  // New card form state
  const [newTopic, setNewTopic] = useState('Pointers');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const topics = ['All', ...Array.from(new Set(state.flashcards.map((f) => f.topic)))];

  const filteredCards = state.flashcards.filter(
    (c) => selectedTopic === 'All' || c.topic === selectedTopic
  );

  const activeCard: FlashcardItem | undefined = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleKnown = () => {
    if (activeCard) {
      toggleFlashcardKnown(activeCard.id);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    addCustomFlashcard({
      topic: newTopic,
      frontQuestion: newFront,
      backAnswer: newBack,
      difficulty: 'intermediate',
    });
    setNewFront('');
    setNewBack('');
    setIsAddingCard(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white">
              C Revision Flashcards
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Interactive active-recall cards for B.Tech definitions, pointer syntax, and library mechanics.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCard(!isAddingCard)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddingCard ? 'Close Form' : 'Add Custom Card'}</span>
        </button>
      </div>

      {/* Add Card Form Modal / Collapsible */}
      {isAddingCard && (
        <form
          onSubmit={handleCreateCard}
          className="p-5 rounded-2xl border border-purple-800/60 bg-[#0c1220] space-y-3"
        >
          <h3 className="text-sm font-bold text-purple-300">Create New Flashcard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Topic</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Memory, Strings"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Front Question / Concept
              </label>
              <input
                type="text"
                required
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="e.g. What does volatile keyword do in C?"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Back Explanation / Answer
            </label>
            <textarea
              required
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="e.g. Tells the compiler not to optimize the variable as its value may change from outside the program (hardware register/interrupt)..."
              rows={2}
              className="w-full rounded-lg bg-[#080d17] border border-slate-700 p-2 text-xs text-slate-200"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
          >
            Save Flashcard (+20 XP)
          </button>
        </form>
      )}

      {/* Filter Topics Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 shrink-0 font-medium mr-1">Filter Topic:</span>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => {
              setSelectedTopic(t);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
              selectedTopic === t
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Flashcard 3D Interactive Card */}
      {activeCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div
            onClick={handleFlip}
            className="relative h-80 w-full cursor-pointer rounded-2xl perspective-1000 group select-none"
          >
            <div
              className={`w-full h-full rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl ${
                isFlipped
                  ? 'bg-gradient-to-br from-[#131133] to-[#0c1220] border-cyan-500/50 text-cyan-100'
                  : 'bg-gradient-to-br from-[#0e1628] to-[#080d19] border-slate-700/80 text-slate-100 hover:border-purple-500/50'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                  {activeCard.topic}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      activeCard.known
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                    }`}
                  >
                    {activeCard.known ? 'Mastered' : 'Needs Review'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-3">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  {isFlipped ? 'Answer & Explanation' : 'Concept / Question'}
                </span>
                <p className="text-base sm:text-lg font-medium leading-relaxed">
                  {isFlipped ? activeCard.backAnswer : activeCard.frontQuestion}
                </p>
              </div>

              {/* Card Footer Hint */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Reviews: {activeCard.reviewCount}</span>
                <span className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click anywhere to flip</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleToggleKnown}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeCard.known
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeCard.known ? 'Mark as Needs Review' : 'Mark as Known (+15 XP)'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No flashcards found for topic "{selectedTopic}".
        </div>
      )}
    </div>
  );
};
