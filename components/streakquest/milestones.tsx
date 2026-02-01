'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserStats, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Zap, Flame, Award, Medal, Crown, Star, Lock, Unlock } from 'lucide-react';

interface MilestonesProps {
  stats: UserStats;
  habits: Habit[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export function Milestones({ stats, habits }: MilestonesProps) {
  const maxStreak = Math.max(0, ...habits.map(h => h.streak));
  
  const badges = [
    { id: '7day', name: '7-Day', icon: Zap, earned: maxStreak >= 7, desc: '7 Day Streak', progress: Math.min(100, (maxStreak / 7) * 100) },
    { id: '30day', name: '30-Day', icon: Flame, earned: maxStreak >= 30, desc: '30 Day Streak', progress: Math.min(100, (maxStreak / 30) * 100) },
    { id: '60day', name: '60-Day', icon: Award, earned: maxStreak >= 60, desc: '60 Day Streak', progress: Math.min(100, (maxStreak / 60) * 100) },
    { id: '100day', name: '100-Day', icon: Medal, earned: maxStreak >= 100, desc: '100 Day Streak', progress: Math.min(100, (maxStreak / 100) * 100) },
    { id: '100q', name: 'Warrior', icon: Star, earned: stats.totalHabitsCompleted >= 100, desc: '100 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 100) * 100) },
    { id: '500q', name: 'Legend', icon: Crown, earned: stats.totalHabitsCompleted >= 500, desc: '500 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 500) * 100) },
  ];

  return (
    <div className="bg-surface-dark rounded-3xl p-6 flex-1 shadow-sm flex flex-col h-full overflow-hidden">
       
       {/* Header */}
       <motion.div 
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.2 }}
         className="flex justify-between items-center mb-6 shrink-0"
       >
           <h3 className="font-semibold text-lg text-white">Milestone Badges</h3>
           <motion.div
             whileHover={{ scale: 1.05, x: 3 }}
             whileTap={{ scale: 0.95 }}
           >
             <Button 
               variant="link"
               className="text-xs font-mono text-primary hover:text-primary-glow transition-colors uppercase tracking-wider p-0 h-auto"
             >
               VIEW ALL
             </Button>
           </motion.div>
       </motion.div>
       
       {/* Badges Grid */}
       <motion.div 
         variants={container}
         initial="hidden"
         animate="show"
         className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1"
       >
           <div className="grid grid-cols-3 gap-4 p-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div 
                  key={badge.id}
                  variants={item}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-4 border transition-all group cursor-pointer overflow-hidden",
                    badge.earned 
                      ? "bg-surface-dark-lighter border-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                      : "bg-surface-dark-lighter border-transparent hover:border-primary/20"
                  )}
                  title={badge.desc}
                >
                   {/* Progress ring background */}
                   {!badge.earned && badge.progress > 0 && (
                     <motion.div
                       className="absolute inset-2 rounded-xl border-2 border-primary/20"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                     />
                   )}
                   
                   {/* Glow effect for earned */}
                   {badge.earned && (
                     <motion.div
                       className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                       animate={{
                         opacity: [0.5, 0.8, 0.5],
                       }}
                       transition={{
                         duration: 2,
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                     />
                   )}

                   <motion.div
                     animate={badge.earned ? {
                       y: [0, -3, 0],
                       rotate: [0, -5, 5, 0],
                     } : {}}
                     transition={{
                       duration: 2,
                       repeat: Infinity,
                       ease: "easeInOut"
                     }}
                   >
                     <Icon className={cn(
                         "w-8 h-8 transition-colors duration-300 relative z-10",
                         badge.earned ? "text-primary fill-primary/20" : "text-gray-600 group-hover:text-primary"
                     )} />
                   </motion.div>
                   
                   <div className="text-center relative z-10">
                      <div className="text-sm font-bold text-gray-300">{badge.name}</div>
                      <motion.div 
                        className={cn(
                            "text-[10px] uppercase tracking-wider mt-1 font-medium flex items-center justify-center gap-1",
                            badge.earned ? "text-primary" : "text-gray-600"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                          {badge.earned ? (
                            <>
                              <Unlock className="w-2.5 h-2.5" />
                              Unlocked
                            </>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden relative border border-white/5 mx-auto">
                                <motion.div 
                                  className="absolute top-0 left-0 h-full bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${badge.progress}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                />
                              </div>
                            </div>
                          )}
                      </motion.div>
                   </div>
                </motion.div>
              );
            })}
          </div>
      </motion.div>
    </div>
  );
}
