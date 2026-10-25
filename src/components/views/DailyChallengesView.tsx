import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { CodeEditor } from '../common/CodeEditor';
import {
  Flame,
  CheckCircle,
  HelpCircle,
  Terminal,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DailyChallengesViewProps {
  onOpenInPlayground: (code: string) => void;
}

const CHALLENGES = [
  {
    id: 'challenge_1',
    title: 'Matrix Diagonal Sum',
    difficulty: 'Intermediate',
    topic: '2D Arrays',
    description:
      'Given an N x N square matrix of integers, calculate the sum of the primary diagonal (from top-left to bottom-right) and secondary diagonal (from top-right to bottom-left). If N is odd, ensure the central element is not double counted.',
    constraints: '1 <= N <= 100, -10^4 <= matrix[i][j] <= 10^4',
    sampleInput: '3\n1 2 3\n4 5 6\n7 8 9',
    sampleOutput: 'Sum of Diagonals = 25 (1+5+9 + 3+7)',
    hints: [
      'Primary diagonal elements have indices where row == col.',
      'Secondary diagonal elements have indices where col == N - 1 - row.',
      'If row == col and col == N - 1 - row, subtract the intersection element once.',
    ],
    starterCode: `// Daily Challenge: Matrix Diagonal Sum
#include <stdio.h>

int main(void) {
    int n = 3;
    int mat[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += mat[i][i]; // Primary diagonal
        if (i != n - 1 - i) {
            sum += mat[i][n - 1 - i]; // Secondary diagonal without overlap
        }
    }

    printf("Sum of Diagonals = %d\\n", sum);
    return 0;
}`,
  },
  {
    id: 'challenge_2',
    title: 'Palindrome String via Pointers',
    difficulty: 'Intermediate',
    topic: 'Pointers & Strings',
    description:
      'Write a C program that determines if a string is a palindrome using two pointers (one starting at the head and one at the tail) moving towards each other, without creating a reversed copy in memory.',
    constraints: 'String length <= 1000, case sensitive.',
    sampleInput: 'radar',
    sampleOutput: 'radar is a Palindrome',
    hints: [
      'Find the length of string with strlen().',
      'Initialize left pointer = str, right pointer = str + len - 1.',
      'Loop while left < right and check if *left != *right.',
    ],
    starterCode: `// Palindrome via Pointers
#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(const char *str) {
    const char *left = str;
    const char *right = str + strlen(str) - 1;

    while (left < right) {
        if (*left != *right) return false;
        left++;
        right--;
    }
    return true;
}

int main(void) {
    char word[] = "radar";
    if (isPalindrome(word)) {
        printf("%s is a Palindrome\\n", word);
    } else {
        printf("%s is NOT a Palindrome\\n", word);
    }
    return 0;
}`,
  },
];

export const DailyChallengesView: React.FC<DailyChallengesViewProps> = ({
  onOpenInPlayground,
}) => {
  const { state, completeChallenge } = useStudent();
  const [activeChallengeId, setActiveChallengeId] = useState(CHALLENGES[0].id);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const challenge = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];
  const isSolved = state.completedChallenges.includes(challenge.id);

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleComplete = () => {
    completeChallenge(challenge.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Daily C Coding Challenges
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Daily algorithmic problem designed for B.Tech engineering interviews and semester lab exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {CHALLENGES.map((ch) => {
            const solved = state.completedChallenges.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChallengeId(ch.id);
                  setRevealedHints({});
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeChallengeId === ch.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {solved && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                <span>{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Problem Statement (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                {challenge.difficulty} • {challenge.topic}
              </span>

              {isSolved ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Solved (+75 XP)</span>
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium">Reward: +75 XP</span>
              )}
            </div>

            <h3 className="text-xl font-bold font-display text-white">{challenge.title}</h3>

            <p className="text-sm text-slate-300 leading-relaxed">{challenge.description}</p>

            <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800/80 text-xs space-y-2">
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Constraints: </span>
                <span className="font-mono text-cyan-300">{challenge.constraints}</span>
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Sample Input: </span>
                <span className="font-mono text-slate-200 block mt-0.5">{challenge.sampleInput}</span>
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Sample Output: </span>
                <span className="font-mono text-emerald-400 block mt-0.5">{challenge.sampleOutput}</span>
              </div>
            </div>

            {/* Progressive Hints Accordion */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Progressive Hints</span>
              </span>
              {challenge.hints.map((hint, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-[#080d17] p-3 text-xs"
                >
                  <button
                    onClick={() => toggleHint(idx)}
                    className="w-full flex items-center justify-between text-left text-slate-300 hover:text-white font-medium"
                  >
                    <span>Hint {idx + 1}</span>
                    <span className="text-[11px] text-purple-400">
                      {revealedHints[idx] ? 'Hide' : 'Reveal Hint'}
                    </span>
                  </button>
                  {revealedHints[idx] && (
                    <div className="mt-2 text-slate-300 text-[11px] leading-relaxed border-t border-slate-800 pt-1.5">
                      {hint}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              {!isSolved ? (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Challenge as Solved (+75 XP)</span>
                </button>
              ) : (
                <div className="p-3 text-center rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 font-semibold">
                  Challenge completed! Great engineering practice.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Code Solution & Playground Launcher (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              C Solution & Starter Template
            </span>
            <button
              onClick={() => onOpenInPlayground(challenge.starterCode)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Test in GCC Playground</span>
            </button>
          </div>

          <CodeEditor
            code={challenge.starterCode}
            readOnly
            title={`${challenge.title} - Solution`}
            heightClass="min-h-[420px]"
          />
        </div>
      </div>
    </div>
  );
};
