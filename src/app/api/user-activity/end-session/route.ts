import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { UserActivity } from '@/models';
import { notifyAdminsOfUserActivity } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find and end active session for this user
    const userActivity = await UserActivity.findOne({
      userId: session.user.id,
      isActive: true
    });

    if (userActivity) {
      // End the session directly
      userActivity.isActive = false;
      userActivity.lastActivity = new Date();
      await userActivity.save();

      // Notify admins of user logout (but not for admin self-logout)
      if (session.user.role !== 'admin') {
        await notifyAdminsOfUserActivity(
          session.user.name || 'Unknown',
          session.user.email || '',
          session.user.role || 'cashier',
          'logout',
          userActivity.ipAddress
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('End session error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to end session' 
    }, { status: 500 });
  }
}
