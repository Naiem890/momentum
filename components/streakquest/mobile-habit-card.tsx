'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Zap, 
  Brain,
  Activity,
  Code,
  PenTool,
  Dumbbell,
  Flame,
  Check,
  Play,
  Pause,
  RotateCcw,
  Circle,
  Repeat,
  Trash2,
  Pencil,
  X,
  Clock,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MobileHabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onProgress?: (id: string, minutes: number) => void;
  index?: number;
}

export function MobileHabitCard({ habit, onToggle, onDelete, onEdit, onProgress, index = 0 }: MobileHabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Time Tracking Logic
  const isStreakable = habit.isStreakable !== false;
  const isTimeBased = isStreakable && (habit.targetTime || 0) > 0;
  const currentMinutes = habit.dailyProgress?.[today] || 0;
  const targetMinutes = habit.targetTime || 0;
  const progressPercent = isTimeBased ? Math.min(100, (currentMinutes / targetMinutes) * 100) : (isCompleted ? 100 : 0);
  
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && isTimeBased) {
      timerRef.current = setInterval(() => {
        if (onProgress) {
          onProgress(habit.id, currentMinutes + 1);
        }
      }, 60000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isTimeBased, habit.id, currentMinutes, onProgress]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getIcon = (category: string, title: string) => {
    switch (category) {
      case 'health': return <Activity className="w-5 h-5" />;
      case 'fitness': return <Dumbbell className="w-5 h-5" />;
      case 'study': return <Brain className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      default:
        const t = title.toLowerCase();
        if (t.includes('code') || t.includes('dev')) return <Code className="w-5 h-5" />;
        if (t.includes('write') || t.includes('blog')) return <PenTool className="w-5 h-5" />;
        if (t.includes('run') || t.includes('gym')) return <Dumbbell className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    }
  };

  const handleMainTap = () => {
    if (isTimeBased) {
      setIsActive(!isActive);
    } else {
      onToggle(habit.id);
    }
  };

  const handleLongPress = () => {
    setShowActionSheet(true);
  };

  const categoryColors: Record<string, string> = {
    health: 'bg-emerald-400',
    work: 'bg-blue-400',
    study: 'bg-purple-400',
    fitness: 'bg-orange-400',
    other: 'bg-amber-400',
  };

  return (
    <>

      <div
        onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
        className={cn(
          "relative rounded-2xl border transition-all duration-200 overflow-hidden",
          isCompleted
            ? "bg-primary/10 border-primary/30"
            : isActive
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-surface-dark-lighter/50 border-surface-border"
        )}
      >
        {/* Progress bar for time-based */}
        {isTimeBased && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-dark-lighter">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Checkbox / Icon - Touch optimized */}
            <button
              onClick={handleMainTap}
              className={cn(
                "shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                isCompleted 
                  ? "bg-primary text-background-dark shadow-lg shadow-primary/30" 
                  : isActive
                  ? "bg-amber-500/20 text-amber-400 border-2 border-amber-500/50"
                  : "bg-surface-dark text-gray-400 border-2 border-surface-border"
              )}
            >
              {isCompleted ? (
                <Check className="w-7 h-7" strokeWidth={3} />
              ) : isTimeBased ? (
                isActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />
              ) : (
                getIcon(habit.category, habit.title)
              )}
            </button>

            {/* Content */}
            <div 
              className="flex-1 min-w-0 py-1"
              onClick={() => setShowActionSheet(true)}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={cn(
                  "font-bold text-base transition-colors",
                  isCompleted ? "text-primary/80 line-through" : "text-white"
                )}>
                  {habit.title}
                </h3>
                
                {/* Badges */}
                {isStreakable && habit.streak > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
                    <Flame className="w-3 h-3 fill-orange-400/20" />
                    {habit.streak}
                  </span>
                )}
                {isStreakable && (
                  <span className="inline-flex items-center text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    <Repeat className="w-3 h-3" />
                  </span>
                )}
                {!isStreakable && (
                  <span className="inline-flex items-center text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                    <Circle className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1">
                {/* Category */}
                <span className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", categoryColors[habit.category] || categoryColors.other)} />
                  <span className="text-xs text-gray-500 capitalize">{habit.category}</span>
                </span>
                
                {/* Timer info */}
                {isTimeBased && (
                  <span className={cn(
                    "text-xs font-mono flex items-center gap-1",
                    isActive ? "text-amber-400 font-bold" : "text-gray-400"
                  )}>
                    <Clock className="w-3 h-3" />
                    {formatTime(currentMinutes)} / {formatTime(targetMinutes)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Sheet */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionSheet(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Action Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark border-t border-white/10 rounded-t-3xl overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-600 rounded-full" />
              </div>
              
              {/* Task Info Header */}
              <div className="px-5 pb-4 border-b border-surface-border">
                <h3 className="text-lg font-bold text-white truncate">{habit.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{habit.category} • {isStreakable ? 'Daily Task' : 'One-time Task'}</p>
              </div>
              
              {/* Actions */}
              <div className="p-3">
                {isTimeBased && (
                  <>
                    <button
                      onClick={() => { onProgress?.(habit.id, currentMinutes + 10); setShowActionSheet(false); }}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-dark-lighter active:scale-[0.98] transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-white font-medium">Add 10 Minutes</span>
                    </button>
                    
                    <button
                      onClick={() => { onProgress?.(habit.id, 0); setShowActionSheet(false); }}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-dark-lighter active:scale-[0.98] transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-white font-medium">Reset Timer</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => { setShowActionSheet(false); onEdit(habit); }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-dark-lighter active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-white font-medium">Edit Task</span>
                </button>
                
                <button
                  onClick={() => { setShowActionSheet(false); setIsDeleteOpen(true); }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red-500/10 active:scale-[0.98] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-red-400 font-medium">Delete Task</span>
                </button>
              </div>
              
              {/* Cancel Button */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => setShowActionSheet(false)}
                  className="w-full py-4 rounded-xl bg-surface-dark-lighter text-gray-400 font-semibold active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-surface-dark border-surface-border text-white mx-4 rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete <span className="text-white font-bold">"{habit.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-transparent border-surface-border text-gray-300 hover:bg-surface-dark-lighter rounded-xl flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(habit.id)}
              className="bg-red-500 text-white hover:bg-red-600 border-none rounded-xl flex-1"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
