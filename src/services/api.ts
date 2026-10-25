import { CompilerResult, DifficultyLevel, LearningMode, QuizQuestion, StudentState } from '../types';

export const api = {
  // Compiler
  async runCode(code: string, stdin: string = ''): Promise<CompilerResult> {
    const res = await fetch('/api/compiler/run', {
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
    const res = await fetch('/api/compiler/status');
    return res.json();
  },

  // AI Tutor
  async askTutor(params: {
    question: string;
    difficulty: DifficultyLevel;
    mode: LearningMode;
    history?: Array<{ role: string; text: string }>;
  }): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/tutor', {
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
    const res = await fetch('/api/ai/generate', {
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
    const res = await fetch('/api/ai/explain', {
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
    const res = await fetch('/api/ai/debug', {
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
    const res = await fetch('/api/ai/exam', {
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
    const res = await fetch('/api/ai/quiz', {
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
    const res = await fetch('/api/ai/study-plan', {
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
    const res = await fetch('/api/ai/screenshot', {
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
      const res = await fetch(`/api/student/load?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.data;
    } catch (e) {
      console.warn('Could not load student from server, fallback to local', e);
      return null;
    }
  },

  async saveStudent(userId: string, data: Partial<StudentState>): Promise<void> {
    try {
      await fetch('/api/student/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data }),
      });
    } catch (e) {
      console.warn('Could not persist student to server', e);
    }
  },

  async resetStudent(userId: string): Promise<void> {
    await fetch('/api/student/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },
};
