import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCCode } from './cAnalysis';

test('analyzeCCode detects valid main function and stdio header', () => {
  const code = `
#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}
  `;
  const result = analyzeCCode(code);
  assert.equal(result.hasMain, true);
  assert.equal(result.hasStandardIncludes, true);
  assert.equal(result.unbalancedDelimiters.braces, 0);
  assert.equal(result.unbalancedDelimiters.parentheses, 0);
  assert.equal(result.missingSemicolons.length, 0);
  assert.ok(result.detectedKeywords.includes('int'));
  assert.ok(result.detectedKeywords.includes('return'));
});

test('analyzeCCode catches missing semicolon in statement', () => {
  const code = `
#include <stdio.h>

int main() {
    int a = 10
    printf("Value: %d\\n", a);
    return 0;
}
  `;
  const result = analyzeCCode(code);
  assert.ok(result.missingSemicolons.length > 0);
  assert.ok(result.missingSemicolons.some(s => s.hint.includes('int a = 10')));
});

test('analyzeCCode catches unbalanced braces', () => {
  const code = `
#include <stdio.h>

int main() {
    if (1) {
        printf("Test\\n");
    return 0;
}
  `;
  const result = analyzeCCode(code);
  assert.equal(result.unbalancedDelimiters.braces, 1);
});

test('analyzeCCode identifies missing stdio header when printf is used', () => {
  const code = `
int main() {
    printf("Needs header\\n");
    return 0;
}
  `;
  const result = analyzeCCode(code);
  assert.ok(result.suggestedHeaders.includes('<stdio.h>'));
});
