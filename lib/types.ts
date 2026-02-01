export type HabitCategory = 'health' | 'work' | 'study' | 'other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  createdAt: number;
  targetTime?: number; // Target time in minutes. 0 or undefined = simple habit
  dailyProgress?: Record<string, number>; // Key: YYYY-MM-DD, Value: minutes spent
  isStreakable: boolean; // true = daily streak task (default), false = additional/one-time task
  completedAt?: string | null; // ISO date when additional task was completed (for non-streakable only)
}

export interface UserStats {
  totalHabitsCompleted: number;
  longestStreak: number;
  lastLogin: string; // YYYY-MM-DD
}
