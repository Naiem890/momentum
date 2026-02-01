'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface WeeklyProgressProps {
  habits: Habit[];
  compact?: boolean;
}

export function WeeklyProgress({ habits, compact = false }: WeeklyProgressProps) {
  const today = new Date();
  
  // Calculate Start of Week (Monday)
  const currentDay = today.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; 
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - diffToMonday);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    return d;
  });

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    // Future Check
    const isFuture = date > today && dateStr !== todayStr;
    
    const isToday = dateStr === todayStr;
    
    // Progress Calculation
    // For "Completed", we check if ALL daily habits were completed? 
    // Or just if *any* streakable habit was maintained?
    // Let's stick to: "Did I miss anything?" 
    // Ideally: Count streakable habits. If > 0 and all completed -> Success.
    
    // For simplicity and leniency (matches typical habit apps):
    // If I had habits that day and completed "most" or "all" of them.
    // Let's use logic: If any habit completed that day? No, that's too easy.
    // Logic: Total Streakable Habits for that day > 0 AND Completed Count >= Total Streakable.
    
    // However, finding exact historical count is hard without historical logs of "active habits at that time".
    // We will just approximate with CURRENT streakable habits.
    const streakableHabits = habits.filter(h => h.isStreakable);
    const completedCount = streakableHabits.filter(h => h.completedDates.includes(dateStr)).length;
    const totalHabits = streakableHabits.length;
    
    // Success: I had habits and I did them all. 
    // Partial: I did some.
    // Fail: I did none.
    
    // Design has binary state basically: Check or Empty.
    // Let's go with: >= 1 completed is a "success" for visual gratification in this simple view, 
    // OR strict: CompletedCount === TotalHabits. 
    // Let's try Strict for "Green Check".
    
    const isComplete = totalHabits > 0 && completedCount >= totalHabits; 
    
    return { dateStr, isToday, isFuture, isComplete, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }) };
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <div className="bg-surface-dark rounded-3xl p-5 relative overflow-hidden border border-white/5 flex flex-col shadow-lg h-full">
         
         {/* Background Decoration */}
         <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-transparent to-[#0a0a0a]" />

         {/* Header */}
         <div className="relative z-10 flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-white tracking-widest uppercase opacity-90">Weekly Progress</h2>
         </div>

         <div className="flex items-start justify-between relative z-10 w-full flex-1">
            {days.map((date, index) => {
               const { isToday, isFuture, isComplete, dayName } = getDayStatus(date);
               
               return (
                 <div key={index} className="flex flex-col items-center gap-3 relative flex-1 group">

                    {/* Indicator Shape - Squaricle (Rounded Square) */}
                    <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        {isToday ? (
                           // Today state
                           <div className="w-[42px] h-[42px] rounded-xl border-2 border-dashed border-primary flex items-center justify-center bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                               {isComplete ? (
                                   <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center">
                                       <Check className="w-5 h-5 text-black stroke-[3]" />
                                   </div>
                               ) : (
                                   <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                               )}
                           </div>
                        ) : isComplete ? (
                           // Completed state
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="w-[42px] h-[42px] rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-primary"
                           >
                              <Check className="w-5 h-5 text-black stroke-[3]" />
                           </motion.div>
                        ) : (
                           // Incomplete / Future state
                           <div className={cn(
                               "w-[42px] h-[42px] rounded-xl flex items-center justify-center border transition-colors duration-300",
                               isFuture 
                                 ? "bg-surface-dark-lighter/30 border-white/5 text-gray-700" 
                                 : "bg-surface-dark-lighter border-white/10 text-gray-500" // Past Incomplete
                           )}>
                              {/* Past Incomplete could show a small dot or nothing. Let's keep it empty for clean look. */}
                           </div>
                        )}
                    </div>

                    {/* Day Name */}
                    <span className={cn(
                      "font-mono text-xs uppercase tracking-wider transition-colors duration-300",
                      isToday ? "text-primary font-bold" : "text-gray-500 group-hover:text-gray-400"
                    )}>
                       {dayName}
                    </span>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
