export type DifficultyLevel = 'auto' | 'beginner' | 'intermediate' | 'advanced';
export type LearningMode = 'learn' | 'practice' | 'solve';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  semester: string;
  examDate?: string;
  avatarSeed?: string;
}

export interface StudentState {
  profile: StudentProfile;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedTopics: string[];
  savedPrograms: SavedProgram[];
  savedExplanations: SavedExplanation[];
  quizHistory: QuizAttempt[];
  mistakeNotes: MistakeEntry[];
  studyTargets: StudyTarget[];
  flashcards: FlashcardItem[];
  completedChallenges: string[];
  achievements: string[];
}

export interface SavedProgram {
  id: string;
  title: string;
  code: string;
  topic: string;
  difficulty: DifficultyLevel;
  createdAt: string;
  notes?: string;
}

export interface SavedExplanation {
  id: string;
  title: string;
  codeSnippet: string;
  content: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  weakPoints?: string[];
}

export interface MistakeEntry {
  id: string;
  title: string;
  topic: string;
  bugType: 'Syntax' | 'Compilation' | 'Runtime' | 'Logical' | 'Memory / Pointer' | 'Undefined Behavior';
  buggyCode: string;
  errorMessage?: string;
  correctedCode: string;
  explanation: string;
  personalNotes?: string;
  dateAdded: string;
}

export interface StudyTarget {
  id: string;
  title: string;
  description: string;
  topic: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Completed';
  completedAt?: string;
}

export interface FlashcardItem {
  id: string;
  topic: string;
  frontQuestion: string;
  backAnswer: string;
  difficulty: DifficultyLevel;
  known: boolean;
  reviewCount: number;
  lastReviewed?: string;
}

export interface CompilerResult {
  success: boolean;
  phase: 'compilation' | 'execution';
  stdout: string;
  stderr: string;
  warnings?: string;
  compilationError?: string;
  exitCode: number;
  executionTimeMs: number;
  error?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  testedConcept?: string;
}
