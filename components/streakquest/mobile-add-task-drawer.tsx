'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HabitCategory, Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Activity, 
  Briefcase, 
  Zap, 
  Sparkles, 
  Pencil, 
  Timer, 
  CheckCircle, 
  Repeat, 
  Circle,
  X
} from 'lucide-react';

interface MobileAddTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: HabitCategory, isStreakable: boolean, targetTime?: number) => void;
  initialData?: Habit | null;
}

const categories = [
  { id: 'health' as const, icon: Activity, label: 'Health' },
  { id: 'work' as const, icon: Briefcase, label: 'Work' },
  { id: 'study' as const, icon: Brain, label: 'Study' },
  { id: 'other' as const, icon: Zap, label: 'Other' },
];

export function MobileAddTaskDrawer({ isOpen, onClose, onSave, initialData }: MobileAddTaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [isStreakable, setIsStreakable] = useState(true);
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  
  const drawerRef = useRef<HTMLDivElement>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setIsStreakable(initialData.isStreakable !== false);
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

  // Scroll to top when drawer opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Small delay to ensure drawer is rendered
      setTimeout(() => {
        drawerRef.current?.scrollTo(0, 0);
      }, 50);
    }
  }, [isOpen]);

  const handleSubmit = () => {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="sticky top-0 bg-surface-dark pt-3 pb-2 z-10">
              <div className="flex justify-center">
                <div className="w-10 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>
            
            {/* Header */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-surface-border">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {isEditing ? <Pencil className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
                {isEditing ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-surface-dark-lighter active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-5 space-y-5">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Task Name</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep Work Session"
                  className="bg-background-dark border-surface-border text-white placeholder:text-zinc-600 h-12 text-base rounded-xl"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95",
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-surface-border bg-background-dark'
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-gray-500")} />
                        <span className={cn("text-xs font-medium", isSelected ? "text-white" : "text-gray-500")}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Task Type</label>
                <div className="flex gap-2 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border">
                  <button
                    type="button"
                    onClick={() => setIsStreakable(true)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isStreakable ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400"
                    )}
                  >
                    <Repeat className="w-4 h-4" />
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStreakable(false)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      !isStreakable ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400"
                    )}
                  >
                    <Circle className="w-4 h-4" />
                    One Time
                  </button>
                </div>
              </div>

              {/* Goal Type - Only for Daily tasks */}
              {isStreakable && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Goal Type</label>
                  <div className="flex gap-2 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <button
                      type="button"
                      onClick={() => setIsTimeBased(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        !isTimeBased ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400"
                      )}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Check-off
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTimeBased(true)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isTimeBased ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-400"
                      )}
                    >
                      <Timer className="w-4 h-4" />
                      Time-based
                    </button>
                  </div>
                </div>
              )}

              {/* Time Duration - Only for time-based */}
              {isStreakable && isTimeBased && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Duration</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 mb-1 block text-center">Hours</label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="23"
                        value={hours}
                        onChange={(e) => setHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-background-dark border-surface-border text-white text-center font-mono text-lg h-12 rounded-xl" 
                      />
                    </div>
                    <span className="text-gray-500 font-bold text-xl mt-5">:</span>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 mb-1 block text-center">Minutes</label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="59" 
                        value={minutes}
                        onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-background-dark border-surface-border text-white text-center font-mono text-lg h-12 rounded-xl" 
                      />
                    </div>
                    <div className="flex items-center justify-center h-12 px-4 mt-5 text-primary font-mono text-sm font-bold border border-primary/20 rounded-xl bg-primary/5">
                      {hours}h {minutes}m
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98]",
                  title.trim()
                    ? "bg-primary text-background-dark shadow-lg shadow-primary/30"
                    : "bg-surface-dark-lighter text-gray-500 cursor-not-allowed"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  {isEditing ? <Pencil className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  {isEditing ? 'Update Task' : 'Create Task'}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
