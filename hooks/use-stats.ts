'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/lib/types';

interface UseStatsReturn {
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  recalculateStats: (habits: { streak: number; completedDates: string[] }[]) => Promise<void>;
  refetch: () => Promise<void>;
}

const DEFAULT_STATS: UserStats = {
  totalHabitsCompleted: 0,
  longestStreak: 0,
  lastLogin: new Date().toISOString().split('T')[0],
};

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    const newStats = { ...stats, ...updates };
    
    const response = await fetch('/api/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStats),
    });
    
    if (!response.ok) throw new Error('Failed to update stats');
    
    const updated = await response.json();
    setStats(updated);
  }, [stats]);

  const recalculateStats = useCallback(async (
    habits: { streak: number; completedDates: string[] }[]
  ) => {
    const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const maxStreak = Math.max(0, ...habits.map(h => h.streak));
    
    await updateStats({
      totalHabitsCompleted: totalCompleted,
      longestStreak: Math.max(stats.longestStreak, maxStreak),
    });
  }, [stats.longestStreak, updateStats]);

  return {
    stats,
    isLoading,
    error,
    updateStats,
    recalculateStats,
    refetch: fetchStats,
  };
}
