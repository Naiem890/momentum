'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit, UserStats } from '@/lib/types';
import { Quote as QuoteType } from '@/lib/quotes';
import { StreakCard } from './streak-card';
import { WeeklyProgress } from './weekly-progress';
import { Milestones } from './milestones';
import { Heatmap } from './heatmap';
import { Flame, RefreshCw, Quote } from 'lucide-react';

interface MobileStatsViewProps {
  habits: Habit[];
  stats: UserStats;
  currentStreak: number;
  quote: QuoteType;
  isQuoteLoading: boolean;
  onRefreshQuote: () => void;
}

export function MobileStatsView({ 
  habits, 
  stats, 
  currentStreak, 
  quote, 
  isQuoteLoading, 
  onRefreshQuote 
}: MobileStatsViewProps) {
  return (
    <div 
      className="flex flex-col gap-4 px-4 pb-[100px] pt-4 overflow-y-auto"
    >

      {/* Quote Section - Desktop-style gradient */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-surface-dark to-surface-dark border border-primary/20 rounded-2xl" />
        
        {/* Animated glow orb */}
        <motion.div 
          className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10 p-4">
          <Quote className="absolute top-3 left-3 w-5 h-5 text-primary/30 rotate-180" />
          
          <div className="pl-6 pr-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={quote.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p 
                  className="text-base text-white leading-relaxed italic font-medium"
                  style={{ fontFamily: 'var(--font-quote), serif' }}
                >
                  {quote.text}
                </p>
                <span className="text-xs text-gray-400 font-mono mt-2 block">
                  — {quote.author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <Quote className="absolute bottom-3 right-12 w-5 h-5 text-primary/30" />
          
          <button
            onClick={onRefreshQuote}
            disabled={isQuoteLoading}
            className="absolute top-1/2 -translate-y-1/2 right-3 p-2.5 text-primary/50 hover:text-primary transition-colors rounded-xl hover:bg-primary/10 active:scale-95"
          >
            <motion.div
              animate={isQuoteLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isQuoteLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.div>
          </button>
        </div>
      </motion.div>

      {/* Streak Card - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StreakCard 
          streak={
             (habits.filter(h => h.isStreakable).length > 0 && 
              habits.filter(h => h.isStreakable).some(h => {
                 const today = new Date().toISOString().split('T')[0];
                 return h.completedDates.includes(today);
              }) && 
              !habits.filter(h => h.isStreakable).every(h => {
                 const today = new Date().toISOString().split('T')[0];
                 return h.completedDates.includes(today);
              })
             ) ? currentStreak - 1 : currentStreak
          } 
          className="h-[180px]" 
          dailyGoal={habits.filter(h => h.isStreakable).length}
          completedDaily={habits.filter(h => h.isStreakable && h.completedDates.includes(new Date().toISOString().split('T')[0])).length}
        />
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <WeeklyProgress habits={habits} compact />
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Milestones stats={stats} habits={habits} currentStreak={currentStreak} />
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Heatmap habits={habits} />
      </motion.div>
    </div>
  );
}
