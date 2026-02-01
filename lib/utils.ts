import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  // Sort dates descending (newest first)
  const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Streak is broken if the most recent completion wasn't today or yesterday
  const lastCompletion = sortedDates[0];
  if (lastCompletion !== today && lastCompletion !== yesterday) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(lastCompletion);
  
  for (const dateStr of sortedDates) {
    // Check if this date matches the expected current date in sequence
    const expectedDateStr = currentDate.toISOString().split('T')[0];
    
    if (dateStr === expectedDateStr) {
      streak++;
      // Move expected date back by one day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap found, streak ends
      break;
    }
  }

  return streak;
}
