import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);
const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous payload limit for base64 screenshots
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google Gemini AI SDK on the server with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Storage path for persistent student records
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'student_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStore(): Record<string, any> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading student store:', err);
  }
  return {};
}

function saveStore(data: Record<string, any>) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving student store:', err);
  }
}

// ==========================================
// 1. REAL C CODE COMPILER & EXECUTION ENGINE
// ==========================================

app.post('/api/compiler/run', async (req: Request, res: Response) => {
  const { code, stdin = '' } = req.body;

  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Source code is required.' });
  }

  // Generate unique run ID and temporary directory
  const runId = `c_run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const tempDir = path.join(os.tmpdir(), runId);

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });
    const sourceFile = path.join(tempDir, 'main.c');
    const binaryFile = path.join(tempDir, 'main.out');

    await fs.promises.writeFile(sourceFile, code, 'utf-8');

    // Step 1: Compile with GCC (with -Wall -Wextra for student learning warnings)
    const compileStartTime = Date.now();
    let compilationError = '';
    let compilationWarnings = '';

    try {
      const { stdout: cStdout, stderr: cStderr } = await execAsync(
        `gcc -Wall -Wextra -O0 -lm "${sourceFile}" -o "${binaryFile}"`,
        { timeout: 8000 }
      );
      if (cStderr && cStderr.trim()) {
        compilationWarnings = cStderr.trim();
      }
    } catch (compileErr: any) {
      compilationError = compileErr.stderr || compileErr.message || 'Compilation failed';
      return res.json({
        success: false,
        phase: 'compilation',
        compilationError,
        compilationTimeMs: Date.now() - compileStartTime,
        stdout: '',
        stderr: compilationError,
        exitCode: compileErr.code || 1,
      });
    }

    // Step 2: Execute compiled binary with timeout and stdin
    const execStartTime = Date.now();

    const child = spawn(binaryFile, [], {
      timeout: 5000,
      env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' },
    });

    let runStdout = '';
    let runStderr = '';
    let killedByTimeout = false;

    const timeoutTimer = setTimeout(() => {
      killedByTimeout = true;
      child.kill('SIGKILL');
    }, 5000);

    if (stdin && stdin.length > 0) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    child.stdout.on('data', (chunk) => {
      // Limit output size to prevent memory explosion
      if (runStdout.length < 50000) {
        runStdout += chunk.toString();
      }
    });

    child.stderr.on('data', (chunk) => {
      if (runStderr.length < 50000) {
        runStderr += chunk.toString();
      }
    });

    child.on('close', async (exitCode) => {
      clearTimeout(timeoutTimer);
      const executionTimeMs = Date.now() - execStartTime;

      // Clean up temp directory
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (rmErr) {
        // ignore cleanup error
      }

      if (killedByTimeout) {
        return res.json({
          success: false,
          phase: 'execution',
          error: 'Execution Timed Out (exceeded 5 seconds limit). Check for infinite loops (e.g. while(1) or unincremented counters).',
          stdout: runStdout,
          stderr: 'Time Limit Exceeded (5000ms)',
          executionTimeMs,
          exitCode: 124,
        });
      }

      res.json({
        success: exitCode === 0,
        phase: 'execution',
        stdout: runStdout,
        stderr: runStderr,
        warnings: compilationWarnings,
        exitCode: exitCode ?? 0,
        executionTimeMs,
      });
    });

    child.on('error', async (spawnErr) => {
      clearTimeout(timeoutTimer);
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (rmErr) {}
      res.json({
        success: false,
        phase: 'execution',
        error: spawnErr.message,
        stdout: runStdout,
        stderr: spawnErr.message,
        executionTimeMs: Date.now() - execStartTime,
        exitCode: 1,
      });
    });
  } catch (outerErr: any) {
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch {}
    res.status(500).json({ error: outerErr.message || 'Internal compiler error' });
  }
});

// Check compiler availability
app.get('/api/compiler/status', (_req: Request, res: Response) => {
  exec('gcc --version', (err, stdout) => {
    if (err) {
      return res.json({ available: false, version: null, error: err.message });
    }
    const firstLine = stdout.split('\n')[0] || 'GCC available';
    res.json({ available: true, version: firstLine, compiler: 'gcc' });
  });
});

// ==========================================
// 2. AI ENDPOINTS (GEMINI-3.8-FLASH)
// ==========================================

const C_MENTOR_SYSTEM_INSTRUCTION = `You are "C Tutor AI", an expert C programming professor and mentor built specifically for B.Tech Computer Engineering students, college beginners, and learners mastering the C programming language.
Key pedagogical guidelines:
1. Always generate valid, standard C (C99/C11 compatible) with proper headers (<stdio.h>, <stdlib.h>, etc.).
2. Accurately explain language semantics: clarify that C passes ALL arguments BY VALUE (including pointer values/memory addresses), and does NOT have built-in pass-by-reference semantics like C++ references.
3. Be encouraging, clear, and structured. Adapt deeply to the specified difficulty level (Auto, Beginner, Intermediate, Advanced).
4. Strictly respect the requested Learning Style (Learn Mode = teach concept step by step before code; Practice Mode = give progressive hints and let student try; Solve Mode = provide full solution with code and line-by-line explanation).
5. Never hallucinate compiler output or claim you ran code if you did not. When showing expected output, label it as "Expected Output".`;

// Resilient helper to call Gemini with automatic fallback on 503/429 load spikes
async function callGemini(params: { contents: any; config?: any; systemInstruction?: string }) {
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          ...params.config,
          ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
        },
      });
      return response;
    } catch (err: any) {
      console.warn(`[AI] ${model} unavailable (${err.status || err.message}). Retrying fallback...`);
      lastError = err;
      if (err.status === 503 || err.status === 429 || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE')) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Tutor chat endpoint
app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { question, difficulty = 'auto', mode = 'solve', history = [] } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const difficultyPrompt =
      difficulty === 'beginner'
        ? 'Target Audience: Beginner college student. Explain concepts from scratch in simple English. Introduce technical terms gradually. Line-by-line explanation with simple, clean analogies.'
        : difficulty === 'intermediate'
        ? 'Target Audience: Intermediate student. Cover algorithms, memory layouts, arrays, pointers, strings, edge cases, and standard library best practices.'
        : difficulty === 'advanced'
        ? 'Target Audience: Advanced B.Tech student. Dive into pointer arithmetic, function pointers, memory management, bitwise manipulation, undefined behavior, time/space complexity, and compiler optimizations.'
        : 'Target Audience: Auto-adapt. Estimate the question complexity and calibrate depth accordingly.';

    const modePrompt =
      mode === 'learn'
        ? 'Learning Style: LEARN MODE. Teach the underlying concept step-by-step first. Explain how the logic works and algorithmic intuition BEFORE presenting code.'
        : mode === 'practice'
        ? 'Learning Style: PRACTICE MODE. Do NOT provide the full solution immediately! Guide the student with 2-3 progressive hints, pseudocode, and key pitfalls, and encourage them to write the C code.'
        : 'Learning Style: SOLVE MODE. Provide a comprehensive solution with complete standard C code, clear explanation, expected input/output, and key edge cases.';

    const prompt = `${difficultyPrompt}\n${modePrompt}\n\nStudent Question / Query:\n${question}`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await callGemini({
      contents,
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.7 },
    });

    const reply = response.text || 'No response generated.';
    res.json({ reply, difficulty, mode });
  } catch (err: any) {
    console.error('Tutor API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate tutor response.' });
  }
});

// Code Generator endpoint
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { problem, difficulty = 'auto', mode = 'solve', expectedInput = '', expectedOutput = '' } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem description is required.' });
    }

    const prompt = `Write a complete, compilable standard C program for the following problem description:
Problem: ${problem}
Difficulty Setting: ${difficulty}
Learning Mode: ${mode}
${expectedInput ? `Expected Input:\n${expectedInput}` : ''}
${expectedOutput ? `Expected Output:\n${expectedOutput}` : ''}

Please format your response clearly in markdown:
1. ### Program Overview & Algorithm
2. ### Complete C Code (in a \`\`\`c code block with full headers and comments)
3. ### Step-by-Step Explanation
4. ### Sample Input & Expected Output
5. ### Edge Cases & Common Pitfalls`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.4 },
    });

    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Generate API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate C code.' });
  }
});

