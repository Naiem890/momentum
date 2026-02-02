'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Flame, 
  Repeat, 
  Circle, 
  Timer, 
  CheckCircle, 
  Zap, 
  Award, 
  Medal, 
  Crown, 
  Star,
  Play,
  Pause,
  RotateCcw,
  Target,
  CalendarDays,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'tasks' | 'sections';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Getting Started', icon: Sparkles },
  { id: 'tasks', label: 'Task Types', icon: CheckCircle },
  { id: 'sections', label: 'Dashboard', icon: BarChart3 },
];

export function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-dark border-surface-border sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              User Guide
            </DialogTitle>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-surface-dark-lighter rounded-xl border border-surface-border mt-4 mb-4 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activeTab === tab.id 
                      ? "bg-[#2A2A2A] text-white shadow-sm" 
                      : "text-gray-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Welcome */}
                  <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-white mb-2">Welcome to Momentum!</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Build better habits and track your progress with streaks. Complete daily tasks consistently 
                      to build momentum and unlock achievements.
                    </p>
                  </div>

                  {/* Quick Start */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Quick Start</h4>
                    <div className="space-y-2">
                      {[
                        { step: 1, text: 'Click "+ New Task" to create your first habit', icon: Sparkles },
                        { step: 2, text: 'Choose Daily for streak-building or One-Time for single tasks', icon: Repeat },
                        { step: 3, text: 'Complete tasks each day to build your streak', icon: Flame },
                        { step: 4, text: 'Watch your progress grow on the heatmap!', icon: Target },
                      ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3 p-3 bg-surface-dark-lighter rounded-xl border border-surface-border">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {item.step}
                          </div>
                          <p className="text-sm text-gray-300 flex-1">{item.text}</p>
                          <item.icon className="w-4 h-4 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Concepts */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Key Concepts</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <Flame className="w-6 h-6 text-orange-400 mb-2" />
                        <h5 className="font-bold text-white text-sm mb-1">Streaks</h5>
                        <p className="text-xs text-gray-500">Consecutive days completing all daily tasks</p>
                      </div>
                      <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <Target className="w-6 h-6 text-primary mb-2" />
                        <h5 className="font-bold text-white text-sm mb-1">Daily Goal</h5>
                        <p className="text-xs text-gray-500">Complete all tasks each day to maintain streak</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Task Types */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Task Types</h4>
                    
                    {/* Daily Task */}
                    <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                          <Repeat className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="font-bold text-white">Daily Task</h5>
                      </div>
                      <p className="text-sm text-gray-400">
                        Repeats every day and builds your streak. Miss a day and the streak resets!
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-surface-dark rounded-lg p-2">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span>Example: "30 min meditation", "Drink 8 glasses of water"</span>
                      </div>
                    </div>

                    {/* One-Time Task */}
                    <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                          <Circle className="w-3.5 h-3.5" />
                        </div>
                        <h5 className="font-bold text-white">One-Time Task</h5>
                      </div>
                      <p className="text-sm text-gray-400">
                        Complete once and it moves to the Completed list. Does not affect streaks.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-surface-dark rounded-lg p-2">
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        <span>Example: "Clean closet", "Schedule dentist appointment"</span>
                      </div>
                    </div>
                  </div>

                  {/* Goal Types */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Goal Types (Daily Only)</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Check-off */}
                      <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <h5 className="font-bold text-white text-sm">Check-off</h5>
                        </div>
                        <p className="text-xs text-gray-500">Click once to mark complete for the day</p>
                      </div>

                      {/* Time-based */}
                      <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-5 h-5 text-amber-400" />
                          <h5 className="font-bold text-white text-sm">Time-based</h5>
                        </div>
                        <p className="text-xs text-gray-500">Track duration with a timer. Auto-completes at target.</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Task Badges</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 p-3 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
                          <Flame className="w-3 h-3 fill-orange-400/20" />
                          <span>7</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-white text-sm">Streak Badge</h5>
                          <p className="text-xs text-gray-500">Shows consecutive days completed</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-surface-dark-lighter rounded-xl border border-surface-border">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Play className="w-4 h-4" />
                          <Pause className="w-4 h-4" />
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-medium text-white text-sm">Timer Controls</h5>
                          <p className="text-xs text-gray-500">Play/Pause timer, Reset progress, +10m quick add</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sections' && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h4 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-wider">Dashboard Sections</h4>

                  {/* Streak Card */}
                  <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <h5 className="font-bold text-white">Streak Card</h5>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Shows your current streak count. The number fills up with color as you complete daily tasks. 
                      Once all tasks are done, it displays the new streak number.
                    </p>
                    <div className="text-xs text-gray-500 bg-surface-dark p-2 rounded-lg">
                      💡 Tip: The water-fill animation shows your daily progress toward maintaining the streak.
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      <h5 className="font-bold text-white">Weekly Progress</h5>
                    </div>
                    <p className="text-sm text-gray-400">
                      Visual calendar for the current week (Monday-Sunday). Each day shows your completion status 
                      with a fill indicator.
                    </p>
                  </div>

                  {/* Milestones */}
                  <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h5 className="font-bold text-white">Milestones & Badges</h5>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Unlock achievements as you build your streak!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: Zap, label: '7 Days', color: 'text-yellow-400' },
                        { icon: Flame, label: '30 Days', color: 'text-orange-400' },
                        { icon: Award, label: '60 Days', color: 'text-blue-400' },
                        { icon: Medal, label: '100 Days', color: 'text-purple-400' },
                        { icon: Crown, label: '365 Days', color: 'text-amber-400' },
                        { icon: Star, label: '100 Tasks', color: 'text-pink-400' },
                      ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-1.5 text-xs bg-surface-dark px-2 py-1 rounded-lg border border-surface-border">
                          <badge.icon className={cn("w-3 h-3", badge.color)} />
                          <span className="text-gray-400">{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h5 className="font-bold text-white">Activity Heatmap</h5>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Year-long visualization of your activity (like GitHub contribution graph). 
                      Darker green = more tasks completed that day.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-sm bg-surface-dark border border-surface-border" />
                        <div className="w-3 h-3 rounded-sm bg-primary/20" />
                        <div className="w-3 h-3 rounded-sm bg-primary/40" />
                        <div className="w-3 h-3 rounded-sm bg-primary/70" />
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                      </div>
                      <span>More</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="p-4 bg-surface-dark-lighter rounded-xl border border-surface-border">
                    <h5 className="font-bold text-white mb-3">Task Categories</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-gray-400">Health</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-gray-400">Work</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-gray-400">Study</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-gray-400">Other</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
