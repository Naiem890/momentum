import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './animations';
import { WaterFillStreak } from './water-fill-streak';

interface StreakCardProps {
  streak: number;
  className?: string;
  dailyGoal?: number;
  completedDaily?: number;
}

export function StreakCard({ streak, className, dailyGoal = 0, completedDaily = 0 }: StreakCardProps) {
  // Calculate progress for the water fill
  // Prevent division by zero
  const progress = dailyGoal > 0 ? Math.min(Math.max(completedDaily / dailyGoal, 0), 1) : 0;
  
  // Check if we should show the water fill animation
  // Show if there is a goal, and we have some progress but haven't finished yet
  // OR if we start at 0, we show 0 fill.
  // We switch back to white ONLY when progress is 1 (100%).
  const showWaterFill = dailyGoal > 0 && progress < 1;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "relative bg-surface-dark rounded-3xl p-6 flex flex-col justify-between h-[240px] shadow-xl overflow-hidden group shrink-0 border border-white/5",
        className
      )}
    >
        {/* Background Effects - Subtle and Premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-transparent to-[#0a0a0a]" />
        
        {/* Animated Mesh Gradient - Very subtle background movement */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15), transparent 60%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Top Accent Line */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3], width: ["80%", "100%", "80%"], left: ["10%", "0%", "10%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Top Section: Label */}
        <div className="relative z-10 flex justify-between items-start">
             <div className="flex flex-col">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-gray-500 uppercase">Current Streak</span>
                </motion.div>
            </div>
            
            <motion.span 
              className="font-mono text-xl font-black text-white/5 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              #01
            </motion.span>
        </div>

        {/* Center Section: Big Number */}
        <div className="relative z-10 flex-1 flex items-center justify-center -mt-2 w-full">
            {showWaterFill ? (
               <div className="w-full max-w-[200px] h-[120px] flex items-center justify-center">
                  <WaterFillStreak value={streak} progress={progress} className="w-full h-full" />
               </div>
            ) : (
              <motion.h1 
                className="text-[6rem] leading-none font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                // Key forces re-animation when switching from water fill back to static
                key="static-text"
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                  <AnimatedCounter value={streak} />
              </motion.h1>
            )}
        </div>

        {/* Bottom Section: Status Text */}
        <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="h-px w-6 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-gray-400 font-mono text-[10px] tracking-wider uppercase">
                  {dailyGoal > 0 && progress < 1 
                    ? `${completedDaily}/${dailyGoal} Daily Goals`
                    : "Keep the momentum"}
              </span>
            </motion.div>
        </div>
    </motion.div>
  );
}
