'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitCategory, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Activity, Briefcase, Zap, Sparkles, Pencil, Timer, CheckCircle, Repeat, Circle } from 'lucide-react';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: HabitCategory, isStreakable: boolean, targetTime?: number) => void;
  initialData?: Habit | null;
}

const categories = [
  { id: 'health' as const, icon: Activity, label: 'Health', color: 'from-green-500 to-emerald-500' },
  { id: 'work' as const, icon: Briefcase, label: 'Work', color: 'from-blue-500 to-cyan-500' },
  { id: 'learning' as const, icon: Brain, label: 'Learn', color: 'from-purple-500 to-pink-500' },
  { id: 'other' as const, icon: Zap, label: 'Other', color: 'from-amber-500 to-orange-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export function AddHabitModal({ isOpen, onClose, onSave, initialData }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  
  // Task Type State
  const [isStreakable, setIsStreakable] = useState(true);
  
  // Time Tracking State
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setIsStreakable(initialData.isStreakable !== false); // default to true for backwards compat
      if (initialData.targetTime && initialData.targetTime > 0) {
        setIsTimeBased(true);
        setHours(Math.floor(initialData.targetTime / 60));
        setMinutes(initialData.targetTime % 60);
      } else {
        setIsTimeBased(false);
        setHours(0);
        setMinutes(30);
      }
    } else {
      setTitle('');
      setCategory('health');
      setIsStreakable(true);
      setIsTimeBased(false);
      setHours(0);
      setMinutes(30);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const targetTime = isTimeBased && isStreakable ? (hours * 60) + minutes : 0;
      onSave(title, category, isStreakable, targetTime);
      if (!isEditing) {
        setTitle('');
        setCategory('health');
        setIsStreakable(true);
        setIsTimeBased(false);
        setHours(0);
        setMinutes(30);
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-dark border-surface-border sm:max-w-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {isEditing ? <Pencil className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
              </motion.div>
              {isEditing ? 'Edit Protocol' : 'New Protocol'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-text-muted mb-2">Protocol Name</label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep Work Session"
                  className="bg-background-dark border-surface-border text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  autoFocus
                />
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-text-muted mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <motion.div
                      key={cat.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-4 h-auto rounded-xl border-2 transition-all overflow-hidden w-full justify-start",
                          isSelected
                            ? 'border-primary bg-primary/10 hover:bg-primary/10'
                            : 'border-surface-border bg-background-dark hover:border-surface-border/80 hover:bg-background-dark'
                        )}
                      >
                      {/* Gradient background on select */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={cn("absolute inset-0 bg-gradient-to-br", cat.color)}
                          />
                        )}
                      </AnimatePresence>
                      
                      <motion.div
                        animate={isSelected ? { 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.4 }}
                        className={cn(
                          "relative z-10 p-2 rounded-lg transition-colors",
                          isSelected ? "bg-primary/20 text-primary" : "bg-surface-dark-lighter text-gray-500"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span className={cn(
                        "relative z-10 font-medium transition-colors",
                        isSelected ? "text-white" : "text-text-muted"
                      )}>
                        {cat.label}
                      </span>
                      
                      {/* Check mark */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Task Type Section */}
            <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.25 }}
                 className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4"
            >
                <label className="text-sm font-medium text-text-muted whitespace-nowrap">Task Type</label>
                <div className="flex w-full sm:w-auto gap-2 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <button
                        type="button"
                        onClick={() => setIsStreakable(true)}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            isStreakable ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Repeat className="w-4 h-4" />
                        Daily
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsStreakable(false)}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            !isStreakable ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Circle className="w-4 h-4" />
                        One Time
                    </button>
                </div>
            </motion.div>

            {/* Goal Type Section - Only for Streakable tasks */}
            <AnimatePresence>
            {isStreakable && (
            <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 overflow-hidden"
            >
                <label className="text-sm font-medium text-text-muted whitespace-nowrap">Goal Type</label>
                <div className="flex w-full sm:w-auto gap-2 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <button
                        type="button"
                        onClick={() => setIsTimeBased(false)}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            !isTimeBased ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Check-off
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTimeBased(true)}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            isTimeBased ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Timer className="w-4 h-4" />
                        Time-based
                    </button>
                </div>

                {/* Time Input */}
                <AnimatePresence>
                    {isTimeBased && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-4 items-end bg-[#1A1A1A] p-4 rounded-xl border border-surface-border/50">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Hours</label>
                                    <Input 
                                        type="number" 
                                        min="0" 
                                        max="23"
                                        value={hours}
                                        onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                                        className="bg-transparent border-surface-border text-white text-center font-mono text-lg" 
                                    />
                                </div>
                                <span className="text-gray-500 mb-2 font-bold">:</span>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Minutes</label>
                                    <Input 
                                        type="number" 
                                        min="0" 
                                        max="59" 
                                        value={minutes}
                                        onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                                        className="bg-transparent border-surface-border text-white text-center font-mono text-lg" 
                                    />
                                </div>
                                <div className="flex items-center justify-center h-10 px-2 text-primary font-mono text-xs font-bold border border-primary/20 rounded bg-primary/5">
                                    {hours}h {minutes}m / day
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            )}
            </AnimatePresence>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={!title.trim()}
                className="w-full bg-primary hover:bg-primary-glow font-bold py-6 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <motion.span
                  className="relative z-10 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isEditing ? <Pencil className="w-4 h-4" /> : <Sparkles className="w-4 h-4 group-hover:animate-pulse" />}
                  {isEditing ? 'Update Protocol' : 'Initialize Protocol'}
                </motion.span>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
