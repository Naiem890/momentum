'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { XpPop, PulseRing } from './animations';
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

export function HabitCard({ habit, onToggle, onDelete, index = 0, compact = false }: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const [showXp, setShowXp] = useState(false);
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
      setShowXp(true);
      setShowPulse(true);
      setTimeout(() => setShowXp(false), 1000);
      setTimeout(() => setShowPulse(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.05
      }}
      whileHover={{ 
        scale: compact ? 1.01 : 1.02,
        y: compact ? -1 : -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleToggle}
      className={cn(
        "relative group cursor-pointer rounded-2xl transition-all duration-300 select-none overflow-hidden border",
        compact 
          ? "flex items-center gap-4 p-3 h-[72px]" 
          : "flex flex-col justify-between p-6 h-[160px]",
        isCompleted 
          ? "bg-surface-dark-lighter border-primary/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
          : "bg-surface-dark-lighter border-transparent hover:border-surface-border"
      )}
    >
      {/* Pulse effect */}
      <PulseRing active={showPulse} />
      
      {/* XP Pop */}
      <XpPop amount={habit.xpValue} show={showXp} />

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

      {/* Content */}
      <div className={cn("z-10 flex", compact ? "order-1 items-center" : "order-1 w-full justify-between items-start")}>
        <motion.div 
          className={cn(
            "rounded-xl flex items-center justify-center transition-colors duration-300",
            compact ? "w-10 h-10 shrink-0" : "w-10 h-10",
            isCompleted ? "bg-primary text-background-dark" : "bg-surface-dark text-gray-500 group-hover:text-white"
          )}
          animate={isCompleted ? {
            rotate: [0, -10, 10, -5, 5, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.5 }}
        >
           {getIcon(habit.category, habit.title)}
        </motion.div>

        {!compact && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Switch 
              checked={isCompleted} 
              onCheckedChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </div>

      <div className={cn("z-10", compact ? "flex-1 order-2 flex items-center justify-between" : "order-2 mt-auto w-full")}>
        <div className={cn(compact ? "flex items-center gap-3" : "block")}>
           <motion.h3 
             className={cn("font-bold transition-colors", compact ? "text-sm mb-0" : "text-base mb-1", isCompleted ? "text-white" : "text-gray-300")}
             animate={isCompleted ? { x: [0, 2, -2, 1, 0] } : {}}
             transition={{ duration: 0.3 }}
           >
             {habit.title}
           </motion.h3>
           
           {!compact && (
             <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-gray-500">
                  {habit.description || (habit.category === 'work' ? '2 Pomodoro Sessions' : 'Daily Goal')}
                </p>
                {/* Streak moved to sidebar in compact */}
             </div>
           )}
        </div>

        {/* Right side in compact mode: Streak + Switch */}
        <div className={cn(compact ? "flex items-center gap-4" : "absolute bottom-6 right-6")}>
          <AnimatePresence>
             {habit.streak > 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0 }}
                 className="flex items-center gap-1 text-[10px] text-primary font-bold"
               >
                   <motion.div
                     animate={{ 
                       y: [0, -2, 0],
                       rotate: [0, -5, 5, 0]
                     }}
                     transition={{ 
                       duration: 1.5,
                       repeat: Infinity,
                       ease: "easeInOut"
                     }}
                   >
                     <Flame className="w-3 h-3 fill-primary/50" />
                   </motion.div>
                   <motion.span
                     key={habit.streak}
                     initial={{ scale: 1.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", stiffness: 500 }}
                   >
                     {habit.streak}
                   </motion.span>
               </motion.div>
             )}
           </AnimatePresence>

           {compact && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Switch 
                  checked={isCompleted} 
                  onCheckedChange={handleToggle}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
