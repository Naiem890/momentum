'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp, CreditCard } from 'lucide-react';
import { useState } from 'react';

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google');
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 md:p-6">
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Logo - exact match with app header but larger */}
        <motion.div
          className="flex items-center gap-3 font-mono text-lg tracking-wider mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Flame className="w-8 h-8 text-primary" />
          <span className="text-gray-400 font-semibold">Momentum</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Build habits that stick
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          className="text-gray-500 text-base mb-8 text-center leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Track your progress. Never break the chain.
        </motion.p>

        {/* Features - elegant inline style */}
        <motion.div 
          className="flex items-center justify-center gap-6 mb-10 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-primary/70" />
            <span>Streaks</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary/70" />
            <span>Analytics</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-primary/70" />
            <span>Quick Log</span>
          </div>
        </motion.div>

        {/* Sign in button */}
        <motion.button
          onClick={handleSignIn}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 w-full bg-primary text-background-dark px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] disabled:opacity-70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <motion.div 
              className="w-4 h-4 border-2 border-background-dark/30 border-t-background-dark rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </motion.button>

        {/* No credit card notice */}
        <motion.div 
          className="flex items-center gap-2 mt-6 text-gray-600 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>No credit card required</span>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="mt-8 text-center text-[11px] text-gray-600 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By signing in, you agree to our{' '}
          <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-gray-500 hover:text-primary cursor-pointer transition-colors">Privacy</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
