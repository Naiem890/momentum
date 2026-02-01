'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getHabits, 
  saveHabits, 
  getUserStats, 
  saveUserStats,
  getDailyQuote,
  saveDailyQuote,
  getCompletedTasks,
  saveCompletedTasks
} from '@/lib/storage';
import { Habit, UserStats, HabitCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchQuote, Quote as QuoteType, MOTIVATIONAL_QUOTES } from '@/lib/quotes';
import { HabitCard } from '@/components/streakquest/habit-card';
import { Heatmap } from '@/components/streakquest/heatmap';
import { Milestones } from '@/components/streakquest/milestones';
import { WeeklyProgress } from '@/components/streakquest/weekly-progress';
import { AddHabitModal } from '@/components/streakquest/add-habit-modal';
import { Celebration, AnimatedCounter, StreakFire } from '@/components/streakquest/animations';
import { useTheme } from '@/components/theme-provider';
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
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Flame,
  Zap,
  Quote,
  Moon,
  Sun,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Trash2,
  Circle,
} from 'lucide-react';

export default function MomentumDashboard() {
  // --- Theme ---
  const { theme, toggleTheme } = useTheme();
  
  // --- Data State ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalHabitsCompleted: 0,
    longestStreak: 0,
    lastLogin: new Date().toISOString().split('T')[0]
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [quote, setQuote] = useState<QuoteType>(MOTIVATIONAL_QUOTES[0]);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Habit[]>([]); // Completed one-time tasks
  const [taskFilter, setTaskFilter] = useState<'all' | 'daily' | 'onetime' | 'completed'>('all');
  const [taskToRestore, setTaskToRestore] = useState<Habit | null>(null); // For restore confirmation

  const loadNewQuote = async (saveToCache: boolean = false) => {
    setIsQuoteLoading(true);
    const newQuote = await fetchQuote();
    setQuote(newQuote);
    if (saveToCache) {
      saveDailyQuote(newQuote);
    }
    setIsQuoteLoading(false);
  };

  // Initialization
  useEffect(() => {
    setMounted(true);
    const loadedHabits = getHabits();
    const loadedStats = getUserStats();
    const loadedCompletedTasks = getCompletedTasks();
    
    // Load quote (check cache first)
    const todayDateStr = new Date().toISOString().split('T')[0];
    const cached = getDailyQuote();
    
    if (cached && cached.date === todayDateStr) {
      setQuote(cached.quote);
      setIsQuoteLoading(false);
    } else {
      loadNewQuote(true); // Fetch and cache for today
    }
    
    // Streak check logic
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const updatedHabits = loadedHabits.map(h => {
      // Backwards compatibility: default isStreakable to true for existing habits
      const isStreakable = h.isStreakable !== false;
      
      // Only reset streak for streakable habits
      if (isStreakable) {
        const lastCompleted = h.completedDates[h.completedDates.length - 1];
        if (lastCompleted && lastCompleted < yesterdayStr) {
          return { ...h, streak: 0, isStreakable };
        }
      }
      return { ...h, isStreakable };
    });

    setHabits(updatedHabits);
    setCompletedTasks(loadedCompletedTasks);
    
    // Recalculate stats based on active streakable habits only
    const streakableHabits = updatedHabits.filter(h => h.isStreakable);
    const realTotalCompletions = streakableHabits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const realLongestStreak = Math.max(0, ...streakableHabits.map(h => h.streak), loadedStats.longestStreak > 100 ? 0 : loadedStats.longestStreak);
    
    const correctedStats = {
      ...loadedStats,
      totalHabitsCompleted: realTotalCompletions,
      longestStreak: realLongestStreak
    };

    setStats(correctedStats);
    setPreviousStreak(Math.max(0, ...streakableHabits.map(h => h.streak)));
    saveHabits(updatedHabits); 
    saveUserStats(correctedStats); 
  }, []);

  // --- Habit Logic ---
  const handleToggleHabit = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prevHabits => {
      const habit = prevHabits.find(h => h.id === id);
      if (!habit) return prevHabits;
      
      // Prevent manual toggle for time-based habits (optional, or allow override)
      if (habit.targetTime && habit.targetTime > 0) {
        // For now, we'll let clicking the checkmark behave as "Complete Now" (set time to target) ??
        // OR better: Clicking checkmark on time-based habit is disabled or opens manual entry.
        // Let's assume for now we keep it binary toggle behavior acts as an override or just disable it.
        // User requested: "minimum timer habits wont be completed with click only"
        return prevHabits; 
      }

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
          
          if (newStreak === 7 || newStreak === 30 || newStreak === 60 || newStreak === 100) {
            setShowCelebration(true);
          }
        }
        return { ...h, streak: newStreak, completedDates: newCompletedDates };
      });
      
      const newMaxStreak = Math.max(0, ...newHabits.map(h => h.streak));
      if (newMaxStreak > previousStreak) {
        setPreviousStreak(newMaxStreak);
      }
      
      saveHabits(newHabits);
      return newHabits;
    });
    
    // Update stats (Binary toggle)
    const today2 = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === id);
    if (habit && (!habit.targetTime || habit.targetTime === 0)) {
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

  const handleUpdateProgress = useCallback((id: string, minutes: number) => {
      const today = new Date().toISOString().split('T')[0];
      setHabits(prevHabits => {
          const newHabits = prevHabits.map(h => {
              if (h.id !== id) return h;
              
              const currentProgress = h.dailyProgress?.[today] || 0;
              const newProgress = Math.min(24 * 60, Math.max(0, minutes)); // Clamp between 0 and 24h
              
              const updatedDailyProgress = { ...h.dailyProgress, [today]: newProgress };
              
              // Check completion status
              const target = h.targetTime || 0;
              const wasCompleted = h.completedDates.includes(today);
              const isNowCompleted = target > 0 && newProgress >= target;
              
              let newCompletedDates = [...h.completedDates];
              let newStreak = h.streak;
              
              if (isNowCompleted && !wasCompleted) {
                  // Just completed
                  newCompletedDates.push(today);
                  newStreak += 1;
                  // Celebration check
                  if (newStreak % 7 === 0 || newStreak === 30 || newStreak === 100) setShowCelebration(true);
              } else if (!isNowCompleted && wasCompleted) {
                  // Just un-completed (reduced time below target)
                  newCompletedDates = newCompletedDates.filter(d => d !== today);
                  newStreak = Math.max(0, h.streak - 1); 
              }
              
              return { 
                  ...h, 
                  dailyProgress: updatedDailyProgress,
                  completedDates: newCompletedDates,
                  streak: newStreak
              };
          });

          saveHabits(newHabits);
          return newHabits;
      });
  }, []);

  const handleSaveHabit = (title: string, category: HabitCategory, isStreakable: boolean, targetTime?: number) => {
    if (editingHabit) {
      // Update existing
      setHabits(prev => {
        const newHabits = prev.map(h => 
          h.id === editingHabit.id 
            ? { ...h, title, category, isStreakable, targetTime: targetTime || 0 } 
            : h
        );
        saveHabits(newHabits);
        return newHabits;
      });
      setEditingHabit(null);
    } else {
      // Create new
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        title,
        category,
        streak: 0,
        completedDates: [],
        createdAt: Date.now(),
        targetTime: targetTime || 0,
        dailyProgress: {},
        isStreakable
      };
      const newHabits = [...habits, newHabit];
      setHabits(newHabits);
      saveHabits(newHabits);
    }
  };

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleDeleteHabit = (id: string) => {
    // Confirmation handled in UI component
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    saveHabits(newHabits);
  };

  // Handle completing an additional (non-streakable) task - moves to completed list
  const handleCompleteAdditionalTask = useCallback((id: string) => {
    const task = habits.find(h => h.id === id);
    if (!task || task.isStreakable) return;
    
    // Remove from active habits
    const newHabits = habits.filter(h => h.id !== id);
    setHabits(newHabits);
    saveHabits(newHabits);
    
    // Add to completed tasks with completion date
    const completedTask = { ...task, completedAt: new Date().toISOString() };
    const newCompletedTasks = [completedTask, ...completedTasks];
    setCompletedTasks(newCompletedTasks);
    saveCompletedTasks(newCompletedTasks);
  }, [habits, completedTasks]);

  // Handle restoring a completed additional task back to active list
  const handleRestoreTask = useCallback((id: string) => {
    const task = completedTasks.find(t => t.id === id);
    if (!task) return;
    
    // Remove from completed tasks
    const newCompletedTasks = completedTasks.filter(t => t.id !== id);
    setCompletedTasks(newCompletedTasks);
    saveCompletedTasks(newCompletedTasks);
    
    // Add back to active habits (remove completedAt)
    const { completedAt, ...activeTask } = task;
    const newHabits = [...habits, activeTask];
    setHabits(newHabits);
    saveHabits(newHabits);
  }, [habits, completedTasks]);

  // Handle deleting a completed task permanently
  const handleDeleteCompletedTask = useCallback((id: string) => {
    const newCompletedTasks = completedTasks.filter(t => t.id !== id);
    setCompletedTasks(newCompletedTasks);
    saveCompletedTasks(newCompletedTasks);
  }, [completedTasks]);

  // Filter habits by type
  const streakableTasks = habits.filter(h => h.isStreakable);
  const additionalTasks = habits.filter(h => !h.isStreakable);

  // Current streak is based on streakable habits only
  const currentStreak = streakableTasks.length > 0 ? Math.max(...streakableTasks.map(h => h.streak)) : 0;
  // const currentStreak = 365; // MOCK FOR DEMO

  if (!mounted) {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <motion.div 
          className="text-primary"
          animate={{ 
            opacity: [0.5, 1, 0.5]
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] w-full mx-auto flex justify-between items-center mb-6 font-mono text-sm tracking-wider shrink-0"
      >
        <motion.div 
          className="text-gray-400 font-semibold flex items-center gap-2"
          whileHover={{ color: "white" }}
        >
           <motion.div
             animate={{ rotate: [0, 5, -5, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Flame className="w-5 h-5 text-primary" />
           </motion.div>
           Momentum
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative bg-surface-dark rounded-3xl p-8 flex flex-col justify-between h-[280px] shadow-sm overflow-hidden group shrink-0"
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
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
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            🔥
                          </motion.div>
                          Day Streak
                        </motion.span>
                    </div>
                </motion.div>

                {/* Weekly Progress - Compact Mode */}
                <div className="shrink-0">
                   <WeeklyProgress habits={habits} compact />
                </div>

                {/* Milestones - Fills remaining height */}
                <motion.div 
                  className="flex-1 min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                   <Milestones stats={stats} habits={habits} currentStreak={currentStreak} />
                </motion.div>
            </div>

            {/* Right Column (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative overflow-hidden rounded-3xl p-8 flex items-center justify-center shadow-lg min-h-[180px] shrink-0 group m-1"
                >
                    {/* Background Gradient & Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-surface-dark to-surface-dark border border-primary/20 transition-all duration-500 group-hover:border-primary/40" />
                    
                    <motion.div 
                      className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto w-full">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-between w-full mb-4 px-4"
                        >
                            <div className="w-8" /> {/* Spacer */}
                            <span className="text-sm font-display text-primary uppercase tracking-[0.2em] drop-shadow-sm">Quote of the day</span>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => loadNewQuote(true)}
                              disabled={isQuoteLoading}
                              className="text-primary/50 hover:text-primary hover:bg-primary/10 transition-colors w-8 h-8 rounded-full"
                            >
                                <motion.div
                                  animate={isQuoteLoading ? { rotate: 360 } : { rotate: 0 }}
                                  transition={isQuoteLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </motion.div>
                            </Button>
                        </motion.div>

                        <div className="relative px-8">
                            <Quote className="absolute -top-6 -left-2 w-8 h-8 text-primary/20 rotate-180" />
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={quote.text}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <p 
                                  className="text-2xl md:text-3xl font-display text-white leading-tight tracking-wide drop-shadow-md"
                                  style={{ fontStyle: 'italic' }} 
                                >
                                  {quote.text}
                                </p>
                                <span className="text-gray-400 font-mono text-sm tracking-wider opacity-80">— {quote.author}</span>
                              </motion.div>
                            </AnimatePresence>
                            <Quote className="absolute -bottom-6 -right-2 w-8 h-8 text-primary/20" />
                        </div>
                    </div>
                </motion.div>



                {/* Active Protocols */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface-dark rounded-3xl p-8 flex-1 shadow-sm flex flex-col min-h-0 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-white">Active Protocols</h3>
                            <motion.span 
                              className="px-2 py-0.5 rounded-full bg-surface-dark-lighter text-xs font-mono font-bold text-gray-500"
                              key={habits.length}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                                {habits.length}
                            </motion.span>
                        </div>
                        <motion.div>
                          <Button 
                              onClick={() => {
                                setEditingHabit(null);
                                setIsAddModalOpen(true);
                              }}
                              className="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
                          >
                              <motion.div
                                animate={{ rotate: [0, 90, 0] }}
                                transition={{ duration: 0.3 }}
                                className="group-hover:rotate-90"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.div>
                              New Protocol
                          </Button>
                        </motion.div>
                    </div>

                    {/* Filter Button Group */}
                    <div className="flex gap-1 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border mb-4">
                        <button
                            onClick={() => setTaskFilter('all')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                taskFilter === 'all' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            All
                            <span className="text-[10px] opacity-60">({habits.length})</span>
                        </button>
                        <button
                            onClick={() => setTaskFilter('daily')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                taskFilter === 'daily' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <Flame className="w-3 h-3 text-primary" />
                            Daily
                            <span className="text-[10px] opacity-60">({streakableTasks.length})</span>
                        </button>
                        <button
                            onClick={() => setTaskFilter('onetime')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                taskFilter === 'onetime' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <Circle className="w-3 h-3 text-blue-400" />
                            One Time
                            <span className="text-[10px] opacity-60">({additionalTasks.length})</span>
                        </button>
                        <button
                            onClick={() => setTaskFilter('completed')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                                taskFilter === 'completed' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                            Completed
                            <span className="text-[10px] opacity-60">({completedTasks.length})</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        <AnimatePresence mode="wait">
                      {(() => {
                        // Handle completed filter separately
                        if (taskFilter === 'completed') {
                          return completedTasks.length === 0 ? (
                            <motion.div 
                              key="empty-completed"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex-1 border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-primary/30 transition-colors"
                            >
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <CheckCircle2 className="w-12 h-12 text-surface-border mb-4 group-hover:text-green-500/50 transition-colors" />
                                </motion.div>
                                <h4 className="text-gray-400 font-medium mb-1">No Completed Tasks</h4>
                                <p className="text-sm text-gray-600">Complete One Time tasks to see them here.</p>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="list-completed"
                              className="flex flex-col gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <AnimatePresence mode="popLayout">
                                {completedTasks.map((task) => (
                                  <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setTaskToRestore(task)}
                                    className="flex items-center justify-between p-3 bg-surface-dark-lighter/50 rounded-xl border border-surface-border group cursor-pointer hover:bg-surface-dark-lighter transition-all"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center transition-colors">
                                        <CheckCircle2 className="w-4 h-4 text-green-400 transition-colors" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm text-gray-400 line-through truncate group-hover:text-gray-300 transition-colors">{task.title}</p>
                                        <p className="text-[10px] text-gray-600 font-mono">
                                          Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setTaskToRestore(task)}
                                        className="h-8 w-8 text-gray-500 rounded-lg"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCompletedTask(task.id)}
                                        className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </motion.div>
                          );
                        }

                        const filteredTasks = taskFilter === 'all' 
                          ? habits 
                          : taskFilter === 'daily' 
                            ? streakableTasks 
                            : additionalTasks;
                        
                        return filteredTasks.length === 0 ? (
                          <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-primary/30 transition-colors"
                          >
                              <motion.div
                                animate={{ 
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Zap className="w-12 h-12 text-surface-border mb-4 group-hover:text-primary/50 transition-colors" />
                              </motion.div>
                              <h4 className="text-gray-400 font-medium mb-1">
                                {taskFilter === 'all' ? 'No Active Protocols' : taskFilter === 'daily' ? 'No Daily Tasks' : 'No One Time Tasks'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {taskFilter === 'daily' ? 'Add daily tasks that build your streak.' : 'Add tasks to get started.'}
                              </p>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key={`list-${taskFilter}`}
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                              <AnimatePresence mode="popLayout">
                                {filteredTasks.map((habit, index) => (
                                    <HabitCard 
                                        key={habit.id} 
                                        habit={habit} 
                                        onToggle={habit.isStreakable ? handleToggleHabit : handleCompleteAdditionalTask} 
                                        onDelete={handleDeleteHabit}
                                        onEdit={handleEditClick}
                                        onProgress={handleUpdateProgress}
                                        index={index}
                                    />
                                ))}
                              </AnimatePresence>
                          </motion.div>
                        );
                      })()}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
      </div>

      {/* Bottom Section - Heatmap */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="shrink-0 max-w-[1400px] w-full mx-auto"
      >
          <Heatmap habits={habits} />
      </motion.div>

      <AddHabitModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }} 
        onSave={handleSaveHabit}
        initialData={editingHabit}
      />

      {/* Restore Task Confirmation Dialog */}
      <AlertDialog open={taskToRestore !== null} onOpenChange={(open) => !open && setTaskToRestore(null)}>
        <AlertDialogContent className="bg-surface-dark border-surface-border rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Restore Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will move <span className="text-white font-medium">"{taskToRestore?.title}"</span> back to your One Time tasks list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-surface-dark-lighter border-surface-border text-gray-400 hover:text-white hover:bg-surface-dark-lighter/80"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (taskToRestore) {
                  handleRestoreTask(taskToRestore.id);
                  setTaskToRestore(null);
                }
              }}
              className="font-bold"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
