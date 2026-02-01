import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Habit from '@/lib/db/models/Habit';

// GET /api/habits - List user's habits
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const habits = await Habit.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    // Transform MongoDB documents to match frontend Habit type
    const transformedHabits = habits.map(habit => ({
      id: habit._id.toString(),
      title: habit.title,
      description: habit.description,
      category: habit.category,
      streak: habit.streak,
      completedDates: habit.completedDates,
      createdAt: habit.createdAt.getTime(),
      targetTime: habit.targetTime,
      dailyProgress: Object.fromEntries(habit.dailyProgress || new Map()),
      isStreakable: habit.isStreakable,
      completedAt: habit.completedAt?.toISOString(),
    }));

    return NextResponse.json(transformedHabits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/habits - Create new habit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await request.json();
    
    const habit = await Habit.create({
      userId: session.user.id,
      title: body.title,
      description: body.description,
      category: body.category || 'other',
      streak: 0,
      completedDates: [],
      targetTime: body.targetTime || 0,
      dailyProgress: new Map(),
      isStreakable: body.isStreakable ?? true,
    });

    return NextResponse.json({
      id: habit._id.toString(),
      title: habit.title,
      description: habit.description,
      category: habit.category,
      streak: habit.streak,
      completedDates: habit.completedDates,
      createdAt: habit.createdAt.getTime(),
      targetTime: habit.targetTime,
      dailyProgress: {},
      isStreakable: habit.isStreakable,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
