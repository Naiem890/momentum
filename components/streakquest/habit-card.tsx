'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { PulseRing } from './animations';
import { 
  Briefcase, 
  Zap, 
  BookOpen,
  Activity,
  Code,
  PenTool,
  Dumbbell,
  Flame
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  index?: number;
  compact?: boolean;
}

import { Card } from '@/components/ui/card';

// ... interface ...

export function HabitCard({ habit, onToggle, onDelete, index = 0, compact = false }: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const [showPulse, setShowPulse] = useState(false);

  const getIcon = (category: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('project')) return <Code className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
    if (t.includes('write') || t.includes('journal')) return <PenTool className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
    if (t.includes('run') || t.includes('gym')) return <Dumbbell className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
    
    switch (category) {
      case 'health': return <Activity className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
      case 'learning': return <BookOpen className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
      case 'work': return <Briefcase className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
      default: return <Zap className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />;
    }
  };

  const handleToggle = () => {
    const wasCompleted = isCompleted;
    onToggle(habit.id);
    
    // Only show celebration if completing (not uncompleting)
    if (!wasCompleted) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.2,
        delay: index * 0.05
      }}
      onClick={handleToggle}
      className={cn(
        "group cursor-pointer relative",
        compact ? "h-[72px]" : "h-[160px]"
      )}
    >
      <Card
        className={cn(
          "relative transition-all duration-300 select-none overflow-hidden rounded-2xl w-full h-full",
          "border-0 ring-0 shadow-none gap-0 text-base py-0", // Reset Shadcn Card defaults
          compact 
            ? "flex flex-row items-center gap-4 p-3" 
            : "flex flex-col justify-between p-6",
          isCompleted 
            ? "bg-surface-dark-lighter border border-primary/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
            : "bg-surface-dark-lighter border border-transparent hover:border-surface-border"
        )}
      >
        {/* Pulse effect */}
        <PulseRing active={showPulse} />
        


        {/* Completion Glow */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Content Top Row */}
        <div className={cn("z-10 flex", compact ? "order-1 items-center" : "order-1 w-full justify-between items-start")}>
          <div 
            className={cn(
              "rounded-xl flex items-center justify-center transition-colors duration-300",
              compact ? "w-10 h-10 shrink-0" : "w-10 h-10",
              isCompleted ? "bg-primary text-background-dark" : "bg-surface-dark text-gray-500 group-hover:text-white"
            )}
          >
             {getIcon(habit.category, habit.title)}
          </div>

          {!compact && (
            <div>
              <Switch 
                checked={isCompleted} 
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>

        {/* Content Bottom Row */}
        <div className={cn("z-10", compact ? "flex-1 order-2 flex items-center justify-between" : "order-2 mt-auto w-full")}>
          <div className={cn(compact ? "flex items-center gap-3" : "block")}>
             <h3 
               className={cn("font-bold transition-colors", compact ? "text-sm mb-0" : "text-base mb-1", isCompleted ? "text-white" : "text-gray-300")}
             >
               {habit.title}
             </h3>
             
             {!compact && (
               <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-gray-500">
                    {habit.description || (habit.category === 'work' ? '2 Pomodoro Sessions' : 'Daily Goal')}
                  </p>
               </div>
             )}
          </div>

          {/* Right side in compact mode OR Streak (Absolute) in Normal Mode */}
          <div className={cn(compact ? "flex items-center gap-4" : "absolute bottom-6 right-6")}>
            <AnimatePresence>
               {habit.streak > 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex items-center gap-1 text-[10px] text-primary font-bold"
                 >
                     <div>
                       <Flame className="w-3 h-3 fill-primary/50" />
                     </div>
                     <span
                       key={habit.streak}
                     >
                       {habit.streak}
                     </span>
                 </motion.div>
               )}
             </AnimatePresence>

             {compact && (
                <div>
                  <Switch 
                    checked={isCompleted} 
                    onCheckedChange={handleToggle}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
             )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
