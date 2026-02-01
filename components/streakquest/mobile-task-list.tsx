'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [taskToRestore, setTaskToRestore] = React.useState<Habit | null>(null);

  const streakableTasks = habits.filter(h => h.isStreakable);
  const additionalTasks = habits.filter(h => !h.isStreakable);

  const filters: { id: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All', icon: null, count: habits.length },
    { id: 'daily', label: 'Daily', icon: <Flame className="w-3 h-3 text-orange-400" />, count: streakableTasks.length },
    { id: 'onetime', label: 'One-time', icon: <Circle className="w-3 h-3 text-blue-400" />, count: additionalTasks.length },
    { id: 'completed', label: 'Done', icon: <CheckCircle2 className="w-3 h-3 text-green-400" />, count: completedTasks.length },
  ];

  const getFilteredTasks = () => {
    switch (filter) {
      case 'daily': return streakableTasks;
      case 'onetime': return additionalTasks;
      case 'completed': return completedTasks;
      default: return habits;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="flex flex-col h-full">
      {/* Filter Pills */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              filter === f.id
                ? "bg-surface-dark-lighter text-white border border-white/10"
                : "bg-transparent text-gray-500 border border-transparent"
            )}
          >
            {f.icon}
            {f.label}
            <span className="text-[10px] opacity-60">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 pb-[100px]">
        <AnimatePresence mode="wait">
          {filter === 'completed' ? (
            // Completed Tasks View
            completedTasks.length === 0 ? (
              <motion.div
                key="empty-completed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <CheckCircle2 className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium">No Completed Tasks</p>
                <p className="text-sm text-gray-600">Complete One-Time tasks to see them here</p>
              </motion.div>
            ) : (
              <motion.div
                key="list-completed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3"
              >
                {completedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
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
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : filteredTasks.length === 0 ? (
            // Empty State
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-12 h-12 text-gray-600 mb-4" />
              </motion.div>
              <p className="text-gray-400 font-medium">
                {filter === 'all' ? 'No Active Tasks' : filter === 'daily' ? 'No Daily Tasks' : 'No One-Time Tasks'}
              </p>
              <p className="text-sm text-gray-600">Tap + to add your first task</p>
            </motion.div>
          ) : (
            // Active Tasks
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
            >
              <AnimatePresence mode="popLayout">
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
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB - Floating Action Button */}
      <motion.button
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
