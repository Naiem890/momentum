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
  currentStreak: number;
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

export function Milestones({ stats, habits, currentStreak }: MilestonesProps) {
  const maxStreak = currentStreak;
  
  const badges = [
    { id: '7day', name: '7-Day', icon: Zap, earned: maxStreak >= 7, desc: '7 Day Streak', progress: Math.min(100, (maxStreak / 7) * 100), target: 7, current: maxStreak, type: 'streak' },
    { id: '30day', name: '30-Day', icon: Flame, earned: maxStreak >= 30, desc: '30 Day Streak', progress: Math.min(100, (maxStreak / 30) * 100), target: 30, current: maxStreak, type: 'streak' },
    { id: '60day', name: '60-Day', icon: Award, earned: maxStreak >= 60, desc: '60 Day Streak', progress: Math.min(100, (maxStreak / 60) * 100), target: 60, current: maxStreak, type: 'streak' },
    { id: '100day', name: '100-Day', icon: Medal, earned: maxStreak >= 100, desc: '100 Day Streak', progress: Math.min(100, (maxStreak / 100) * 100), target: 100, current: maxStreak, type: 'streak' },
    { id: '365day', name: 'Titan', icon: Crown, earned: maxStreak >= 365, desc: '365 Day Streak', progress: Math.min(100, (maxStreak / 365) * 100), target: 365, current: maxStreak, type: 'streak' },
    { id: '100q', name: 'Warrior', icon: Star, earned: stats.totalHabitsCompleted >= 100, desc: '100 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 100) * 100), target: 100, current: stats.totalHabitsCompleted, type: 'quest' },
    { id: '500q', name: 'Legend', icon: Crown, earned: stats.totalHabitsCompleted >= 500, desc: '500 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 500) * 100), target: 500, current: stats.totalHabitsCompleted, type: 'quest' },
  ];

  const earnedBadges = badges.filter(b => b.earned);
  // Show next unearned badge, OR show the 365 badge if it's the specific target of interest, OR the last one
  const nextBadge = badges.find(b => !b.earned) || badges.find(b => b.id === '365day') || badges[badges.length - 1];

  const Icon = nextBadge.icon;
  const isMastered = nextBadge.earned;

  return (
    <div className="bg-surface-dark rounded-3xl p-6 flex-1 shadow-sm flex flex-col h-full overflow-hidden">
       
       <div className="flex justify-between items-center mb-4 shrink-0">
           <h3 className="font-semibold text-lg text-white">Current Objective</h3>
           <motion.div
             className={cn(
               "px-2 py-0.5 rounded-full text-xs font-mono font-bold",
               isMastered ? "bg-primary/20 text-primary" : "bg-surface-dark-lighter text-primary"
             )}
             animate={{ opacity: [0.8, 1, 0.8] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             {isMastered ? 'MASTERED' : 'IN PROGRESS'}
           </motion.div>
       </div>

       {/* Hero Badge - Spotlight */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="flex-1 flex flex-col items-center justify-center p-4 bg-surface-dark-lighter rounded-2xl border border-primary/20 relative overflow-hidden group mb-4"
       >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <motion.div
             animate={{ 
               filter: ["drop-shadow(0 0 10px rgba(16,185,129,0.3))", "drop-shadow(0 0 20px rgba(16,185,129,0.5))", "drop-shadow(0 0 10px rgba(16,185,129,0.3))"] 
             }}
             transition={{ duration: 3, repeat: Infinity }}
             className="mb-3 relative"
          >
             <Icon className="w-16 h-16 text-gray-500 group-hover:text-primary/80 transition-colors duration-500" />
             <div className="absolute inset-0 flex items-center justify-center">
               <Lock className="w-6 h-6 text-gray-800" />
             </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-1">{nextBadge.name}</h2>
          <p className="text-sm text-gray-400 mb-4">{nextBadge.desc}</p>

          <div className="w-full max-w-[200px] flex flex-col gap-2">
             <div className="flex justify-between text-xs font-mono text-gray-500">
               <span>{nextBadge.current}</span>
               <span className="text-primary">{nextBadge.target}</span>
             </div>
             <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-primary"
                   initial={{ width: 0 }}
                   animate={{ width: `${nextBadge.progress}%` }}
                   transition={{ duration: 1, ease: "easeOut" }}
                />
             </div>
          </div>
       </motion.div>
       
       {/* Trophy Cabinet (Earned) */}
       {earnedBadges.length > 0 && (
         <div className="shrink-0">
             <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Unlocked ({earnedBadges.length})</div>
             <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {earnedBadges.map(badge => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ y: -2 }}
                    className="w-10 h-10 rounded-lg bg-surface-dark-lighter border border-primary/30 flex items-center justify-center shrink-0 text-primary shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    title={badge.name}
                  >
                     <badge.icon className="w-5 h-5 fill-primary/20" />
                  </motion.div>
                ))}
             </div>
         </div>
       )}
    </div>
  );
}
