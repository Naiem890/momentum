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
import { Brain, Activity, Briefcase, Zap, Sparkles, Pencil } from 'lucide-react';
import { useEffect } from 'react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: HabitCategory) => void;
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
  
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
    } else {
      setTitle('');
      setCategory('health');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, category);
      if (!isEditing) {
        setTitle('');
        setCategory('health');
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-dark border-surface-border max-w-md overflow-hidden">
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
              {isEditing ? 'Edit Quest' : 'New Quest'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-text-muted mb-2">Quest Title</label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Read 10 pages"
                  className="bg-background-dark border-surface-border text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-primary/50 transition-all"
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
                  {isEditing ? 'Update Quest' : 'Start Quest'}
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
