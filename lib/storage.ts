import { Habit, UserStats } from './types';

const HABITS_KEY = 'momentum_habits';
const STATS_KEY = 'momentum_stats';

const DEFAULT_STATS: UserStats = {

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
