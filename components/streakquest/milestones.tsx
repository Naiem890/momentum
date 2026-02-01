'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { UserStats, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Zap, Flame, Award, Medal, Crown, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MilestonesProps {
  stats: UserStats;
  habits: Habit[];
  currentStreak: number;
}

export function Milestones({ stats, habits, currentStreak }: MilestonesProps) {
  const maxStreak = currentStreak;
  
  const badges = [
    { id: '7day', name: '7-DAY CHALLENGE', icon: Zap, earned: maxStreak >= 7, desc: '7 Day Streak', progress: Math.min(100, (maxStreak / 7) * 100), target: 7, current: maxStreak, type: 'streak' },
    { id: '30day', name: '30-DAY CHALLENGE', icon: Flame, earned: maxStreak >= 30, desc: '30 Day Streak', progress: Math.min(100, (maxStreak / 30) * 100), target: 30, current: maxStreak, type: 'streak' },
    { id: '60day', name: '60-DAY CHALLENGE', icon: Award, earned: maxStreak >= 60, desc: '60 Day Streak', progress: Math.min(100, (maxStreak / 60) * 100), target: 60, current: maxStreak, type: 'streak' },
    { id: '100day', name: '100-DAY CHALLENGE', icon: Medal, earned: maxStreak >= 100, desc: '100 Day Streak', progress: Math.min(100, (maxStreak / 100) * 100), target: 100, current: maxStreak, type: 'streak' },
    { id: '365day', name: 'TITAN CHALLENGE', icon: Crown, earned: maxStreak >= 365, desc: '365 Day Streak', progress: Math.min(100, (maxStreak / 365) * 100), target: 365, current: maxStreak, type: 'streak' },
    { id: '100q', name: 'WARRIOR CHALLENGE', icon: Star, earned: stats.totalHabitsCompleted >= 100, desc: '100 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 100) * 100), target: 100, current: stats.totalHabitsCompleted, type: 'quest' },
    { id: '500q', name: 'LEGEND', icon: Crown, earned: stats.totalHabitsCompleted >= 500, desc: '500 Quests', progress: Math.min(100, (stats.totalHabitsCompleted / 500) * 100), target: 500, current: stats.totalHabitsCompleted, type: 'quest' },
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const nextBadge = badges.find(b => !b.earned) || badges[badges.length - 1];

  const Icon = nextBadge.icon;
  const isMastered = nextBadge.earned;
  const showMastered = !badges.find(b => !b.earned); // All badges earned


  return (
    <Card className="h-full bg-surface-dark border border-white/5 shadow-2xl flex flex-col overflow-hidden rounded-3xl relative group">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
      
      <div className="relative z-10 px-5 py-4">
          {/* Section 1: Focus / Current Objective */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white tracking-widest uppercase opacity-90">Milestones & Badges</h3>
                  <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5",
                      isMastered 
                        ? "bg-primary/20 text-primary border-primary/20" 
                        : "bg-primary/10 text-primary border-primary/20"
                  )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full bg-primary", !isMastered && "animate-pulse")} />
                      {showMastered ? 'ALL MASTERED' : 'IN PROGRESS'}
                  </div>
              </div>

              <div className="flex items-center gap-4 mt-2">
                  <motion.div 
                    className="relative rounded-2xl bg-gradient-to-br from-surface-dark-lighter to-black border border-white/5 flex items-center justify-center shrink-0 shadow-lg w-10 h-10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl" />
                      <Icon className="text-primary drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] w-5 h-5" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                      <h2 
                        className="font-display italic font-bold text-white tracking-wide leading-none mb-1 truncate text-lg"
                        style={{ fontFamily: 'var(--font-russo)' }}
                      >
                        {nextBadge.name}
                      </h2>
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 flex-1 bg-surface-dark-lighter rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${nextBadge.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            />
                         </div>
                         <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{Math.round(nextBadge.progress)}%</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Section 2: Trophy Shelf / Timeline (Only shown if started) */}
            <div className="pt-4"> 
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Journey</span>
                   <span className="text-[10px] text-primary font-mono">{earnedBadges.length} / {badges.length}</span>
                </div>
                
                <div className="flex items-center justify-between px-1">
                    {badges.map((badge, index) => (
                      <div key={badge.id} className="relative group/badge">
                        <Tooltip>
                          <TooltipTrigger>
                             <div 
                                className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-300 cursor-pointer",
                                  badge.earned 
                                    ? "bg-surface-dark-lighter border-primary/30 text-primary shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                                    : "bg-surface-dark-lighter/30 border-white/5 text-gray-700 grayscale hover:grayscale-0 hover:text-primary hover:border-primary/30"
                                )}
                             >
                                <badge.icon className="w-3 h-3" />
                             </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-surface-dark-lighter fill-surface-dark-lighter border-surface-border text-white text-xs">
                            <p className="font-bold">{badge.name}</p>
                            <p className="text-gray-400 text-[10px]">{badge.desc}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                </div>
            </div>
      </div>
    </Card>
  );
}
