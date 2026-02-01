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
  Flame,
  MoreVertical,
  Pencil,
  Trash
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  index?: number;
  compact?: boolean;
}

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

// ... interface ...

export function HabitCard({ habit, onToggle, onDelete, onEdit, index = 0, compact = false }: HabitCardProps) {
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
            <div className="flex items-center gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
               <Switch 
                checked={isCompleted} 
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-px h-4 bg-surface-border mx-2" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-white hover:bg-surface-dark-lighter"
                onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-surface-dark border-surface-border text-gray-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Quest?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete <span className="text-primary font-bold">{habit.title}</span>? This action cannot be undone and your streak will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-surface-dark-lighter border-surface-border text-white hover:bg-surface-border hover:text-white" onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(habit.id);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-white hover:bg-surface-dark-lighter opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                        title="Delete"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-surface-dark border-surface-border text-gray-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Quest?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete <span className="text-primary font-bold">{habit.title}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-surface-dark-lighter border-surface-border text-white hover:bg-surface-border hover:text-white" onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600 text-white border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(habit.id);
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