// Code Explainer endpoint
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { code, isBeginnerFriendly = false } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    const prompt = `Explain the following C program in depth${isBeginnerFriendly ? ' with beginner-friendly language and simple analogies' : ' with college engineering rigor'}:

\`\`\`c
${code}
\`\`\`

Include the following sections:
1. **Purpose & Goal** of the program
2. **Variables, Data Types & Scope**
3. **Logic Flow** (Loops, Conditionals, Branching)
4. **Functions & Parameters** (Reminding the student that C uses Call-by-Value)
5. **Memory & Pointers** (if used, explain stack vs heap, pointer dereferencing)
6. **Line-by-Line Breakdown** of critical code sections
7. **Time and Space Complexity**
8. **Sample Execution & Expected Output**
9. **Possible Edge Cases & Potential Undefined Behavior**`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.5 },
    });

    res.json({ explanation: response.text || '' });
  } catch (err: any) {
    console.error('Explain API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to explain code.' });
  }
});

// Code Debugger endpoint
app.post('/api/ai/debug', async (req: Request, res: Response) => {
  try {
    const { code, errorMessage = '', expectedBehavior = '', difficulty = 'auto' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code to debug is required.' });
    }

    const prompt = `You are a precision C compiler and runtime debugging expert. Analyze this faulty or buggy C code:

\`\`\`c
${code}
\`\`\`

${errorMessage ? `Reported Error / Compiler Message:\n${errorMessage}\n` : ''}
${expectedBehavior ? `Expected Behavior:\n${expectedBehavior}\n` : ''}
Target Student Level: ${difficulty}

Analyze carefully and return structured markdown:
1. **Error Classification**: Categorize the bug as [Syntax Error | Compilation Error | Runtime / Segmentation Fault | Logical Bug | Memory Leak / Dangling Pointer | Undefined Behavior]
2. **Root Cause**: Exactly what causes the error (cite line numbers)
3. **Corrected C Code**: Provide the full, clean, working standard C code inside a \`\`\`c code block
4. **Summary of Fixes**: Bullet points explaining each modification
5. **Testing Recommendations**: How the student can test this program to verify edge cases`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.3 },
    });

    res.json({ analysis: response.text || '' });
  } catch (err: any) {
    console.error('Debug API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to debug code.' });
  }
});

