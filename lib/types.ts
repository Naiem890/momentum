export type HabitCategory = 'health' | 'work' | 'learning' | 'other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  createdAt: number;
  xpValue: number;
}

export interface UserStats {
  xp: number;
  level: number;
  totalHabitsCompleted: number;
  longestStreak: number;
  lastLogin: string; // YYYY-MM-DD
}
