'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyQuote, saveDailyQuote } from '@/lib/storage';
import { Habit, UserStats, HabitCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchQuote, Quote as QuoteType, MOTIVATIONAL_QUOTES } from '@/lib/quotes';
import { HabitCard } from '@/components/streakquest/habit-card';
import { StreakCard } from '@/components/streakquest/streak-card';
import { Heatmap } from '@/components/streakquest/heatmap';
import { Milestones } from '@/components/streakquest/milestones';
import { WeeklyProgress } from '@/components/streakquest/weekly-progress';
import { AddHabitModal } from '@/components/streakquest/add-habit-modal';
import { Celebration, AnimatedCounter } from '@/components/streakquest/animations';
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

// Mobile components
import { useIsMobile } from '@/hooks/use-mobile';
import { useHabits } from '@/hooks/use-habits';
import { useStats } from '@/hooks/use-stats';
import { MobileNavigation } from '@/components/streakquest/mobile-navigation';
import { MobileTaskList } from '@/components/streakquest/mobile-task-list';
import { MobileStatsView } from '@/components/streakquest/mobile-stats-view';
import { MobileAddTaskDrawer } from '@/components/streakquest/mobile-add-task-drawer';
import { AuthButton, LoginScreen } from '@/components/auth';


export default function MomentumDashboard() {
  // --- Auth ---
  const { data: session, status } = useSession();
  
  // --- Theme ---
  const { theme, toggleTheme } = useTheme();
  
  // --- Data from API ---
  const {
    habits,
    completedTasks,
    isLoading: habitsLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    updateProgress,
    completeAdditionalTask,
    restoreTask,
    deleteCompletedTask,
  } = useHabits();
  
  const { stats, isLoading: statsLoading } = useStats();

  // --- UI State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quote, setQuote] = useState<QuoteType>(MOTIVATIONAL_QUOTES[0]);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'daily' | 'onetime' | 'completed'>('all');
  const [taskToRestore, setTaskToRestore] = useState<Habit | null>(null);
  const [mobileTab, setMobileTab] = useState<'tasks' | 'stats'>('tasks');
  
  // Mobile detection
  const isMobile = useIsMobile();

  const loadNewQuote = async (saveToCache: boolean = false) => {
    setIsQuoteLoading(true);
    const newQuote = await fetchQuote();
    setQuote(newQuote);
    if (saveToCache) {
      saveDailyQuote(newQuote);
    }
    setIsQuoteLoading(false);
  };

  // Load quote on mount
  useEffect(() => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const cached = getDailyQuote();
    
    if (cached && cached.date === todayDateStr) {
      setQuote(cached.quote);
    } else {
      loadNewQuote(true);
    }
  }, []);

  // --- Handlers that wrap hook functions ---
  const handleToggleHabit = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    const wasCompleted = habit.completedDates.includes(today);
    const newStreak = wasCompleted ? habit.streak : habit.streak + 1;
    
    // Celebration check
    if (!wasCompleted && (newStreak === 7 || newStreak === 30 || newStreak === 60 || newStreak === 100)) {
      setShowCelebration(true);
    }
    
    await toggleHabit(id);
  }, [habits, toggleHabit]);

  const handleUpdateProgress = useCallback(async (id: string, minutes: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    const target = habit.targetTime || 0;
    const wasCompleted = habit.completedDates.includes(today);
    const isNowCompleted = target > 0 && minutes >= target;
    
    // Celebration check
    if (isNowCompleted && !wasCompleted) {
      const newStreak = habit.streak + 1;
      if (newStreak % 7 === 0 || newStreak === 30 || newStreak === 100) {
        setShowCelebration(true);
      }
    }
    
    await updateProgress(id, minutes);
  }, [habits, updateProgress]);

  const handleSaveHabit = async (title: string, category: HabitCategory, isStreakable: boolean, targetTime?: number) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, { title, category, isStreakable, targetTime: targetTime || 0 });
      setEditingHabit(null);
    } else {
      await createHabit(title, category, isStreakable, targetTime);
    }
    setIsAddModalOpen(false);
  };

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleDeleteHabit = async (id: string) => {
    await deleteHabit(id);
  };

  const handleCompleteAdditionalTask = useCallback(async (id: string) => {
    await completeAdditionalTask(id);
  }, [completeAdditionalTask]);

  const handleRestoreTask = useCallback(async (id: string) => {
    await restoreTask(id);
  }, [restoreTask]);

  const handleDeleteCompletedTask = useCallback(async (id: string) => {
    await deleteCompletedTask(id);
  }, [deleteCompletedTask]);

  // Filter habits by type
  const streakableTasks = habits.filter(h => h.isStreakable);
  const additionalTasks = habits.filter(h => !h.isStreakable);

  // Current streak is based on streakable habits only
  const currentStreak = streakableTasks.length > 0 ? Math.max(...streakableTasks.map(h => h.streak)) : 0;
  // const currentStreak = 100; // MOCK FOR DEMO

  // --- Auth Loading State ---
  if (status === 'loading') {
    return (
      <div className="h-screen bg-background-dark flex items-center justify-center">
        <motion.div 
          className="text-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  // --- Not Authenticated ---
  if (!session) {
    return <LoginScreen />;
  }

  // Show loading while fetching data from API
  if (habitsLoading || statsLoading) {
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

  // ============================================
  // MOBILE LAYOUT
  // ============================================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background-dark text-gray-300 flex flex-col">
        {/* Celebration */}
        <Celebration trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
        
        {/* Mobile Header - Simple, matching desktop */}
        {mobileTab === 'tasks' && (
          <div 
            className="px-4 pt-4 pb-3"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-sm tracking-wider">
                <Flame className="w-5 h-5 text-primary" />
                <span className="text-gray-400 font-semibold">Momentum</span>
              </div>
              <AuthButton />
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {mobileTab === 'tasks' ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <MobileTaskList
                  habits={habits}
                  completedTasks={completedTasks}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                  onEdit={handleEditClick}
                  onProgress={handleUpdateProgress}
                  onCompleteAdditional={handleCompleteAdditionalTask}
                  onRestoreTask={handleRestoreTask}
                  onDeleteCompletedTask={handleDeleteCompletedTask}
                  onAddNew={() => {
                    setEditingHabit(null);
                    setIsAddModalOpen(true);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto"
              >
                <MobileStatsView
                  habits={habits}
                  stats={stats}
                  currentStreak={currentStreak}
                  quote={quote}
                  isQuoteLoading={isQuoteLoading}
                  onRefreshQuote={() => loadNewQuote(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavigation 
          activeTab={mobileTab}
          onTabChange={setMobileTab}
        />

        {/* Add/Edit Drawer - Mobile Native */}
        <MobileAddTaskDrawer 
          isOpen={isAddModalOpen} 
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHabit(null);
          }} 
          onSave={handleSaveHabit}
          initialData={editingHabit}
        />
      </div>
    );
  }
  
  // ============================================
  // DESKTOP LAYOUT
  // ============================================
  return (
    <div className="min-h-screen bg-background-dark text-gray-300 p-4 md:p-6 transition-colors duration-300">
      
      {/* Celebration Confetti */}
      <Celebration trigger={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] w-full mx-auto flex justify-between items-center mb-6 font-mono text-sm tracking-wider"
      >
        <motion.div 
          className="text-gray-400 font-semibold flex items-center gap-2"
          whileHover={{ color: "white" }}
        >
           <Flame className="w-5 h-5 text-primary" />
           Momentum
        </motion.div>
        <AuthButton />
      </motion.nav>

      {/* Quote of the Day - Full Width Top Row */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl p-4 flex items-center justify-center shadow-lg group max-w-[1400px] w-full mx-auto mb-6"
      >
          {/* Background Gradient & Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-surface-dark to-surface-dark border border-primary/20 transition-all duration-500 group-hover:border-primary/40 rounded-3xl" />
          
          <motion.div 
            className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center text-center mx-auto w-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between w-full mb-4 px-4"
              >
                  {/* <div className="w-8" /> 
                  <span className="text-sm font-display text-primary uppercase tracking-[0.2em] drop-shadow-sm">Quote of the day</span> */}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => loadNewQuote(true)}
                    disabled={isQuoteLoading}
                    className="text-primary/50 hover:text-primary hover:bg-primary/10 transition-colors w-8 h-8 rounded-full absolute top-0 right-0"
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
                  <Quote className="absolute -top-2 left-0 w-6 h-6 text-primary/30 rotate-180" />
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
                        className="text-xl md:text-2xl text-white leading-relaxed tracking-wide drop-shadow-md italic font-medium"
                        style={{ fontFamily: 'var(--font-quote), serif' }} 
                      >
                        {quote.text}
                      </p>
                      <span className="text-gray-400 font-mono text-sm tracking-wider opacity-80">— {quote.author}</span>
                    </motion.div>
                  </AnimatePresence>
                  <Quote className="absolute bottom-4 right-0 w-6 h-6 text-primary/30" />
              </div>
          </div>
      </motion.div>

      {/* Main Grid */}
      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            
            {/* Left Column (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Streak Widget */}
                <StreakCard streak={currentStreak} />

                {/* Weekly Progress - Compact Mode */}
                <div className="shrink-0">
                   <WeeklyProgress habits={habits} compact />
                </div>

                {/* Milestones - Fills available space but allows partial content */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                   <Milestones stats={stats} habits={habits} currentStreak={currentStreak} />
                </motion.div>
            </div>

            {/* Right Column (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Active Tasks */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface-dark rounded-3xl p-6 shadow-xl border border-white/5 flex flex-col h-full"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              Active Tasks
                            </h3>
                            <motion.span 
                              className="px-2 py-0.5 rounded-full bg-surface-dark-lighter text-xs font-mono font-bold text-gray-500 border border-white/5"
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
                              New Task
                          </Button>
                        </motion.div>
                    </div>

                    {/* Filter Button Group */}
                    <div className="flex bg-surface-dark-lighter rounded-xl border border-surface-border mb-4 overflow-x-auto no-scrollbar p-1 gap-1">
                        <button
                            onClick={() => setTaskFilter('all')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap min-w-fit",
                                taskFilter === 'all' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            All
                            <span className="text-[10px] opacity-60">({habits.length})</span>
                        </button>
                        <button
                            onClick={() => setTaskFilter('daily')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap min-w-fit",
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
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap min-w-fit",
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
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap min-w-fit",
                                taskFilter === 'completed' ? "bg-[#2A2A2A] text-white shadow-sm" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                            Completed
                            <span className="text-[10px] opacity-60">({completedTasks.length})</span>
                        </button>
                    </div>

                    <div className="pr-2 -mr-2">
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
                              className="border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-primary/30 transition-colors"
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
                            className="border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center p-12 group hover:border-primary/30 transition-colors"
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
                                {taskFilter === 'all' ? 'No Active Tasks' : taskFilter === 'daily' ? 'No Daily Tasks' : 'No One Time Tasks'}
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
