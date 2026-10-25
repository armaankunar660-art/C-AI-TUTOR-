import { StudentState, StudentProfile, FlashcardItem } from '../types';

export const DEFAULT_STARTER_FLASHCARDS: FlashcardItem[] = [
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

export interface InitialProfileParams {
  uid: string;
  email: string;
  name: string;
  college?: string;
  branch?: string;
  semester?: string;
  examDate?: string;
  avatarSeed?: string;
}

export function getUserStorageKey(uid: string | null | undefined): string {
  if (!uid || uid === 'guest') {
    return 'c_tutor_guest_state';
  }
  // Sanitize UID to prevent key collision
  const cleanUid = uid.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `c_tutor_user_state_${cleanUid}`;
}

export function createInitialStudentState(params: InitialProfileParams): StudentState {
  const defaultExamDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const profile: StudentProfile = {
    id: params.uid,
    name: params.name.trim() || 'Student',
    email: params.email.trim(),
    college: params.college?.trim() || 'B.Tech Computer Science & Engineering',
    branch: params.branch?.trim() || 'CSE',
    semester: params.semester?.trim() || 'Semester 1',
    examDate: params.examDate || defaultExamDate,
    avatarSeed: params.avatarSeed || params.name.toLowerCase().replace(/\s+/g, '_') || 'student',
  };

  return {
    profile,
    xp: 0,
    level: 1,
    streakDays: 1,
    lastActiveDate: today,
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
    flashcards: DEFAULT_STARTER_FLASHCARDS,
    completedChallenges: [],
    achievements: [],
  };
}

/**
 * Validates and sanitizes payload for Firestore write to prevent unbounded growth and ensure schema conformity.
 */
export function sanitizeStudentPayload(state: StudentState, userId: string) {
  return {
    userId,
    email: state.profile.email || '',
    name: state.profile.name || 'Student',
    college: state.profile.college || 'B.Tech CSE',
    branch: state.profile.branch || 'CSE',
    semester: state.profile.semester || 'Semester 1',
    examDate: state.profile.examDate || '',
    avatarSeed: state.profile.avatarSeed || 'student',
    xp: typeof state.xp === 'number' ? Math.max(0, state.xp) : 0,
    level: typeof state.level === 'number' ? Math.max(1, state.level) : 1,
    streakDays: typeof state.streakDays === 'number' ? Math.max(1, state.streakDays) : 1,
    lastActiveDate: state.lastActiveDate || new Date().toISOString().split('T')[0],
    completedTopics: Array.isArray(state.completedTopics) ? state.completedTopics.slice(0, 50) : [],
    completedChallenges: Array.isArray(state.completedChallenges) ? state.completedChallenges.slice(0, 100) : [],
    achievements: Array.isArray(state.achievements) ? state.achievements.slice(0, 50) : [],
    savedPrograms: Array.isArray(state.savedPrograms) ? state.savedPrograms.slice(0, 100) : [],
    savedExplanations: Array.isArray(state.savedExplanations) ? state.savedExplanations.slice(0, 100) : [],
    quizHistory: Array.isArray(state.quizHistory) ? state.quizHistory.slice(0, 100) : [],
    mistakeNotes: Array.isArray(state.mistakeNotes) ? state.mistakeNotes.slice(0, 100) : [],
    studyTargets: Array.isArray(state.studyTargets) ? state.studyTargets.slice(0, 100) : [],
    flashcards: Array.isArray(state.flashcards) ? state.flashcards.slice(0, 100) : [],
    updatedAt: new Date().toISOString(),
  };
}
