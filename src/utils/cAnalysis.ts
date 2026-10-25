/**
 * Pure utility functions for C code analysis, linting heuristics, and syntax checks
 */

export interface CAnalysisResult {
  hasMain: boolean;
  hasStandardIncludes: boolean;
  missingSemicolons: Array<{ line: number; hint: string }>;
  unbalancedDelimiters: {
    braces: number; // >0 means missing closing }, <0 means extra closing }
    parentheses: number;
    brackets: number;
  };
  detectedKeywords: string[];
  suggestedHeaders: string[];
  estimatedDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

const C_KEYWORDS = [
  'int', 'char', 'float', 'double', 'void', 'long', 'short', 'signed', 'unsigned',
  'struct', 'union', 'enum', 'typedef', 'sizeof',
  'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'break', 'continue', 'return',
  'const', 'static', 'extern', 'volatile', 'register',
  'malloc', 'calloc', 'realloc', 'free', 'printf', 'scanf'
];

export function analyzeCCode(code: string): CAnalysisResult {
  const lines = code.split('\n');
  const hasMain = /\bint\s+main\s*\(|\bvoid\s+main\s*\(/.test(code);
  const hasStandardIncludes = /#include\s*<[a-zA-Z0-9_\.]+\.h>/.test(code);

  // Check delimiter balance
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  const missingSemicolons: Array<{ line: number; hint: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Semicolon check heuristic: non-empty line that isn't preprocessor, comment, block start/end, control statement header
    if (
      trimmed.length > 0 &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('/*') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.endsWith(';') &&
      !trimmed.endsWith(':') &&
      !trimmed.startsWith('if') &&
      !trimmed.startsWith('for') &&
      !trimmed.startsWith('while') &&
      !trimmed.startsWith('switch') &&
      !trimmed.startsWith('case') &&
      !trimmed.startsWith('default') &&
      !trimmed.endsWith(',') &&
      !trimmed.endsWith('\\')
    ) {
      // Check if it's a statement like printf, return, assignment, declaration
      if (
        /^(int|char|float|double|return|printf|scanf|free|malloc|[a-zA-Z_]\w*\s*=|[a-zA-Z_]\w*\s*\+\+|[a-zA-Z_]\w*\s*--|[a-zA-Z_]\w*\(.*\))/.test(trimmed)
      ) {
        missingSemicolons.push({
          line: i + 1,
          hint: `Possible missing semicolon at end of line ${i + 1}: "${trimmed}"`
        });
      }
    }

    // Delimiter balance check ignoring strings/comments
    for (let j = 0; j < rawLine.length; j++) {
      const char = rawLine[j];
      const nextChar = rawLine[j + 1];

      if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
          inBlockComment = false;
          j++;
        }
        continue;
      }

      if (inLineComment) continue;

      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        j++;
        continue;
      }
      if (char === '/' && nextChar === '/') {
        inLineComment = true;
        break;
      }

      if (char === '"' && rawLine[j - 1] !== '\\') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
    }
    inLineComment = false;
  }

  // Keywords present
  const detectedKeywords = C_KEYWORDS.filter(kw => {
    const regex = new RegExp(`\\b${kw}\\b`);
    return regex.test(code);
  });

  // Suggested headers based on usage
  const suggestedHeaders: string[] = [];
  if ((code.includes('printf') || code.includes('scanf') || code.includes('getchar') || code.includes('puts')) && !code.includes('stdio.h')) {
    suggestedHeaders.push('<stdio.h>');
  }
  if ((code.includes('malloc') || code.includes('calloc') || code.includes('free') || code.includes('exit') || code.includes('atoi')) && !code.includes('stdlib.h')) {
    suggestedHeaders.push('<stdlib.h>');
  }
  if ((code.includes('strlen') || code.includes('strcpy') || code.includes('strcmp') || code.includes('strcat')) && !code.includes('string.h')) {
    suggestedHeaders.push('<string.h>');
  }
  if ((code.includes('sqrt') || code.includes('pow') || code.includes('abs') || code.includes('ceil') || code.includes('floor')) && !code.includes('math.h')) {
    suggestedHeaders.push('<math.h>');
  }

  // Estimated difficulty
  let estimatedDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  const hasPointers = /\*|\&[a-zA-Z_]/.test(code) && (code.includes('malloc') || code.includes('->') || code.includes('**'));
  const hasDataStructures = code.includes('struct') || code.includes('union') || code.includes('typedef');
  const hasAdvanced = code.includes('void*') || code.includes('(*') || code.includes('pthread') || code.includes('bit') || code.includes('<<') || code.includes('>>');

  if (hasAdvanced || (hasPointers && hasDataStructures)) {
    estimatedDifficulty = 'advanced';
  } else if (hasPointers || hasDataStructures || code.includes('for') && code.includes('[')) {
    estimatedDifficulty = 'intermediate';
  }

  return {
    hasMain,
    hasStandardIncludes,
    missingSemicolons,
    unbalancedDelimiters: {
      braces: braceCount,
      parentheses: parenCount,
      brackets: bracketCount
    },
    detectedKeywords,
    suggestedHeaders,
    estimatedDifficulty
  };
}
