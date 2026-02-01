'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Habit, UserStats } from '@/lib/types';
import { StreakCard } from './streak-card';
import { WeeklyProgress } from './weekly-progress';
import { Milestones } from './milestones';
import { Heatmap } from './heatmap';

interface MobileStatsViewProps {
  habits: Habit[];
  stats: UserStats;
  currentStreak: number;
}

export function MobileStatsView({ habits, stats, currentStreak }: MobileStatsViewProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-[100px] overflow-y-auto">
      {/* Streak Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <StreakCard streak={currentStreak} className="h-[180px]" />
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <WeeklyProgress habits={habits} compact />
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Milestones stats={stats} habits={habits} currentStreak={currentStreak} />
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Heatmap habits={habits} />
      </motion.div>
    </div>
  );
}
