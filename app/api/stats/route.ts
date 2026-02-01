import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

// GET /api/stats - Get user stats
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      totalHabitsCompleted: user.stats?.totalHabitsCompleted || 0,
      longestStreak: user.stats?.longestStreak || 0,
      lastLogin: user.stats?.lastLogin?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/stats - Update user stats
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await request.json();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'stats.totalHabitsCompleted': body.totalHabitsCompleted,
          'stats.longestStreak': body.longestStreak,
          'stats.lastLogin': body.lastLogin ? new Date(body.lastLogin) : new Date(),
        },
      },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      totalHabitsCompleted: user.stats?.totalHabitsCompleted || 0,
      longestStreak: user.stats?.longestStreak || 0,
      lastLogin: user.stats?.lastLogin?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
