'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, BarChart3 } from 'lucide-react';

type TabType = 'tasks' | 'stats';

interface MobileNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    { id: 'tasks' as TabType, label: 'Tasks', icon: Flame },
    { id: 'stats' as TabType, label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10" />
      
      {/* Subtle glow at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="relative flex items-stretch h-20 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer relative",
                "active:scale-95"
              )}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="navPill"
                  className="absolute inset-x-4 top-2 bottom-2 bg-primary/15 rounded-2xl border border-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div
                className="relative z-10 flex flex-col items-center gap-1"
                animate={{ 
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.05 : 1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Icon with glow effect when active */}
                <div className="relative">
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-lg scale-150" />
                  )}
                  <Icon 
                    className={cn(
                      "w-7 h-7 transition-all duration-300 relative z-10",
                      isActive 
                        ? "text-primary drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                        : "text-gray-500"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={isActive && tab.id === 'tasks' ? 'rgba(52,211,153,0.2)' : 'none'}
                  />
                </div>
                
                <span 
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider transition-all duration-300",
                    isActive ? "text-primary" : "text-gray-500"
                  )}
                >
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
