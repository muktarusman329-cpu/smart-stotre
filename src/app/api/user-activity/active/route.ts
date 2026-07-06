import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { UserActivity } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view active users
    if (session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const minutesThreshold = parseInt(searchParams.get('minutes') || '5');

    // Get active users
    const activeUsers = await UserActivity.getActiveUsers(minutesThreshold);

    return NextResponse.json({ 
      success: true, 
      data: activeUsers,
      count: activeUsers.length
    });
  } catch (error: any) {
    console.error('Get active users error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch active users' 
    }, { status: 500 });
  }
}
