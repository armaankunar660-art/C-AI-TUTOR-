import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevel, updateStreak, evaluateUnlockedAchievements, StudentStats } from './gamification';

test('calculateLevel scales with thresholds correctly', () => {
  const lvl1 = calculateLevel(100);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentXp, 100);
  assert.equal(lvl1.nextLevelXp, 150);

  const lvl2 = calculateLevel(200);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentXp, 50); // 200 - 150 = 50
  assert.equal(lvl2.nextLevelXp, 300);
});

test('updateStreak increments consecutive days and resets broken streaks', () => {
  const consecutive = updateStreak('2026-10-23', 2, '2026-10-24');
  assert.equal(consecutive.newStreak, 3);
  assert.equal(consecutive.newDate, '2026-10-24');

  const sameDay = updateStreak('2026-10-24', 3, '2026-10-24');
  assert.equal(sameDay.newStreak, 3);

  const broken = updateStreak('2026-10-20', 5, '2026-10-24');
  assert.equal(broken.newStreak, 1);
});

test('evaluateUnlockedAchievements awards achievements based on student stats', () => {
  const stats: StudentStats = {
    xp: 300,
    level: 2,
    streakDays: 3,
    lastActiveDate: '2026-10-24',
    topicsCompletedCount: 3,
    quizzesCompletedCount: 1,
    debuggingsCompletedCount: 0,
    challengesCompletedCount: 0,
    achievements: []
  };

  const evalResult = evaluateUnlockedAchievements(stats);
  assert.ok(evalResult.allUnlockedIds.includes('first_steps'));
  assert.ok(evalResult.allUnlockedIds.includes('syntax_explorer'));
  assert.ok(evalResult.allUnlockedIds.includes('quiz_novice'));
  assert.ok(evalResult.allUnlockedIds.includes('streak_fire'));
  assert.equal(evalResult.allUnlockedIds.includes('bug_hunter'), false);
});
