import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  getUserStorageKey,
  createInitialStudentState,
  sanitizeStudentPayload,
  DEFAULT_STARTER_FLASHCARDS,
} from '../utils/studentData';
import { calculateLevel, updateStreak, evaluateUnlockedAchievements } from '../utils/gamification';
import confetti from 'canvas-confetti';

interface StudentContextType {
  state: StudentState;
  isSyncing: boolean;
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
  resetAllData: () => Promise<void>;
  recentUnlockedBadge: string | null;
  clearRecentBadge: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentUnlockedBadge, setRecentUnlockedBadge] = useState<string | null>(null);

  // Initialize state based on current user or guest
  const [state, setState] = useState<StudentState>(() => {
    const key = getUserStorageKey(currentUser?.uid);
    try {
      const cached = localStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    } catch {}
    return createInitialStudentState({
      uid: currentUser?.uid || 'guest',
      email: currentUser?.email || '',
      name: currentUser?.displayName || (isGuest ? 'Guest Learner' : 'Student'),
    });
  });

  const isInitialMount = useRef(true);

  // Whenever currentUser or isGuest changes, switch the active student profile safely
  useEffect(() => {
    let isCancelled = false;

    async function loadUserData() {
      setIsSyncing(true);

      if (currentUser) {
        const storageKey = getUserStorageKey(currentUser.uid);
        let localState: StudentState | null = null;

        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) localState = JSON.parse(cached);
        } catch {}

        // Fallback state before network resolves
        if (localState) {
          setState(localState);
        } else {
          setState(
            createInitialStudentState({
              uid: currentUser.uid,
              email: currentUser.email || '',
              name: currentUser.displayName || 'Student',
            })
          );
        }

        // Fetch authoritative remote document from Cloud Firestore
        try {
          const docPath = `users/${currentUser.uid}`;
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);

          if (isCancelled) return;

          if (snap.exists()) {
            const data = snap.data();
            const remoteState: StudentState = {
              profile: {
                id: currentUser.uid,
                name: data.name || currentUser.displayName || 'Student',
                email: data.email || currentUser.email || '',
                college: data.college || 'B.Tech Computer Science & Engineering',
                branch: data.branch || 'CSE',
                semester: data.semester || 'Semester 1',
                examDate: data.examDate || '',
                avatarSeed: data.avatarSeed || 'student',
              },
              xp: typeof data.xp === 'number' ? data.xp : 0,
              level: typeof data.level === 'number' ? data.level : 1,
              streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
              lastActiveDate: data.lastActiveDate || new Date().toISOString().split('T')[0],
              completedTopics: Array.isArray(data.completedTopics) ? data.completedTopics : [],
              completedChallenges: Array.isArray(data.completedChallenges) ? data.completedChallenges : [],
              achievements: Array.isArray(data.achievements) ? data.achievements : [],
              savedPrograms: Array.isArray(data.savedPrograms) ? data.savedPrograms : [],
              savedExplanations: Array.isArray(data.savedExplanations) ? data.savedExplanations : [],
              quizHistory: Array.isArray(data.quizHistory) ? data.quizHistory : [],
              mistakeNotes: Array.isArray(data.mistakeNotes) ? data.mistakeNotes : [],
              studyTargets: Array.isArray(data.studyTargets) ? data.studyTargets : [],
              flashcards: Array.isArray(data.flashcards) && data.flashcards.length > 0 ? data.flashcards : DEFAULT_STARTER_FLASHCARDS,
            };

            setState(remoteState);
            localStorage.setItem(storageKey, JSON.stringify(remoteState));
          } else {
            // First time this user logs in: initialize their Firestore document
            let meta: any = {};
            try {
              const metaStr = sessionStorage.getItem(`c_tutor_signup_meta_${currentUser.uid}`);
              if (metaStr) {
                meta = JSON.parse(metaStr);
                sessionStorage.removeItem(`c_tutor_signup_meta_${currentUser.uid}`);
              }
            } catch {}

            const freshState = createInitialStudentState({
              uid: currentUser.uid,
              email: currentUser.email || '',
              name: currentUser.displayName || meta.name || 'Student',
              college: meta.college,
              branch: meta.branch,
              semester: meta.semester,
              examDate: meta.examDate,
            });

            setState(freshState);
            localStorage.setItem(storageKey, JSON.stringify(freshState));

            try {
              const payload = sanitizeStudentPayload(freshState, currentUser.uid);
              await setDoc(userDocRef, payload);
            } catch (firestoreErr) {
              handleFirestoreError(firestoreErr, OperationType.CREATE, docPath);
            }
          }
        } catch (err: any) {
          console.warn('[Sync] Firestore load error (falling back to local cache):', err?.message || err);
        }
      } else if (isGuest) {
        // Guest mode: isolated guest storage key
        const guestKey = 'c_tutor_guest_state';
        try {
          const cached = localStorage.getItem(guestKey);
          if (cached) {
            setState(JSON.parse(cached));
          } else {
            const guestState = createInitialStudentState({
              uid: 'guest',
              email: 'guest@student.edu',
              name: 'Guest Learner',
              college: 'Demo Engineering Campus',
            });
            setState(guestState);
            localStorage.setItem(guestKey, JSON.stringify(guestState));
          }
        } catch {}
      } else {
        // Unauthenticated & not guest: fresh empty template
        setState(
          createInitialStudentState({
            uid: 'unauthenticated',
            email: '',
            name: 'Learner',
          })
        );
      }

      setIsSyncing(false);
    }

    loadUserData();

    return () => {
      isCancelled = true;
    };
  }, [currentUser?.uid, isGuest]);

  // Persist local state and remote Cloud Firestore
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const uid = currentUser?.uid;
    const storageKey = getUserStorageKey(uid);

    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}

    if (uid && currentUser) {
      const docPath = `users/${uid}`;
      const payload = sanitizeStudentPayload(state, uid);
      setDoc(doc(db, 'users', uid), payload, { merge: true }).catch((err) => {
        console.warn('[Firestore] Sync warning:', err?.message || err);
      });
    }
  }, [state, currentUser]);

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

  const resetAllData = async () => {
    if (currentUser) {
      const docPath = `users/${currentUser.uid}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
      localStorage.removeItem(getUserStorageKey(currentUser.uid));
      setState(
        createInitialStudentState({
          uid: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName || 'Student',
        })
      );
    } else {
      localStorage.removeItem('c_tutor_guest_state');
      setState(
        createInitialStudentState({
          uid: 'guest',
          email: '',
          name: 'Guest Learner',
        })
      );
    }
  };

  return (
    <StudentContext.Provider
      value={{
        state,
        isSyncing,
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
