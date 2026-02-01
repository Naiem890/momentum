'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getHabits, 
  saveHabits, 
  getUserStats, 
  saveUserStats
} from '@/lib/storage';
import { Habit, UserStats, HabitCategory } from '@/lib/types';
import { HabitCard } from '@/components/streakquest/habit-card';
import { Heatmap } from '@/components/streakquest/heatmap';
import { Milestones } from '@/components/streakquest/milestones';
import { WeeklyProgress } from '@/components/streakquest/weekly-progress';
import { AddHabitModal } from '@/components/streakquest/add-habit-modal';
import { Celebration, AnimatedCounter, StreakFire } from '@/components/streakquest/animations';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Flame,
  Zap,
  Quote,
  Moon,
  Sun,
} from 'lucide-react';

export default function StreakQuestPage() {
  // --- Theme ---
  const { theme, toggleTheme } = useTheme();
  
  // --- Data State ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    totalHabitsCompleted: 0,
    longestStreak: 0,
    lastLogin: new Date().toISOString().split('T')[0]
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);

  // Initialization
  useEffect(() => {
    setMounted(true);
    const loadedHabits = getHabits();
    const loadedStats = getUserStats();
    
    // Streak check logic
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const updatedHabits = loadedHabits.map(h => {
      const lastCompleted = h.completedDates[h.completedDates.length - 1];
      if (lastCompleted && lastCompleted < yesterdayStr) {
        return { ...h, streak: 0 };
      }
      return h;
    });

    setHabits(updatedHabits);
    setStats(loadedStats);
    setPreviousStreak(Math.max(0, ...updatedHabits.map(h => h.streak)));
    saveHabits(updatedHabits); 
  }, []);

  // --- Habit Logic ---
  const handleToggleHabit = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prevHabits => {
      const newHabits = prevHabits.map(h => {
        if (h.id !== id) return h;
        const isCompletedToday = h.completedDates.includes(today);
        let newStreak = h.streak;
        let newCompletedDates = [...h.completedDates];

        if (isCompletedToday) {
          newStreak = Math.max(0, h.streak - 1); 
          newCompletedDates = newCompletedDates.filter(d => d !== today);
        } else {
          newStreak += 1;
          newCompletedDates.push(today);
          
          // Trigger celebration on milestone streaks
          if (newStreak === 7 || newStreak === 30 || newStreak === 60 || newStreak === 100) {
            setShowCelebration(true);
          }
        }
        return { ...h, streak: newStreak, completedDates: newCompletedDates };
      });
      
      // Check if max streak increased
      const newMaxStreak = Math.max(0, ...newHabits.map(h => h.streak));
      if (newMaxStreak > previousStreak) {
        setPreviousStreak(newMaxStreak);
      }
      
      saveHabits(newHabits);
      return newHabits;
    });
    
    // Update stats
    const today2 = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const isCompletedToday = habit.completedDates.includes(today2);
      setStats(prev => {
        const newCompletedTotal = !isCompletedToday ? prev.totalHabitsCompleted + 1 : Math.max(0, prev.totalHabitsCompleted - 1);
        const currentMaxStreak = Math.max(prev.longestStreak, ...habits.map(h => h.streak));
        const newStats = { ...prev, totalHabitsCompleted: newCompletedTotal, longestStreak: currentMaxStreak };
        saveUserStats(newStats);
        return newStats;
      });
    }
  }, [habits, previousStreak]);

  const handleAddHabit = (title: string, category: HabitCategory) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title,
      category,
      streak: 0,
      completedDates: [],
      createdAt: Date.now(),
      xpValue: 10 
    };
    const newHabits = [...habits, newHabit];
    setHabits(newHabits);
    saveHabits(newHabits);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Are you sure you want to delete this quest?")) {
      const newHabits = habits.filter(h => h.id !== id);
      setHabits(newHabits);
      saveHabits(newHabits);
    }
  };

  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  if (!mounted) {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <motion.div 
          className="text-primary"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-background-dark text-gray-300 flex flex-col overflow-hidden p-4 md:p-6 transition-colors duration-300">
      
      {/* Celebration Confetti */}
      <Celebration trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] w-full mx-auto flex justify-between items-center mb-6 font-mono text-sm tracking-wider shrink-0"
      >
        <motion.div 
          className="text-gray-400 font-semibold flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
           <motion.div
             animate={{ rotate: [0, 5, -5, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Flame className="w-5 h-5 text-primary" />
           </motion.div>
           StreakQuest <span className="text-primary">OS</span>
        </motion.div>
        <div className="flex items-center gap-4">
           <motion.div 
             className="text-[10px] text-gray-600 border border-surface-border px-2 py-1 rounded uppercase"
             animate={{ opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 3, repeat: Infinity }}
           >
             &lt;Focus Mode&gt;
           </motion.div>
        </div>
      </motion.nav>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            
            {/* Left Column (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                {/* Streak Widget */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.01 }}
                  className="relative bg-surface-dark rounded-3xl p-8 flex flex-col justify-between h-[340px] shadow-sm overflow-hidden group shrink-0"
                >
                    {/* Animated top gradient line */}
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Ambient glow */}
                    <motion.div
                      className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    
                    <div className="flex justify-between items-start relative z-10">
                        <StreakFire streak={currentStreak} />
                        <motion.span 
                          className="font-mono text-2xl font-bold text-gray-800 opacity-20 group-hover:opacity-40 transition-opacity"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ delay: 0.5 }}
                        >
                          #01
                        </motion.span>
                    </div>

                    <div className="flex flex-col items-start relative z-10">
                        <motion.h1 
                          className="text-[10rem] leading-none font-bold font-mono tracking-tighter text-white drop-shadow-2xl"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        >
                            <AnimatedCounter value={currentStreak} />
                        </motion.h1>
                        <motion.span 
                          className="text-primary font-mono font-bold tracking-widest text-sm mt-2 uppercase flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            🔥
                          </motion.div>
                          Day Streak
                        </motion.span>
                    </div>
                </motion.div>

                {/* Milestones - Fills remaining height */}
                <motion.div 
                  className="flex-1 min-h-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                   <Milestones stats={stats} habits={habits} />
                </motion.div>
            </div>

            {/* Right Column (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1">
                

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl p-8 flex items-center justify-center shadow-lg min-h-[180px] shrink-0 group m-1"
                >
                    {/* Background Gradient & Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-surface-dark to-surface-dark border border-primary/20 transition-all duration-500 group-hover:border-primary/40" />
                    
                    <motion.div 
                      className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-2 mb-4"
                        >
                            <span className="text-sm font-display text-primary uppercase tracking-[0.2em] drop-shadow-sm">Quote of the day</span>
                        </motion.div>

                        <div className="relative">
                            <Quote className="absolute -top-8 -left-10 w-10 h-10 text-primary/20 rotate-180" />
                            <motion.p 
                              className="text-2xl md:text-4xl font-display text-white leading-tight tracking-wide drop-shadow-md"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              style={{ fontStyle: 'italic' }} 
                            >
                                Discipline is doing what needs to be done, even if you don&apos;t want to do it.
                            </motion.p>
                            <Quote className="absolute -bottom-8 -right-10 w-10 h-10 text-primary/20" />
                        </div>
                    </div>
                </motion.div>

                {/* Weekly Progress */}
                <div className="shrink-0">
                   <WeeklyProgress habits={habits} />
                </div>

                {/* Active Quests */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface-dark rounded-3xl p-8 flex-1 shadow-sm flex flex-col min-h-[300px]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-white">Active Quests</h3>
                            <motion.span 
                              className="px-2 py-0.5 rounded-full bg-surface-dark-lighter text-xs font-mono font-bold text-gray-500"
                              key={habits.length}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                                {habits.length}
                            </motion.span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                              onClick={() => setIsAddModalOpen(true)}
                              className="flex items-center gap-2 bg-primary hover:bg-primary-glow text-background-dark px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
                          >
                              <motion.div
                                animate={{ rotate: [0, 90, 0] }}
                                transition={{ duration: 0.3 }}
                                className="group-hover:rotate-90"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.div>
                              New Quest
                          </Button>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                      {habits.length === 0 ? (
                          <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-1 border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-primary/30 transition-colors"
                          >
                              <motion.div
                                animate={{ 
                                  y: [0, -10, 0],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Zap className="w-12 h-12 text-surface-border mb-4 group-hover:text-primary/50 transition-colors" />
                              </motion.div>
                              <h4 className="text-gray-400 font-medium mb-1">No Active Quests</h4>
                              <p className="text-sm text-gray-600">Initialize your first protocol to begin.</p>
                          </motion.div>
                      ) : (
                          <motion.div 
                            key="grid"
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                              <AnimatePresence>
                                {habits.map((habit, index) => (
                                    <HabitCard 
                                        key={habit.id} 
                                        habit={habit} 
                                        onToggle={handleToggleHabit} 
                                        onDelete={handleDeleteHabit}
                                        index={index}
                                    />
                                ))}
                              </AnimatePresence>
                          </motion.div>
                      )}
                    </AnimatePresence>
                </motion.div>
            </div>
      </div>

      {/* Bottom Section - Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="shrink-0 max-w-[1400px] w-full mx-auto"
      >
          <Heatmap habits={habits} />
      </motion.div>

      <AddHabitModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddHabit} 
      />
    </div>
  );
}