// Exam Preparation endpoint
app.post('/api/ai/exam', async (req: Request, res: Response) => {
  try {
    const { topic, question, markFormat = '5-mark', examType = 'theory' } = req.body;

    if (!topic && !question) {
      return res.status(400).json({ error: 'Topic or question is required.' });
    }

    const formatGuidance =
      markFormat === '2-mark'
        ? 'Format: 2-MARK UNIVERSITY ANSWER. Give a crisp, concise definition, precise syntax or 3-4 line code snippet, and 2 key properties. Do not over-explain.'
        : markFormat === '5-mark'
        ? 'Format: 5-MARK UNIVERSITY ANSWER. Include introduction/definition, key concepts, standard syntax, a well-commented code example (10-20 lines), step explanation, and advantages/use cases.'
        : markFormat === '10-mark'
        ? 'Format: 10-MARK MAJOR QUESTION. Complete university-grade answer with detailed conceptual foundation, full working program, memory diagram or flow explanation, trace of input/output, edge cases, and comparison/distinction table.'
        : markFormat === 'quick-revision'
        ? 'Format: LAST-MINUTE EXAM REVISION NOTES. Bulleted formulas, key syntax, quick rules, common viva questions, and top 5 exam pitfalls.'
        : 'Format: DETAILED ACADEMIC EXPLANATION.';

    const prompt = `Topic: ${topic}
${question ? `Specific Question: ${question}` : `Provide standard university exam model answer for core B.Tech questions on this topic.`}
${formatGuidance}
Exam focus: ${examType}

Note: Emphasize standard C college exam criteria: standard headers, void/int main standard definitions, no fake syntax, clear comments.`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.5 },
    });

    res.json({ answer: response.text || '' });
  } catch (err: any) {
    console.error('Exam API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate exam material.' });
  }
});

