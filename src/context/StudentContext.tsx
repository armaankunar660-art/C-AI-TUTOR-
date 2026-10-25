import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StudentState,
  StudentProfile,
  SavedProgram,
  SavedExplanation,
  QuizAttempt,
  MistakeEntry,
  StudyTarget,
  FlashcardItem,
} from '../types';
import { api } from '../services/api';
import { calculateLevel, updateStreak, evaluateUnlockedAchievements } from '../utils/gamification';
import confetti from 'canvas-confetti';

const INITIAL_PROFILE: StudentProfile = {
  id: 'student_1',
  name: 'Armaan Kunar',
  email: 'armaankunar660@gmail.com',
  college: 'B.Tech Computer Science & Engineering',
  branch: 'CSE (Semester 1 / 2)',
  semester: 'Semester 1',
  examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  avatarSeed: 'c_master',
};

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    topic: 'Pointers',
    frontQuestion: 'What does the unary operator `*` do when applied to a pointer variable in C?',
    backAnswer: 'Dereferencing operator: accesses the value stored at the memory address pointed to by the pointer (e.g., `*ptr = 20;`).',
    difficulty: 'beginner',
    known: false,
    reviewCount: 0,
  },
  {
    id: 'fc_2',
    topic: 'Functions',
    frontQuestion: 'Does C support pass-by-reference natively?',
    backAnswer: 'No. Standard C strictly passes ALL arguments by value. To simulate reference semantics, C passes pointer values (memory addresses) by value.',
    difficulty: 'intermediate',
    known: false,
    reviewCount: 0,
  },
  {
    id: 'fc_3',
    topic: 'Memory',
    frontQuestion: 'What is the difference between malloc() and calloc() in stdlib.h?',
    backAnswer: 'malloc(size) allocates uninitialized memory (contains garbage values); calloc(num, size) allocates memory and initializes all bytes to zero.',
    difficulty: 'intermediate',
    known: false,
    reviewCount: 0,
  },
  {
    id: 'fc_4',
    topic: 'Structures',
    frontQuestion: 'What is the arrow operator (->) used for in C?',
    backAnswer: 'Member access through a pointer to a struct or union. `ptr->member` is shorthand for `(*ptr).member`.',
    difficulty: 'beginner',
    known: false,
    reviewCount: 0,
  },
  {
    id: 'fc_5',
    topic: 'Arrays',
    frontQuestion: 'Why does an array name decay into a pointer in most expressions?',
    backAnswer: 'In C, an array identifier automatically evaluates to a pointer to its first element (&arr[0]), except with sizeof, &arr, or string literals.',
    difficulty: 'advanced',
    known: false,
    reviewCount: 0,
  },
];

const INITIAL_STATE: StudentState = {
  profile: INITIAL_PROFILE,
  xp: 0,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedTopics: [],
  savedPrograms: [],
  savedExplanations: [],
  quizHistory: [],
  mistakeNotes: [],
  studyTargets: [
    {
      id: 'target_1',
      title: 'Revise Loop Control & Nested Patterns',
      description: 'Practice for, while, and do-while loops with star patterns.',
      topic: 'Control Flow',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'High',
      status: 'Pending',
    },
    {
      id: 'target_2',
      title: 'Master Pointer Arithmetic and Dynamic Arrays',
      description: 'Solve 3 malloc/free exercises and pointer offset logic.',
      topic: 'Pointers and Memory',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending',
    },
  ],
  flashcards: DEFAULT_FLASHCARDS,
  completedChallenges: [],
  achievements: [],
};

