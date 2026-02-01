'use client';

import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap, TrendingUp, Check } from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Flame, label: 'Streak Tracking', description: 'Never break your chain' },
  { icon: TrendingUp, label: 'Progress Analytics', description: 'Visualize your growth' },
  { icon: Zap, label: 'Quick Logging', description: 'One-tap completion' },
];



export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google');
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Secondary glow */}
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-md"
      >
        {/* Logo with enhanced animation */}
        <motion.div
          className="mb-10 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            animate={{ 
              filter: [
                'drop-shadow(0 0 20px rgba(16,185,129,0.4))', 
                'drop-shadow(0 0 30px rgba(16,185,129,0.6))', 
                'drop-shadow(0 0 20px rgba(16,185,129,0.4))'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Title with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            <span className="text-white">Momen</span>
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">tum</span>
          </h1>
        </motion.div>

        <motion.p 
          className="text-gray-400 text-lg sm:text-xl mb-10 leading-relaxed max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Build habits that stick. Track your progress with elegance.
        </motion.p>

        {/* Feature cards */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              className="flex flex-col items-center p-4 rounded-xl bg-surface-dark/50 border border-white/5 backdrop-blur-sm"
              whileHover={{ scale: 1.02, borderColor: 'rgba(16,185,129,0.3)' }}
              transition={{ duration: 0.2 }}
            >
              <feature.icon className="w-6 h-6 text-primary mb-2" strokeWidth={1.5} />
              <span className="text-xs text-gray-300 font-medium text-center">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Sign in button */}
        <motion.button
          onClick={handleSignIn}
          disabled={isLoading}
          className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-white text-gray-900 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
            animate={{ translateX: ['0%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
          />
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <motion.div 
                  className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Connecting...</span>
              </motion.div>
            ) : (
              <motion.div
                key="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3 relative z-10"
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Trust indicators */}
        <motion.div
          className="flex items-center gap-4 mt-8 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Login</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <div className="flex items-center gap-1.5 text-xs">
            <Check className="w-3.5 h-3.5" />
            <span>No credit card</span>
          </div>
        </motion.div>



        {/* Footer */}
        <motion.p 
          className="mt-8 text-[11px] text-gray-600 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          By signing in, you agree to our{' '}
          <span className="text-gray-500 hover:text-gray-400 cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-gray-500 hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
