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
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeatmapProps {
  habits: Habit[];
}

type FilterType = 'all' | 'work' | 'health';

export function Heatmap({ habits }: HeatmapProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Generate dates for the selected year
  const getDaysInYear = (year: number) => {
    const dates = [];
    const startDate = new Date(year, 0, 1); // Jan 1st
    const endDate = new Date(year, 11, 31); // Dec 31st
    
    // We need to pad the start to align with the correct day of week (Sunday start)
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Add empty placeholders for days before Jan 1st in the first week
    for (let i = 0; i < startDayOfWeek; i++) {
        dates.push(null);
    }
    
    // Add actual days
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getDaysInYear(selectedYear);

  const getFilteredHabits = () => {
    if (filter === 'all') return habits;
    return habits.filter(h => h.category === filter);
  };

  const activeHabits = getFilteredHabits();

  const getIntensity = (date: Date | null) => {
    if (!date) return -1;
    
    // Fix: Use local time for date string construction to avoid UTC shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Get local today string
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    
    if (dateStr > todayStr) return -1; // Future dates
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
    if (intensity === -1) return 'bg-[#1f1f1f] opacity-50'; // Future dates match blank but dimmer
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
               <h3 className="font-semibold text-lg text-white">Activity Heatmap</h3>
           </div>

           <div className='flex items-center gap-4'>
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
                          {/* Year Navigation */}
               <div className="flex items-center gap-2 bg-surface-dark-lighter rounded-lg p-1 ml-4 border border-surface-border">
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setSelectedYear(y => y - 1)}>
                       <ChevronLeft className="w-4 h-4" />
                   </Button>
                   <span className="text-sm font-mono font-bold text-white min-w-[40px] text-center">{selectedYear}</span>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setSelectedYear(y => y + 1)} disabled={selectedYear >= new Date().getFullYear()}>
                       <ChevronRight className="w-4 h-4" />
                   </Button>
               </div>
           </div>
       </div>
       
       {/* Graph Container */}
       <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[800px] flex gap-2">
                {/* Y Axis Labels */}
                <div className="flex flex-col justify-between py-[2px] pr-2 text-[10px] font-mono text-gray-600 h-[110px]">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                </div>

                {/* The Grid */}
                <div className="flex-1 p-1">
                     <TooltipProvider>
                       <div className="grid grid-rows-7 grid-flow-col gap-1 h-[110px]">
                          {dates.map((date, i) => {
                               // If it's a null placeholder
                               if (!date) return <div key={`empty-${i}`} className="w-3 h-3 bg-transparent" />;
                               
                               const intensity = getIntensity(date);
                               const isToday = date.toDateString() === new Date().toDateString();
                               
                               return (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <div 
                                          className={cn(
                                              "w-3 h-3 rounded-[2px] transition-all hover:ring-1 hover:ring-white/50 cursor-pointer",
                                              getCellColor(intensity),
                                              isToday && "ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.6)] z-10 relative"
                                          )}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-bold">{isToday ? "Today: " : ""}{date.toDateString()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                               );
                          })}
                       </div>
                     </TooltipProvider>
                     
                     {/* Bottom Months Row - Simplified for now since grid alignment handles spacing */}
                     <div className="flex justify-between pl-1 pr-4 mt-2 text-[10px] font-mono text-gray-600 uppercase">
                        {months.map(m => <span key={m}>{m}</span>)}
                     </div>
                </div>
            </div>
       </div>

       {/* Legend (Moved to bottom for better layout) */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
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
  );
}