interface StudentContextType {
  state: StudentState;
  addXP: (amount: number, reason?: string) => void;
  recordActivity: () => void;
  toggleTopicCompletion: (topicId: string) => void;
  saveProgram: (program: Omit<SavedProgram, 'id' | 'createdAt'>) => void;
  deleteSavedProgram: (id: string) => void;
  saveExplanation: (explanation: Omit<SavedExplanation, 'id' | 'createdAt'>) => void;
  deleteSavedExplanation: (id: string) => void;
  recordQuizResult: (attempt: Omit<QuizAttempt, 'id' | 'date' | 'percentage'>) => void;
  addMistakeNote: (note: Omit<MistakeEntry, 'id' | 'dateAdded'>) => void;
  deleteMistakeNote: (id: string) => void;
  addStudyTarget: (target: Omit<StudyTarget, 'id'>) => void;
  updateStudyTarget: (id: string, updates: Partial<StudyTarget>) => void;
  deleteStudyTarget: (id: string) => void;
  toggleFlashcardKnown: (id: string) => void;
  addCustomFlashcard: (card: Omit<FlashcardItem, 'id' | 'known' | 'reviewCount'>) => void;
  completeChallenge: (challengeId: string) => void;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  switchUser: (email: string, name: string) => void;
  resetAllData: () => Promise<void>;
  recentUnlockedBadge: string | null;
  clearRecentBadge: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StudentState>(() => {
    try {
      const cached = localStorage.getItem('c_tutor_student_state');
      if (cached) return JSON.parse(cached);
    } catch {}
    return INITIAL_STATE;
  });

  const [recentUnlockedBadge, setRecentUnlockedBadge] = useState<string | null>(null);

  // Load from persistent server store on mount
  useEffect(() => {
    async function init() {
      const serverData = await api.loadStudent(state.profile.id);
      if (serverData && serverData.profile) {
        setState(serverData);
      }
    }
    init();
  }, [state.profile.id]);

