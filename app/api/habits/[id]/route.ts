import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Habit from '@/lib/db/models/Habit';

// GET /api/habits/[id] - Get single habit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id } = await params;
    const habit = await Habit.findOne({ _id: id, userId: session.user.id });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/habits/[id] - Update habit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    // Convert dailyProgress object to Map if provided
    const updateData: Record<string, unknown> = { ...body };
    if (body.dailyProgress && typeof body.dailyProgress === 'object') {
      updateData.dailyProgress = new Map(Object.entries(body.dailyProgress));
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/habits/[id] - Delete habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id } = await params;
    const habit = await Habit.findOneAndDelete({ _id: id, userId: session.user.id });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
