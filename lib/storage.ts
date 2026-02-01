import { Habit, UserStats } from './types';

const HABITS_KEY = 'streakquest_habits';
const STATS_KEY = 'streakquest_stats';

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  totalHabitsCompleted: 0,
  longestStreak: 0,
  lastLogin: new Date().toISOString().split('T')[0],
};

export const getHabits = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load habits", e);
    return [];
  }
};

export const saveHabits = (habits: Habit[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

export const getUserStats = (): UserStats => {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATS;
  } catch (e) {
    console.error("Failed to load stats", e);
    return DEFAULT_STATS;
  }
};

export const saveUserStats = (stats: UserStats) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const calculateLevel = (xp: number): number => {
  // Simple RPG curve: Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getLevelProgress = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  const nextLevelXp = Math.pow(currentLevel, 2) * 100;
  const prevLevelXp = Math.pow(currentLevel - 1, 2) * 100;
  
  const xpInLevel = xp - prevLevelXp;
  const xpNeeded = nextLevelXp - prevLevelXp;
  
  return Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
};

// --- Quote Storage ---
interface StoredQuote {
  date: string;
  quote: { text: string; author: string };
}
const QUOTE_KEY = 'streak_daily_quote';

export const getDailyQuote = (): StoredQuote | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(QUOTE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load daily quote", e);
    return null;
  }
};

export const saveDailyQuote = (quote: { text: string; author: string }) => {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  const storedData: StoredQuote = { date: today, quote };
  localStorage.setItem(QUOTE_KEY, JSON.stringify(storedData));
};
