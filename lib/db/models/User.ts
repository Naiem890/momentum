import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailVerified: Date | null;
  image?: string;
  // Extended fields for StreakQuest
  stats: {
    totalHabitsCompleted: number;
    longestStreak: number;
    lastLogin: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null },
    image: { type: String },
    stats: {
      totalHabitsCompleted: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastLogin: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
