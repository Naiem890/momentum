'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MobileHabitCard } from './mobile-habit-card';
import { 
  Plus, 
  Flame, 
  Circle, 
  CheckCircle2, 
  Zap,
  RotateCcw,
  Trash2 
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

type FilterType = 'all' | 'daily' | 'onetime' | 'completed';

interface MobileTaskListProps {
  habits: Habit[];
  completedTasks: Habit[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onProgress: (id: string, minutes: number) => void;
  onCompleteAdditional: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onDeleteCompletedTask: (id: string) => void;
  onAddNew: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
};

export function MobileTaskList({
  habits,
  completedTasks,
  onToggle,
  onDelete,
  onEdit,
  onProgress,
  onCompleteAdditional,
  onRestoreTask,
  onDeleteCompletedTask,
  onAddNew
}: MobileTaskListProps) {
  const [filterIndex, setFilterIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [taskToRestore, setTaskToRestore] = useState<Habit | null>(null);

  const streakableTasks = habits.filter(h => h.isStreakable);
  const additionalTasks = habits.filter(h => !h.isStreakable);

  const filters: { id: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All', icon: null, count: habits.length },
    { id: 'daily', label: 'Daily', icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, count: streakableTasks.length },
    { id: 'onetime', label: 'One-time', icon: <Circle className="w-3.5 h-3.5 text-blue-400" />, count: additionalTasks.length },
    { id: 'completed', label: 'Done', icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />, count: completedTasks.length },
  ];

  const currentFilter = filters[filterIndex];

  const setFilter = (index: number) => {
    setDirection(index > filterIndex ? 1 : -1);
    setFilterIndex(index);
  };

  const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (swipePower < -swipeConfidenceThreshold) {
       // Swipe Left -> Next Tab
       if (filterIndex < filters.length - 1) {
         setFilter(filterIndex + 1);
       }
    } else if (swipePower > swipeConfidenceThreshold) {
      // Swipe Right -> Prev Tab
      if (filterIndex > 0) {
        setFilter(filterIndex - 1);
      }
    }
  };

  const getFilteredTasks = () => {
    switch (currentFilter.id) {
      case 'daily': return streakableTasks;
      case 'onetime': return additionalTasks;
      case 'completed': return completedTasks;
      default: return habits;
    }
  };

  const filteredTasks = getFilteredTasks();

  // Scroll active pill into view
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (filtersContainerRef.current) {
        const activeBtn = filtersContainerRef.current.children[filterIndex] as HTMLElement;
        if(activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [filterIndex]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filter Pills */}
      <div 
        ref={filtersContainerRef}
        className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0"
      >
        {filters.map((f, index) => (
          <button
            key={f.id}
            onClick={() => setFilter(index)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 relative",
              filterIndex === index
                ? "text-white"
                : "text-gray-500 hover:text-gray-400"
            )}
          >
             {filterIndex === index && (
                <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 bg-surface-dark-lighter border border-white/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
                {f.icon}
                {f.label}
                <span className={cn("text-[10px] transition-opacity duration-300", filterIndex === index ? "opacity-60" : "opacity-40")}>
                    ({f.count})
                </span>
            </span>
          </button>
        ))}
      </div>

      {/* Task List - Swipeable Area */}
      <div className="flex-1 relative overflow-hidden w-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
                key={filterIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={onDragEnd}
                className="w-full h-full overflow-y-auto px-4 pb-[400px]"
                // Prevent vertical scroll interruption
                style={{ touchAction: "pan-y" }} 
            >
             {currentFilter.id === 'completed' ? (
                // Completed Tasks View
                completedTasks.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center py-20"
                >
                    <CheckCircle2 className="w-16 h-16 text-surface-dark-lighter mb-4" />
                    <p className="text-gray-400 font-medium text-lg">No Completed Tasks</p>
                    <p className="text-sm text-gray-600 mt-1">Complete tasks to see them here</p>
                </div>
                ) : (
                <div
                    className="flex flex-col gap-3 pt-1"
                >
                    {completedTasks.map((task, index) => (
                    <div
                        key={task.id}
                        onClick={() => setTaskToRestore(task)}
                        className="flex items-center justify-between p-4 bg-surface-dark-lighter/50 rounded-2xl border border-surface-border active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-gray-400 line-through truncate">{task.title}</p>
                            <p className="text-[10px] text-gray-600 font-mono">
                            {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTaskToRestore(task)}
                            className="h-9 w-9 text-gray-500 rounded-xl"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteCompletedTask(task.id)}
                            className="h-9 w-9 text-gray-500 hover:text-red-400 rounded-xl"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        </div>
                    </div>
                    ))}
                </div>
                )
            ) : filteredTasks.length === 0 ? (
                // Empty State
                <div
                className="flex flex-col items-center justify-center py-20"
                >
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Zap className="w-16 h-16 text-surface-dark-lighter mb-4" />
                </motion.div>
                <p className="text-gray-400 font-medium text-lg">
                    {currentFilter.id === 'all' ? 'No Active Tasks' : currentFilter.id === 'daily' ? 'No Daily Tasks' : 'No One-Time Tasks'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Tap + to add your first task</p>
                </div>
            ) : (
                // Active Tasks
                <div
                    className="flex flex-col gap-3 pt-1"
                >
                    {filteredTasks.map((habit, index) => (
                    <MobileHabitCard
                        key={habit.id}
                        habit={habit}
                        onToggle={habit.isStreakable ? onToggle : onCompleteAdditional}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onProgress={onProgress}
                        index={index}
                    />
                    ))}
                </div>
            )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB - Floating Action Button */}
      <motion.button
        layout
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onAddNew}
        className="fixed bottom-[90px] right-5 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 z-40"
      >
        <Plus className="w-7 h-7 text-background-dark" strokeWidth={2.5} />
      </motion.button>

      {/* Restore Task Dialog */}
      <AlertDialog open={taskToRestore !== null} onOpenChange={(open) => !open && setTaskToRestore(null)}>
        <AlertDialogContent className="bg-surface-dark border-surface-border rounded-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Restore Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Move <span className="text-white font-medium">"{taskToRestore?.title}"</span> back to active tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-surface-dark-lighter border-surface-border text-gray-400 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToRestore) {
                  onRestoreTask(taskToRestore.id);
                  setTaskToRestore(null);
                }
              }}
              className="font-bold rounded-xl"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
