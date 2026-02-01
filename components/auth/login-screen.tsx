'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function LoginScreen() {
  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="mb-8 p-4 rounded-2xl bg-primary/10 border border-primary/20"
          animate={{ 
            boxShadow: ['0 0 20px rgba(16,185,129,0.2)', '0 0 40px rgba(16,185,129,0.3)', '0 0 20px rgba(16,185,129,0.2)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-12 h-12 text-primary" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Momentum
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Build streaks. Break limits. Track your habits with style.
        </p>

        {/* Features list */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
          {['🔥 Streak Tracking', '📊 Progress Stats', '🏆 Achievements'].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full bg-surface-dark border border-white/10 text-gray-300"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Sign in button */}
        <motion.button
          onClick={() => signIn('google')}
          className="flex items-center gap-3 px-6 py-3.5 bg-white text-gray-900 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </motion.button>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-600">
          By signing in, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
