import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type HabitCategory = 'health' | 'work' | 'study' | 'other';

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
  targetTime?: number; // Target time in minutes. 0 or undefined = simple habit
  dailyProgress: Map<string, number>; // Key: YYYY-MM-DD, Value: minutes spent
  isStreakable: boolean; // true = daily streak task, false = additional/one-time task
  completedAt?: Date; // When additional task was completed (for non-streakable only)
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { 
      type: String, 
      enum: ['health', 'work', 'study', 'other'], 
      default: 'other' 
    },
    streak: { type: Number, default: 0 },
    completedDates: [{ type: String }],
    targetTime: { type: Number },
    dailyProgress: { 
      type: Map, 
      of: Number, 
      default: new Map() 
    },
    isStreakable: { type: Boolean, default: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user habit queries
HabitSchema.index({ userId: 1, createdAt: -1 });

// Prevent model recompilation in development
const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

export default Habit;
