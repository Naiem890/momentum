'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, BarChart3 } from 'lucide-react';

type TabType = 'tasks' | 'stats';

interface MobileNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAdd: () => void;
  completedCount: number;
  totalCount: number;
}

export function MobileNavigation({ activeTab, onTabChange, onAdd, completedCount, totalCount }: MobileNavigationProps) {
  const tabs = [
    { id: 'tasks' as TabType, label: 'Tasks', icon: Flame },
    { id: 'stats' as TabType, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Container specific for the dock content to allow clicks */}
      <div className="pointer-events-auto">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10" />
        
        {/* Subtle glow at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="relative flex items-center h-[70px] max-w-lg mx-auto px-6">
            {/* Left Tab: Tasks */}
            <button
              onClick={() => onTabChange('tasks')}
              className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform relative"
            >
                {/* Progress Badge */}
                {totalCount > 0 && (
                    <div className="absolute top-0 right-[25%] -mr-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-dark border border-white/10 px-1">
                        <span className="text-[9px] font-bold text-gray-300">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                )}

                <Flame 
                    className={cn(
                        "w-6 h-6 transition-all",
                        activeTab === 'tasks' ? "text-primary fill-primary/20" : "text-gray-500"
                    )} 
                />
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    activeTab === 'tasks' ? "text-primary" : "text-gray-500"
                )}>Tasks</span>
            </button>

            {/* Center FAB */}
            <div className="relative -top-6">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onAdd}
                    className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border-4 border-background-dark"
                >
                    <div className="w-1.5 h-6 bg-background-dark rounded-full absolute" />
                    <div className="h-1.5 w-6 bg-background-dark rounded-full absolute" />
                </motion.button>
            </div>

            {/* Right Tab: Stats */}
            <button
               onClick={() => onTabChange('stats')}
               className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
                <BarChart3 
                    className={cn(
                        "w-6 h-6 transition-all",
                        activeTab === 'stats' ? "text-primary fill-primary/20" : "text-gray-500"
                    )} 
                />
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    activeTab === 'stats' ? "text-primary" : "text-gray-500"
                )}>Stats</span>
            </button>
        </div>
      </div>
    </nav>
  );
}
