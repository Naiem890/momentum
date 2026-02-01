'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface WaterFillStreakProps {
  value: number;
  progress: number; // 0 to 1
  className?: string;
}

export function WaterFillStreak({ value, progress, className }: WaterFillStreakProps) {
  // Generate unique ID for this instance to prevent SVG conflict
  // fallback for older React versions if needed, but Next.js usually supports useId
  const id = useId().replace(/:/g, ''); 
  
  // Visual configuration
  const fontSize = 100;
  // Viewbox dimensions
  const width = 200;
  const height = 120;
  const text = value.toString();

  // Water Level Logic
  // We layout text roughly in the middle.
  // We want 0% to be below text, 100% to be above text.
  // Text BBox vertical estimation:
  // Center is 60 (50% of 120). Font size 100 is quite large.
  // Cap-height is approx 0.7 * size = 70px.
  // So text spans approx Y=25 to Y=95.
  // We'll set the "Empty" water level at Y=110 and "Full" at Y=10.
  const bottomY = 110;
  const topY = 10;
  const fillRange = bottomY - topY;
  const currentY = bottomY - (progress * fillRange);

  return (
    <div className={className}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for the Liquid */}
          <linearGradient id={`liquidGradient-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34D399" /> {/* Emerald 400 */}
            <stop offset="100%" stopColor="#10B981" /> {/* Emerald 500 */}
          </linearGradient>

          {/* Define the Text as a Clip Path */}
          <clipPath id={`textClip-${id}`}>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ 
                fontSize: `${fontSize}px`, 
                fontWeight: 'bold',
                // Using standard CSS font stack that mimics standard fonts
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                letterSpacing: '-0.05em'
              }}
            >
              {text}
            </text>
          </clipPath>
        </defs>

        {/* 1. Base Text (White - Empty/Background State) */}
        {/* This is the text color when NOT filled. User wanted "2/3 white". */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          style={{ 
            fontSize: `${fontSize}px`, 
            fontWeight: 'bold',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            letterSpacing: '-0.05em'
          }}
        >
          {text}
        </text>

        {/* 2. Liquid Layer (Green) - Clipped by Text */}
        {/* We animate a Wave Group UP/DOWN behind the text clip */}
        <g clipPath={`url(#textClip-${id})`}>
          <motion.g
             animate={{ y: currentY }}
             transition={{ type: "spring", stiffness: 40, damping: 15 }}
          >
             {/* The Wave + Fill Block */}
             {/* 
                Wave Loop Logic:
                We need a seamless loop. 
                Pattern: Hill (width 100) + Valley (width 100) = Period 200.
                We define enough periods to cover movement.
                ViewBox width = 200.
                We need to animate by exactly one period (200px).
                Path Definition:
                Start 0.
                0-100: Hill (Q 50 15 100 0)
                100-200: Valley (T 200 0)
                200-300: Hill (T 300 0)
                300-400: Valley (T 400 0)
                
                Animation:
                x moves from 0 to -200.
                t=0: x=0. Visible: 0-200 (Hill + Valley).
                t=end: x=-200. Visible: 200-400 (Hill + Valley).
                Since 0-200 and 200-400 are identical, the loop is seamless.
             */}
             <motion.path
               d={`
                 M 0 0 
                 Q 50 12 100 0 
                 T 200 0 
                 T 300 0 
                 T 400 0 
                 V 200 H 0 Z
               `}
               fill={`url(#liquidGradient-${id})`}
               animate={{
                 x: [0, -200], // Move left by one full period
               }}
               transition={{
                 repeat: Infinity,
                 ease: "linear",
                 duration: 4, 
               }}
             />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