  // Persist to server and localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('c_tutor_student_state', JSON.stringify(state));
      api.saveStudent(state.profile.id, state);
    } catch {}
  }, [state]);

  const clearRecentBadge = () => setRecentUnlockedBadge(null);

  // Record active learning day & recalculate streak
  const recordActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    const { newStreak, newDate } = updateStreak(state.lastActiveDate, state.streakDays, today);
    if (newStreak !== state.streakDays || newDate !== state.lastActiveDate) {
      setState((prev) => ({
        ...prev,
        streakDays: newStreak,
        lastActiveDate: newDate,
      }));
    }
  };

  const addXP = (amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      const { level } = calculateLevel(newXp);

      // Check achievements
      const { newlyUnlocked, allUnlockedIds } = evaluateUnlockedAchievements({
        ...prev,
        xp: newXp,
        level,
        topicsCompletedCount: prev.completedTopics.length,
        quizzesCompletedCount: prev.quizHistory.length,
        debuggingsCompletedCount: prev.mistakeNotes.length,
        challengesCompletedCount: prev.completedChallenges.length,
      });

      if (newlyUnlocked.length > 0) {
        setRecentUnlockedBadge(newlyUnlocked[0].title);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}
      }

      return {
        ...prev,
        xp: newXp,
        level,
        achievements: allUnlockedIds,
      };
    });
  };

  const toggleTopicCompletion = (topicId: string) => {
    recordActivity();
    setState((prev) => {
      const exists = prev.completedTopics.includes(topicId);
      const updated = exists
        ? prev.completedTopics.filter((t) => t !== topicId)
        : [...prev.completedTopics, topicId];

      if (!exists) {
        addXP(50);
      }

      return {
        ...prev,
        completedTopics: updated,
      };
    });
  };

  const saveProgram = (program: Omit<SavedProgram, 'id' | 'createdAt'>) => {
    const newProg: SavedProgram = {
      ...program,
      id: `prog_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      savedPrograms: [newProg, ...prev.savedPrograms],
    }));
    addXP(20);
  };

  const deleteSavedProgram = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedPrograms: prev.savedPrograms.filter((p) => p.id !== id),
    }));
  };

  const saveExplanation = (explanation: Omit<SavedExplanation, 'id' | 'createdAt'>) => {
    const newExpl: SavedExplanation = {
      ...explanation,
      id: `expl_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      savedExplanations: [newExpl, ...prev.savedExplanations],
    }));
    addXP(15);
  };

  const deleteSavedExplanation = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedExplanations: prev.savedExplanations.filter((e) => e.id !== id),
    }));
  };

  const recordQuizResult = (attempt: Omit<QuizAttempt, 'id' | 'date' | 'percentage'>) => {
    recordActivity();
    const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `quiz_${Date.now()}`,
      date: new Date().toISOString(),
      percentage,
    };

    const earnedXp = Math.max(25, attempt.score * 20);
    addXP(earnedXp);

    setState((prev) => ({
      ...prev,
      quizHistory: [newAttempt, ...prev.quizHistory],
    }));
  };

  const addMistakeNote = (note: Omit<MistakeEntry, 'id' | 'dateAdded'>) => {
    recordActivity();
    const newMistake: MistakeEntry = {
      ...note,
      id: `mistake_${Date.now()}`,
      dateAdded: new Date().toISOString(),
    };
    addXP(30);
    setState((prev) => ({
      ...prev,
      mistakeNotes: [newMistake, ...prev.mistakeNotes],
    }));
  };

  const deleteMistakeNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      mistakeNotes: prev.mistakeNotes.filter((m) => m.id !== id),
    }));
  };

  const addStudyTarget = (target: Omit<StudyTarget, 'id'>) => {
    const newTarget: StudyTarget = {
      ...target,
      id: `target_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      studyTargets: [...prev.studyTargets, newTarget],
    }));
    addXP(10);
  };

  const updateStudyTarget = (id: string, updates: Partial<StudyTarget>) => {
    setState((prev) => ({
      ...prev,
      studyTargets: prev.studyTargets.map((t) => {
        if (t.id === id) {
          if (updates.status === 'Completed' && t.status !== 'Completed') {
            addXP(40);
          }
          return { ...t, ...updates };
        }
        return t;
      }),
    }));
  };

  const deleteStudyTarget = (id: string) => {
    setState((prev) => ({
      ...prev,
      studyTargets: prev.studyTargets.filter((t) => t.id !== id),
    }));
  };

  const toggleFlashcardKnown = (id: string) => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((f) => {
        if (f.id === id) {
          const nextKnown = !f.known;
          if (nextKnown) addXP(15);
          return {
            ...f,
            known: nextKnown,
            reviewCount: f.reviewCount + 1,
            lastReviewed: new Date().toISOString(),
          };
        }
        return f;
      }),
    }));
  };

  const addCustomFlashcard = (card: Omit<FlashcardItem, 'id' | 'known' | 'reviewCount'>) => {
    const newCard: FlashcardItem = {
      ...card,
      id: `fc_${Date.now()}`,
      known: false,
      reviewCount: 0,
    };
    setState((prev) => ({
      ...prev,
      flashcards: [newCard, ...prev.flashcards],
    }));
    addXP(20);
  };

  const completeChallenge = (challengeId: string) => {
    recordActivity();
    setState((prev) => {
      if (prev.completedChallenges.includes(challengeId)) return prev;
      addXP(75);
      return {
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
      };
    });
  };

  const updateProfile = (profile: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  const switchUser = (email: string, name: string) => {
    const userId = `student_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const newProfile: StudentProfile = {
      id: userId,
      name,
      email,
      college: 'B.Tech Computer Science & Engineering',
      branch: 'CSE',
      semester: 'Semester 1',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      avatarSeed: name.toLowerCase().replace(/\s+/g, '_'),
    };
    setState({
      ...INITIAL_STATE,
      profile: newProfile,
    });
  };

  const resetAllData = async () => {
    await api.resetStudent(state.profile.id);
    localStorage.removeItem('c_tutor_student_state');
    setState(INITIAL_STATE);
  };

  return (
    <StudentContext.Provider
      value={{
        state,
        addXP,
        recordActivity,
        toggleTopicCompletion,
        saveProgram,
        deleteSavedProgram,
        saveExplanation,
        deleteSavedExplanation,
        recordQuizResult,
        addMistakeNote,
        deleteMistakeNote,
        addStudyTarget,
        updateStudyTarget,
        deleteStudyTarget,
        toggleFlashcardKnown,
        addCustomFlashcard,
        completeChallenge,
        updateProfile,
        switchUser,
        resetAllData,
        recentUnlockedBadge,
        clearRecentBadge,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};
