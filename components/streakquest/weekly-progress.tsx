'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WeeklyProgressProps {
  habits: Habit[];
}

export function WeeklyProgress({ habits }: WeeklyProgressProps) {
  const today = new Date();
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === today.toISOString().split('T')[0];
    const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
    const totalHabits = habits.length;
    const isComplete = totalHabits > 0 && completedCount > 0;
    const completionRate = totalHabits > 0 ? completedCount / totalHabits : 0;

    return { dateStr, isToday, isComplete, completionRate, dayName: date.toLocaleDateString('en-US', { weekday: 'short' }) };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      className="bg-surface-dark rounded-3xl p-8 shadow-sm"
    >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
            <h3 className="font-semibold text-lg text-white">Weekly Progress</h3>
            <motion.span 
              className="text-xs font-mono font-bold text-primary uppercase tracking-wider"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Last 7 Days
            </motion.span>
        </motion.div>

        {/* Timeline */}
        <div className="relative pt-2 pb-4">
            {/* Background Line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="absolute top-[28px] left-0 w-full h-0.5 bg-surface-border z-0 origin-left"
            />

            {/* Progress Line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="absolute top-[28px] left-0 h-0.5 bg-gradient-to-r from-primary/50 to-primary z-0 origin-left"
              style={{ width: `${(6/7) * 100}%` }}
            />

            <div className="relative z-10 flex justify-between w-full">
                {days.map((date, index) => {
                    const { isToday, isComplete, completionRate, dayName } = getDayStatus(date);
                    
                    if (isToday) {
                        return (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              delay: 0.3 + index * 0.08,
                              type: "spring",
                              stiffness: 500,
                              damping: 20
                            }}
                            className="flex flex-col items-center gap-3 -mt-2"
                          >
                              <motion.div 
                                className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-surface-dark relative shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                animate={{ 
                                  boxShadow: [
                                    "0 0 15px rgba(16,185,129,0.4)",
                                    "0 0 25px rgba(16,185,129,0.6)",
                                    "0 0 15px rgba(16,185,129,0.4)"
                                  ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                  <motion.div 
                                    className="w-2.5 h-2.5 bg-primary rounded-full"
                                    animate={{ 
                                      scale: [1, 1.3, 1],
                                      opacity: [1, 0.8, 1]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                              </motion.div>
                              <motion.span 
                                className="text-xs text-white font-bold font-mono"
                                animate={{ opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                Today
                              </motion.span>
                          </motion.div>
                        );
                    }

                    return (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: 0.3 + index * 0.08,
                            type: "spring",
                            stiffness: 500,
                            damping: 20
                          }}
                          whileHover={{ scale: 1.2, y: -3 }}
                          className="flex flex-col items-center gap-4 group cursor-pointer"
                        >
                            <motion.div 
                              className={cn(
                                  "w-4 h-4 rounded-full border-[3px] border-surface-dark transition-all duration-300 z-10",
                                  isComplete 
                                    ? completionRate >= 1 
                                      ? "bg-primary scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                      : "bg-primary/60" 
                                    : "bg-gray-600 group-hover:bg-gray-500"
                              )}
                              whileHover={{ scale: 1.3 }}
                            />
                            <span className="text-xs text-gray-600 font-mono group-hover:text-gray-400 transition-colors">{dayName}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </motion.div>
  );
}
