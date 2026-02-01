'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapProps {
  habits: Habit[];
}

type FilterType = 'all' | 'work' | 'health';

export function Heatmap({ habits }: HeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Configuration
  const weeksToShow = 52;
  const totalDays = weeksToShow * 7; 
  
  const today = new Date();
  const currentDayOfWeek = today.getDay(); 
  const daysUntilEndOfWeek = 6 - currentDayOfWeek;
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilEndOfWeek); 
  
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  const dates = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const getFilteredHabits = () => {
    if (filter === 'all') return habits;
    return habits.filter(h => h.category === filter);
  };

  const activeHabits = getFilteredHabits();

  const getIntensity = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (dateStr > todayStr) return -1;
    if (activeHabits.length === 0) return 0;
    
    const completions = activeHabits.filter(h => h.completedDates.includes(dateStr)).length;
    const total = activeHabits.length;
    
    if (total === 0) return 0;
    const percentage = completions / total;
    
    if (percentage === 0) return 0;
    if (percentage < 0.4) return 1;
    if (percentage < 0.7) return 2;
    if (percentage < 1.0) return 3;
    return 4;
  };

  const getCellColor = (intensity: number) => {
    if (intensity === -1) return 'bg-transparent';
    switch (intensity) {
      case 0: return 'bg-[#1f1f1f]';
      case 1: return 'bg-primary/30';
      case 2: return 'bg-primary/60';
      case 3: return 'bg-primary';
      case 4: return 'bg-primary shadow-[0_0_8px_#10b981]';
      default: return 'bg-[#1f1f1f]';
    }
  };

  const months: string[] = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'work' as const, label: 'Work' },
    { id: 'health' as const, label: 'Health' },
  ];
  
  return (
    <div className="bg-surface-dark rounded-3xl p-8 shadow-sm">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div className="flex items-center gap-4">
               <div className="w-1 h-4 bg-primary rounded-full"></div>
               <h3 className="font-semibold text-lg text-white">Annual Consistency Map</h3>
               
               {/* Legend */}
               <div className="flex items-center gap-2 ml-4 text-xs text-gray-400">
                   <span>Less</span>
                   <div className="flex gap-1">
                       <div className="w-3 h-3 rounded-sm bg-[#1f1f1f]"></div>
                       <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                       <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                       <div className="w-3 h-3 rounded-sm bg-primary"></div>
                   </div>
                   <span>More</span>
               </div>
           </div>

           {/* Filters */}
           <div className="flex bg-surface-dark-lighter p-1 rounded-xl">
               {filters.map((f) => (
                   <Button
                       key={f.id}
                       variant="ghost"
                       size="sm"
                       onClick={() => setFilter(f.id)}
                       className={cn(
                           "px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                           filter === f.id 
                               ? "bg-primary text-white shadow-sm hover:bg-primary" 
                               : "text-gray-400 hover:text-white hover:bg-transparent"
                       )}
                   >
                       {f.label}
                   </Button>
               ))}
           </div>
       </div>
       
       {/* Graph Container */}
       <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[800px] flex gap-2">
                {/* Y Axis Labels */}
                <div className="flex flex-col justify-between py-[2px] pr-2 text-[10px] font-mono text-gray-600 h-[110px]">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>

                {/* The Grid */}
                <div ref={scrollRef} className="flex-1">
                     <TooltipProvider>
                       <div className="grid grid-rows-7 grid-flow-col gap-[3px] h-[110px]">
                          {dates.map((date, i) => {
                               const intensity = getIntensity(date);
                               return (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <div 
                                          className={cn(
                                              "w-3 h-3 rounded-[2px] transition-all hover:ring-1 hover:ring-white/50 cursor-pointer",
                                              getCellColor(intensity)
                                          )}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{date.toDateString()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                               );
                          })}
                       </div>
                     </TooltipProvider>
                     
                     {/* Bottom Months Row */}
                     <div className="flex justify-between pl-1 pr-4 mt-2 text-[10px] font-mono text-gray-600 uppercase">
                        {months.map(m => <span key={m}>{m}</span>)}
                     </div>
                </div>
            </div>
       </div>
    </div>
  );
}
