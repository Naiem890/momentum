'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

const colors = ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b', '#ec4899'];

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const pieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        rotation: Math.random() * 360,
      }));
      setConfetti(pieces);
      
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ 
                x: `${piece.x}vw`, 
                y: -20,
                rotate: 0,
                scale: 1 
              }}
              animate={{ 
                y: '110vh',
                rotate: piece.rotation + 720,
                scale: [1, 1.2, 0.8, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2 + Math.random(),
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Streak Fire Animation
export function StreakFire({ streak }: { streak: number }) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 1 }}
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 bg-primary/20 rounded-full blur-xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main fire icon container */}
      <motion.div
        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.svg
          className="w-6 h-6 text-primary"
          fill="currentColor"
          viewBox="0 0 24 24"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-5.06 3.5-7.6.74-.81 1.56-1.57 2.42-2.28.43-.35 1.06-.11 1.16.44.24 1.28.76 2.44 1.75 3.22.56.44 1.15.77 1.77 1.02l.22.09c.35.15.74-.01.89-.35.16-.37.31-.75.44-1.15.23-.7.38-1.43.44-2.18.04-.44.43-.81.88-.77 2.35.2 4.41 1.07 5.96 2.53 2.52 2.37 4.07 5.63 4.07 9.03 0 4.42-4.03 8-9 8zm0-2c3.86 0 7-2.69 7-6 0-2.62-1.2-5.14-3.18-6.98-.59-.55-1.24-1.02-1.93-1.41-.08.44-.2.87-.35 1.28-.28.8-.67 1.53-1.16 2.17-.63.82-1.45 1.48-2.38 1.93-.86.41-1.82.69-2.82.83.28.51.46 1.06.53 1.63.12.96-.1 1.93-.58 2.78-.27.49-.64.93-1.09 1.31.86.3 1.79.46 2.76.46z"/>
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

// XP Pop animation
export function XpPop({ amount, show }: { amount: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-primary font-bold text-lg font-mono z-20"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Streak number counter animation
export function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

// Pulse ring effect on completion
export function PulseRing({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-primary"
        />
      )}
    </AnimatePresence>
  );
}
