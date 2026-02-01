'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitCategory } from '@/lib/types';

interface UseHabitsReturn {
  habits: Habit[];
  completedTasks: Habit[];
  isLoading: boolean;
  error: string | null;
  createHabit: (title: string, category: HabitCategory, isStreakable: boolean, targetTime?: number) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  updateProgress: (id: string, minutes: number) => Promise<void>;
  completeAdditionalTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  deleteCompletedTask: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/habits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      
      const data = await response.json();
      
      // Separate active and completed non-streakable tasks
      const active = data.filter((h: Habit) => h.isStreakable || !h.completedAt);
      const completed = data.filter((h: Habit) => !h.isStreakable && h.completedAt);
      
      setHabits(active);
      setCompletedTasks(completed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(async (
    title: string, 
    category: HabitCategory, 
    isStreakable: boolean, 
    targetTime?: number
  ) => {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, isStreakable, targetTime }),
    });
    
    if (!response.ok) throw new Error('Failed to create habit');
    
    const newHabit = await response.json();
    setHabits(prev => [newHabit, ...prev]);
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const response = await fetch(`/api/habits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) throw new Error('Failed to update habit');
    
    const updated = await response.json();
    setHabits(prev => prev.map(h => h.id === id ? updated : h));
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    
    if (!response.ok) throw new Error('Failed to delete habit');
    
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const toggleHabit = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    // Don't toggle time-based habits
    if (habit.targetTime && habit.targetTime > 0) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);
    
    let newStreak = habit.streak;
    let newCompletedDates = [...habit.completedDates];

    if (isCompletedToday) {
      newStreak = Math.max(0, habit.streak - 1);
      newCompletedDates = newCompletedDates.filter(d => d !== today);
    } else {
      newStreak += 1;
      newCompletedDates.push(today);
    }

    await updateHabit(id, { streak: newStreak, completedDates: newCompletedDates });
  }, [habits, updateHabit]);

  const updateProgress = useCallback(async (id: string, minutes: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const newProgress = Math.min(24 * 60, Math.max(0, minutes));
    
    const updatedDailyProgress = { ...habit.dailyProgress, [today]: newProgress };
    
    const target = habit.targetTime || 0;
    const wasCompleted = habit.completedDates.includes(today);
    const isNowCompleted = target > 0 && newProgress >= target;
    
    let newCompletedDates = [...habit.completedDates];
    let newStreak = habit.streak;
    
    if (isNowCompleted && !wasCompleted) {
      newCompletedDates.push(today);
      newStreak += 1;
    } else if (!isNowCompleted && wasCompleted) {
      newCompletedDates = newCompletedDates.filter(d => d !== today);
      newStreak = Math.max(0, habit.streak - 1);
    }

    await updateHabit(id, {
      dailyProgress: updatedDailyProgress,
      completedDates: newCompletedDates,
      streak: newStreak,
    });
  }, [habits, updateHabit]);

  const completeAdditionalTask = useCallback(async (id: string) => {
    const task = habits.find(h => h.id === id);
    if (!task || task.isStreakable) return;
    
    await updateHabit(id, { completedAt: new Date().toISOString() });
    
    // Move to completed list
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedTasks(prev => [{ ...task, completedAt: new Date().toISOString() }, ...prev]);
  }, [habits, updateHabit]);

  const restoreTask = useCallback(async (id: string) => {
    const task = completedTasks.find(t => t.id === id);
    if (!task) return;
    
    await updateHabit(id, { completedAt: undefined });
    
    setCompletedTasks(prev => prev.filter(t => t.id !== id));
    const { completedAt, ...activeTask } = task;
    setHabits(prev => [...prev, activeTask]);
  }, [completedTasks, updateHabit]);

  const deleteCompletedTask = useCallback(async (id: string) => {
    const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    
    if (!response.ok) throw new Error('Failed to delete task');
    
    setCompletedTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    habits,
    completedTasks,
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    updateProgress,
    completeAdditionalTask,
    restoreTask,
    deleteCompletedTask,
    refetch: fetchHabits,
  };
}
