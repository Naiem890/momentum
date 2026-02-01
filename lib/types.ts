export type HabitCategory = 'health' | 'work' | 'learning' | 'other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  createdAt: number;
}

export interface UserStats {
  totalHabitsCompleted: number;
  longestStreak: number;
  lastLogin: string; // YYYY-MM-DD
}
