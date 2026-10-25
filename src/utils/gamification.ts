/**
 * Gamification, XP, Streak and Progress calculation logic
 */

export interface StudentStats {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string; // ISO date string YYYY-MM-DD
  topicsCompletedCount: number;
  quizzesCompletedCount: number;
  debuggingsCompletedCount: number;
  challengesCompletedCount: number;
  achievements: string[];
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  xpReward: number;
  condition: (stats: StudentStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first C programming lesson or topic',
    icon: 'Flag',
    badge: 'Bronze',
    xpReward: 50,
    condition: (s) => s.topicsCompletedCount >= 1
  },
  {
    id: 'syntax_explorer',
    title: 'Syntax Explorer',
    description: 'Complete 3 core C programming topics',
    icon: 'Code2',
    badge: 'Bronze',
    xpReward: 100,
    condition: (s) => s.topicsCompletedCount >= 3
  },
  {
    id: 'quiz_novice',
    title: 'Quiz Champion',
    description: 'Complete your first C quiz with a passing score',
    icon: 'Award',
    badge: 'Silver',
    xpReward: 80,
    condition: (s) => s.quizzesCompletedCount >= 1
  },
  {
    id: 'bug_hunter',
    title: 'Bug Hunter',
    description: 'Debug and resolve 3 C code snippets in the Debugger',
    icon: 'Bug',
    badge: 'Silver',
    xpReward: 150,
    condition: (s) => s.debuggingsCompletedCount >= 3
  },
  {
    id: 'challenge_ace',
    title: 'Daily Challenger',
    description: 'Complete at least 2 daily coding challenges',
    icon: 'Flame',
    badge: 'Gold',
    xpReward: 200,
    condition: (s) => s.challengesCompletedCount >= 2
  },
  {
    id: 'streak_fire',
    title: 'Consistent Coder',
    description: 'Maintain a 3-day active learning streak',
    icon: 'Zap',
    badge: 'Gold',
    xpReward: 250,
    condition: (s) => s.streakDays >= 3
  },
  {
    id: 'c_champion',
    title: 'C Champion',
    description: 'Master 10 or more topics across the C curriculum',
    icon: 'Crown',
    badge: 'Diamond',
    xpReward: 500,
    condition: (s) => s.topicsCompletedCount >= 10
  }
];

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  // Each level requires 150 XP * level
  let level = 1;
  let remainingXp = Math.max(0, xp);
  let threshold = 150;

  while (remainingXp >= threshold) {
    remainingXp -= threshold;
    level++;
    threshold = level * 150;
  }

  const progressPercent = Math.min(100, Math.round((remainingXp / threshold) * 100));

  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: threshold,
    progressPercent
  };
}

export function updateStreak(lastActiveDate: string, streakDays: number, todayDateStr: string): { newStreak: number; newDate: string } {
  if (!lastActiveDate) {
    return { newStreak: 1, newDate: todayDateStr };
  }

  if (lastActiveDate === todayDateStr) {
    return { newStreak: Math.max(1, streakDays), newDate: todayDateStr };
  }

  const lastDate = new Date(lastActiveDate + 'T00:00:00Z');
  const today = new Date(todayDateStr + 'T00:00:00Z');
  const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newStreak: streakDays + 1, newDate: todayDateStr };
  } else if (diffDays > 1) {
    // Streak broken
    return { newStreak: 1, newDate: todayDateStr };
  }

  return { newStreak: streakDays, newDate: lastActiveDate };
}

export function evaluateUnlockedAchievements(stats: StudentStats): { newlyUnlocked: AchievementDefinition[]; allUnlockedIds: string[] } {
  const currentSet = new Set(stats.achievements || []);
  const newlyUnlocked: AchievementDefinition[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (!currentSet.has(ach.id) && ach.condition(stats)) {
      newlyUnlocked.push(ach);
      currentSet.add(ach.id);
    }
  }

  return {
    newlyUnlocked,
    allUnlockedIds: Array.from(currentSet)
  };
}
