'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { PulseRing } from './animations';
import { 
  Briefcase, 
  Zap, 
  Brain, // Changed from BookOpen
  Activity,
  Code,
  PenTool,
  Dumbbell,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
  Play,
  Pause,
  Check,
  Edit3,
  RotateCcw,
  Circle,
  Repeat
} from 'lucide-react';

import { Card } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onProgress?: (id: string, minutes: number) => void;
  index?: number;
}

export function HabitCard({ habit, onToggle, onDelete, onEdit, onProgress, index = 0 }: HabitCardProps) {
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);
  const [showPulse, setShowPulse] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Time Tracking Logic - only for streakable tasks
  // Time Tracking Logic - only for streakable tasks
  const isStreakable = habit.isStreakable !== false;
  const isTimeBased = isStreakable && (habit.targetTime || 0) > 0;

  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Convert Daily Progress (minutes) to seconds for local state
  const storedMinutes = habit.dailyProgress?.[today] || 0;
  const [localSeconds, setLocalSeconds] = useState(storedMinutes * 60);
  const localSecondsRef = useRef(storedMinutes * 60);

  // Keep ref in sync for cleanup function
  useEffect(() => {
    localSecondsRef.current = localSeconds;
  }, [localSeconds]);

  // Sync local state when prop changes (if not active, to respect remote updates)
  useEffect(() => {
    if (!isActive) {
        setLocalSeconds(storedMinutes * 60);
        localSecondsRef.current = storedMinutes * 60;
    }
  }, [storedMinutes, isActive]);

  const targetMinutes = habit.targetTime || 0;
  const progressPercent = isTimeBased ? Math.min(100, (localSeconds / 60 / targetMinutes) * 100) : (isCompleted ? 100 : 0);
  
  // Backwards compatibility for render
  const currentMinutes = Math.floor(localSeconds / 60);

  // 1. Timer Driver & Safety
  useEffect(() => {
    if (isActive && isTimeBased) {
      timerRef.current = setInterval(() => {
        setLocalSeconds(prev => {
           const newValue = prev + 1;
           // Sync to parent every 60 seconds
           if (newValue % 60 === 0 && onProgress) {
               onProgress(habit.id, Math.floor(newValue / 60));
           }
           return newValue;
        });
      }, 1000); 

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Final sync
        if (onProgress) {
             onProgress(habit.id, Math.floor(localSecondsRef.current / 60));
        }
      };
    }
  }, [isActive, isTimeBased, habit.id, onProgress]);

  // 2. Title Updater (runs every second)
  useEffect(() => {
      if (isActive && isTimeBased) {
           document.title = `▶ ${formatTime(localSeconds)} • ${habit.title}`;
           return () => {
               document.title = 'Momentum';
           };
      }
  }, [isActive, isTimeBased, localSeconds, habit.title]);

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (category: string, title: string) => {
    // 1. Check Category Standard Icons (Priority)
    switch (category) {
      case 'health': return <Activity className="w-5 h-5" />;
      case 'fitness': return <Dumbbell className="w-5 h-5" />;
      case 'study': return <Brain className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      // For 'other' or unknown, we try to be smart with keywords
      case 'other': 
      default:
        const t = title.toLowerCase();
        if (t.includes('code') || t.includes('dev') || t.includes('project')) return <Code className="w-5 h-5" />;
        if (t.includes('write') || t.includes('blog') || t.includes('journal')) return <PenTool className="w-5 h-5" />;
        if (t.includes('run') || t.includes('gym') || t.includes('workout')) return <Dumbbell className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    }
  };

 const handleMainAction = (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent card click
      if (isTimeBased) {
          // For time based, the main left button acts as a Quick Start/Pause
          toggleTimer(e);
      } else {
          const wasCompleted = isCompleted;
          onToggle(habit.id);
          if (!wasCompleted) {
            setShowPulse(true);
            setTimeout(() => setShowPulse(false), 600);
          }
      }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleMainAction}
      className={cn(
        "group relative rounded-2xl border transition-all duration-300 overflow-hidden select-none cursor-pointer",
        isCompleted
          ? "bg-primary/10 border-primary/20"
          : isActive
          ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
          : "bg-surface-dark-lighter/20 border-surface-border hover:border-surface-border-hover hover:bg-surface-dark-lighter",
        "h-[72px] flex items-center pr-4" 
      )}
    >
        {/* Progress Bar Background (Bottom Line) */}
        {isTimeBased && (
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-surface-dark-lighter">
                 <motion.div 
                    className={cn("h-full", isCompleted ? "bg-primary" : "bg-primary")}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1 }}
                 />
            </div>
        )}

        <div className="flex items-center w-full h-full p-2 pl-4 gap-4">
            {/* 1. Left Icon: Category or Checkmark */}
            <div className={cn(
                "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                 isCompleted ? "bg-primary text-background-dark" : "bg-surface-dark text-gray-500"
            )}>
                 {isCompleted ? <Check className="w-6 h-6" strokeWidth={3} /> : getIcon(habit.category, habit.title)}
            </div>

            {/* 2. Content Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "font-bold text-base truncate transition-colors",
                         isCompleted ? "text-primary/90 line-through decoration-primary/70 decoration-3" : "text-white"
                    )}>
                        {habit.title}
                    </h3>
                    
                    {/* Streak badge - only for streakable tasks */}
                    {isStreakable && habit.streak > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full cursor-help">
                                    <Flame className="w-3 h-3 fill-orange-400/20" />
                                    <span>{habit.streak}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-surface-dark-lighter fill-surface-dark-lighter border-surface-border">
                                <p className="text-white">{habit.streak}-day streak! Keep going 🔥</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Daily task badge - only for streakable tasks */}
                    {isStreakable && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full cursor-help">
                                    <Repeat className="w-3 h-3" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-surface-dark-lighter fill-surface-dark-lighter border-surface-border">
                                <p className="text-white">Daily task - Repeats every day</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                    {/* One Time task badge - only for non-streakable */}
                    {!isStreakable && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full cursor-help">
                                    <Circle className="w-3 h-3" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-surface-dark-lighter fill-surface-dark-lighter border-surface-border">
                                <p className="text-white">One-time task - Complete once</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Category Dot - Minimal colored indicator */}
                    {(() => {
                        const categoryColors = {
                            health: 'bg-emerald-400',
                            work: 'bg-blue-400',
                            study: 'bg-purple-400',
                            other: 'bg-amber-400',
                        };
                        const dotColor = categoryColors[habit.category] || categoryColors.other;
                        return (
                            <div className="flex items-center gap-1.5">
                                <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                                <span className="text-[10px] text-gray-500 capitalize font-medium">
                                    {habit.category}
                                </span>
                            </div>
                        );
                    })()}
                    
                    {/* Timer Info - Only for Time-Based Habits */}
                    {isTimeBased && (
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                            <span className={cn(isActive && "text-amber-400 font-bold")}>
                                {formatTime(localSeconds)}
                            </span>
                            <span className="opacity-30">/</span>
                            <span>{formatTime(targetMinutes * 60)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Action Buttons (Always Visible) */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                
                {/* Time Controls */}
                {isTimeBased && (
                    <>
                         {/* Reset Button */}
                         <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); onProgress?.(habit.id, 0); }}
                                    className="h-9 w-9 text-gray-500 hover:text-white hover:bg-surface-dark-lighter rounded-lg mr-1"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Reset Timer</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>

                        {/* Manual Add Small Button */}
                         <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onProgress?.(habit.id, currentMinutes + 10); }}
                                    className="h-9 px-2 text-gray-500 hover:text-primary hover:bg-surface-dark font-mono text-xs border border-transparent hover:border-surface-border rounded-lg mr-1"
                                >
                                    +10m
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Add 10 minutes manually</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>

                         {/* Play/Pause Button */}
                         <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-9 w-9 rounded-lg transition-all mr-1",
                                isActive 
                                    ? "text-amber-500 hover:text-amber-400 bg-amber-500/10" // Simple yellow icon with very subtle bg
                                    : "text-gray-400 hover:text-white hover:bg-surface-dark-lighter"
                            )}
                            onClick={toggleTimer}
                         >
                            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                         </Button>
                    </>
                )}

                <div className="w-px h-5 bg-surface-border mx-1" />

                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-500 hover:text-white hover:bg-surface-dark-lighter rounded-lg"
                            onClick={() => onEdit(habit)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Task</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>


                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent className="bg-red-500 border-red-600 text-white fill-red-500">Delete Task</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <AlertDialogContent className="bg-surface-dark border-surface-border text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                This will permanently delete <span className="text-white font-bold">"{habit.title}"</span>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-surface-border text-gray-300 hover:bg-surface-dark-lighter hover:text-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => onDelete(habit.id)}
                                className="bg-red-500 text-white hover:bg-red-600 border-none"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    </motion.div>
  );
}
