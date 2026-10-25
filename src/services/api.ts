import { CompilerResult, DifficultyLevel, LearningMode, QuizQuestion, StudentState } from '../types';

/**
 * Returns the base API URL.
 * When running inside a native Android Capacitor app, defaults to the hosted production Cloud Run backend
 * or VITE_API_BASE_URL. In a standard web browser, uses relative URLs.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const isCapacitorNative = Boolean((window as any).Capacitor?.isNativePlatform?.());
    if (isCapacitorNative) {
      return (
        (import.meta as any).env?.VITE_API_BASE_URL ||
        'https://ais-pre-4d7qgpqleioljbwiyf2ilw-587647140681.asia-southeast1.run.app'
      );
    }
  }
  return (import.meta as any).env?.VITE_API_BASE_URL || '';
}

export const api = {
  // Compiler
  async runCode(code: string, stdin: string = ''): Promise<CompilerResult> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/compiler/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, stdin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Compiler request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async getCompilerStatus(): Promise<{ available: boolean; version: string | null; compiler: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/compiler/status`);
    return res.json();
  },

  // AI Tutor
  async askTutor(params: {
    question: string;
    difficulty: DifficultyLevel;
    mode: LearningMode;
    history?: Array<{ role: string; text: string }>;
  }): Promise<{ reply: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Tutor request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // AI Code Generator
  async generateCode(params: {
    problem: string;
    difficulty: DifficultyLevel;
    mode: LearningMode;
    expectedInput?: string;
    expectedOutput?: string;
  }): Promise<{ text: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Code generation failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // AI Explainer
  async explainCode(params: {
    code: string;
    isBeginnerFriendly?: boolean;
  }): Promise<{ explanation: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Explanation failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // AI Debugger
  async debugCode(params: {
    code: string;
    errorMessage?: string;
    expectedBehavior?: string;
    difficulty?: DifficultyLevel;
  }): Promise<{ analysis: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/debug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Debugging analysis failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Exam Preparation
  async generateExamAnswer(params: {
    topic: string;
    question?: string;
    markFormat: '2-mark' | '5-mark' | '10-mark' | 'quick-revision';
  }): Promise<{ answer: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Exam prep request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Quiz Generator
  async generateQuiz(params: {
    topic: string;
    difficulty: DifficultyLevel;
    count: number;
    questionType: string;
  }): Promise<{ topic: string; difficulty: string; questions: QuizQuestion[] }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Quiz generation failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Study Plan Generator
  async generateStudyPlan(params: {
    examDate: string;
    dailyHours: number;
    weakTopics: string[];
    targetGrade: string;
  }): Promise<any> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Study plan generation failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Multimodal Screenshot Solver
  async analyzeScreenshot(params: {
    imageBase64: string;
    mimeType?: string;
    action: 'explain' | 'solve' | 'debug' | 'notes' | 'mcq';
    customPrompt?: string;
  }): Promise<{ result: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ai/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Screenshot processing failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Student Persistence
  async loadStudent(userId: string): Promise<StudentState | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/student/load?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.data;
    } catch (e) {
      console.warn('Could not load student from server, fallback to local', e);
      return null;
    }
  },

  async saveStudent(userId: string, data: Partial<StudentState>): Promise<void> {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/student/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data }),
      });
    } catch (e) {
      console.warn('Could not persist student to server', e);
    }
  },

  async resetStudent(userId: string): Promise<void> {
    const baseUrl = getApiBaseUrl();
    await fetch(`${baseUrl}/api/student/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },
};