// Quiz Generator endpoint
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  try {
    const { topic = 'Loops', difficulty = 'intermediate', count = 5, questionType = 'mcq' } = req.body;

    const prompt = `Generate a high quality C programming quiz for college students.
Topic: ${topic}
Difficulty: ${difficulty}
Count: ${count} questions
Question Category: ${questionType} (can be MCQ conceptual, predict output, or find error)

You MUST respond strictly with valid JSON without any markdown code fence or extra text.
JSON Structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "The question text here",
      "codeSnippet": "// optional C code snippet if testing output or syntax, or empty string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this option is correct and why other options are wrong.",
      "testedConcept": "Concept tested (e.g. Operator Precedence, Pointer Dereferencing)"
    }
  ]
}`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: 'You are a C programming examination creator. Always output valid JSON only.',
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Quiz API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

// AI Study Planner endpoint
app.post('/api/ai/study-plan', async (req: Request, res: Response) => {
  try {
    const { examDate, dailyHours = 2, weakTopics = [], targetGrade = 'A' } = req.body;

    const prompt = `Create a realistic day-by-day C Programming study revision plan for a B.Tech engineering student.
Exam Date: ${examDate}
Daily Available Study Hours: ${dailyHours} hours/day
Priority/Weak Topics to Cover: ${weakTopics.join(', ') || 'Pointers, Arrays, Dynamic Memory, Functions, Structures'}
Target Grade: ${targetGrade}

You MUST return valid JSON only. Structure:
{
  "summary": "Brief encouraging overview of the plan",
  "totalDays": 5,
  "dailySchedule": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "focusTopic": "Topic Name",
      "tasks": [
        {
          "title": "Specific task title",
          "description": "Specific goal for this session",
          "estimatedMinutes": 60,
          "priority": "High"
        }
      ],
      "practiceGoal": "Coding challenge or quiz to take"
    }
  ],
  "examDayTips": ["Key tip 1", "Key tip 2"]
}`;

    const response = await callGemini({
      contents: prompt,
      systemInstruction: 'You are a college academic advisor. Return JSON only.',
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Study Plan API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate study plan.' });
  }
});

// Multimodal Screenshot & Question Solver endpoint
app.post('/api/ai/screenshot', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', action = 'explain', customPrompt = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    let promptText = '';
    if (action === 'solve') {
      promptText = 'Inspect this image. It contains a C programming question, problem statement, or assignment. Extract the exact requirements and provide a full, compilable standard C solution with step-by-step logic explanation and sample test cases.';
    } else if (action === 'debug') {
      promptText = 'Inspect this image containing C code or compiler errors. Identify the exact error, explain why it happens, and provide the corrected code.';
    } else if (action === 'notes') {
      promptText = 'Inspect this image of C programming slides, textbook page, or handwritten notes. Transcribe the key concepts into structured B.Tech exam revision notes with syntax and examples.';
    } else if (action === 'mcq') {
      promptText = 'Inspect this image and generate 3 practice MCQs based directly on the C concepts shown.';
    } else {
      promptText = 'Inspect this image containing C code, lecture slides, or programming questions. Explain what is happening clearly in detail.';
    }

    if (customPrompt) {
      promptText += `\nAdditional Student Question: ${customPrompt}`;
    }

    const response = await callGemini({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      systemInstruction: C_MENTOR_SYSTEM_INSTRUCTION,
      config: { temperature: 0.4 },
    });

    res.json({ result: response.text || 'No response generated from image.' });
  } catch (err: any) {
    console.error('Screenshot API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process screenshot.' });
  }
});

// ==========================================
// 3. PERSISTENT STUDENT STORAGE ENDPOINTS
// ==========================================

// Load student profile & learning data
app.get('/api/student/load', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'default_student';
  const store = loadStore();
  const userData = store[userId] || null;
  res.json({ success: true, data: userData });
});

// Save student profile & learning data
app.post('/api/student/save', (req: Request, res: Response) => {
  const { userId = 'default_student', data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Data is required.' });
  }
  const store = loadStore();
  store[userId] = {
    ...store[userId],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveStore(store);
  res.json({ success: true, message: 'Saved successfully' });
});

// Reset student profile data
app.post('/api/student/reset', (req: Request, res: Response) => {
  const { userId = 'default_student' } = req.body;
  const store = loadStore();
  delete store[userId];
  saveStore(store);
  res.json({ success: true, message: 'Data reset successfully' });
});

// ==========================================
// 4. VITE SERVER & APP STARTUP
// ==========================================

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 C Tutor AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
