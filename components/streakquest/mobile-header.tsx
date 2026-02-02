'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, HelpCircle } from 'lucide-react';
import { Habit } from '@/lib/types';
import { AuthButton } from '@/components/auth';
import { WaterFillStreak } from './water-fill-streak';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  currentStreak: number;
  habits: Habit[];
  onHelpClick?: () => void;
}

export function MobileHeader({ currentStreak, habits, onHelpClick }: MobileHeaderProps) {
  // Calculate daily progress
  const streakableHabits = habits.filter(h => h.isStreakable);
  const totalDaily = streakableHabits.length;
  
  const today = new Date().toISOString().split('T')[0];
  const completedDaily = streakableHabits.filter(h => 
    h.completedDates.includes(today)
  ).length;

  // Visual Streak Logic: Match StreakCard
  // If some tasks are done but not all, show currentStreak - 1 (filling up state)
  const isPartiallyComplete = totalDaily > 0 && completedDaily > 0 && completedDaily < totalDaily;
  const visualStreak = isPartiallyComplete ? Math.max(0, currentStreak - 1) : currentStreak;

  return (
    <div 
      className="px-4 pt-4 pb-3 bg-background-dark/95 backdrop-blur-md sticky top-0 z-40 border-b border-white/5"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-mono text-sm tracking-wider">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-gray-400 font-semibold">Momentum</span>
        </div>

        {/* Right Side: Stats & Auth */}
        <div className="flex items-center gap-2">
            {/* Stats - Only show if there are habits */}
            {totalDaily > 0 && (
                <div className="flex items-center gap-3 mr-1">
                    {/* Streak Count - Water Fill Effect */}
                    <div className="w-[72px] h-[40px] relative">
                         <WaterFillStreak 
                            value={visualStreak} 
                            progress={totalDaily > 0 ? completedDaily / totalDaily : 0} 
                            className="w-full h-full"
                         />
                    </div>
                </div>
            )}
            
            {/* Help Button */}
            {onHelpClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHelpClick}
                className="h-9 w-9 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            )}
            
            <AuthButton />
        </div>
      </div>
    </div>
  );
}
