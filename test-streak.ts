
import { calculateStreak } from './lib/utils';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const dayBeforeYesterday = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

console.log('--- Streak Calculation Tests ---');

// Case 1: Perfect Streak (Today + Yesterday + 2 days before)
const perfectStreak = [today, yesterday, dayBeforeYesterday];
console.log(`1. Perfect Streak (3 days): ${calculateStreak(perfectStreak) === 3 ? 'PASS' : 'FAIL'} (${calculateStreak(perfectStreak)})`);

// Case 2: Missed Yesterday (Streak shoud be 1 if done today, else 0)
// If I did it today, but missed yesterday -> Streak = 1 (new streak)
const brokenStreak = [today, threeDaysAgo]; 
console.log(`2. Broken Streak (Today but missed yesterday): ${calculateStreak(brokenStreak) === 1 ? 'PASS' : 'FAIL'} (${calculateStreak(brokenStreak)})`);

// Case 3: Missed Today but did Yesterday (Streak should be preserved)
const savedStreak = [yesterday, dayBeforeYesterday];
console.log(`3. Pending Streak (Missed today, did yesterday): ${calculateStreak(savedStreak) === 2 ? 'PASS' : 'FAIL'} (${calculateStreak(savedStreak)})`);

// Case 4: Missed Today AND Yesterday (Streak should be 0)
const lostStreak = [dayBeforeYesterday, threeDaysAgo];
console.log(`4. Lost Streak (Missed today and yesterday): ${calculateStreak(lostStreak) === 0 ? 'PASS' : 'FAIL'} (${calculateStreak(lostStreak)})`);

// Case 5: Empty
console.log(`5. Empty: ${calculateStreak([]) === 0 ? 'PASS' : 'FAIL'} (${calculateStreak([])})`);

// Case 6: Out of order
const unordered = [yesterday, today, dayBeforeYesterday];
console.log(`6. Unordered Input: ${calculateStreak(unordered) === 3 ? 'PASS' : 'FAIL'} (${calculateStreak(unordered)})`);
