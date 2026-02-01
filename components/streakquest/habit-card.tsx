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
}

export function HabitCard({ habit, onToggle, onDelete, index = 0 }: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const [showXp, setShowXp] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const getIcon = (category: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('project')) return <Code className="w-5 h-5" />;
    if (t.includes('write') || t.includes('journal')) return <PenTool className="w-5 h-5" />;
    if (t.includes('run') || t.includes('gym')) return <Dumbbell className="w-5 h-5" />;
    
    switch (category) {
      case 'health': return <Activity className="w-5 h-5" />;
      case 'learning': return <BookOpen className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
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
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleToggle}
      className={cn(
        "relative group cursor-pointer flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 select-none overflow-hidden h-[160px] border",
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

      {/* Top Row */}
      <div className="flex justify-between items-start z-10">
        <motion.div 
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
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

        {/* Toggle */}
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
      </div>

      {/* Info */}
      <div className="z-10 mt-auto">
        <motion.h3 
          className={cn("text-base font-bold mb-1 transition-colors", isCompleted ? "text-white" : "text-gray-300")}
          animate={isCompleted ? { x: [0, 2, -2, 1, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          {habit.title}
        </motion.h3>
        <div className="flex items-center justify-between">
           <p className="text-xs font-mono text-gray-500">
             {habit.description || (habit.category === 'work' ? '2 Pomodoro Sessions' : 'Daily Goal')}
           </p>
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
        </div>
      </div>
    </motion.div>
  );
}
