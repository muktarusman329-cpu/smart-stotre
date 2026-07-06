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

    const body = await request.json();
    const { page, action, details } = body;

    // Find existing active session for this user
    let userActivity = await UserActivity.findOne({
      userId: session.user.id,
      isActive: true
    });

    if (userActivity) {
      // Update existing session directly
      userActivity.lastActivity = new Date();
      userActivity.currentPage = page || userActivity.currentPage;
      userActivity.isActive = true;
      
      if (action) {
        userActivity.activities.push({
          action,
          page: page || userActivity.currentPage,
          timestamp: new Date(),
          details: details || {},
        });
        
        // Keep only last 50 activities
        if (userActivity.activities.length > 50) {
          userActivity.activities = userActivity.activities.slice(-50);
        }
      }
      
      await userActivity.save();
    } else {
      // Deactivate any other active sessions for this user to prevent duplicates
      await UserActivity.updateMany(
        { userId: session.user.id, isActive: true },
        { isActive: false }
      );

      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      // Create new session
      userActivity = await UserActivity.create({
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userEmail: session.user.email || '',
        userRole: (session.user.role as 'admin' | 'manager' | 'cashier') || 'cashier',
        branchId: session.user.branchId || undefined,
        sessionStart: new Date(),
        lastActivity: new Date(),
        currentPage: page || '/dashboard',
        isActive: true,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        activities: action ? [{
          action,
          page: page || '/dashboard',
          timestamp: new Date(),
          details: details || {},
        }] : [],
      });

      // Notify admins of user login (but not for admin self-login)
      if (session.user.role !== 'admin') {
        await notifyAdminsOfUserActivity(
          session.user.name || 'Unknown',
          session.user.email || '',
          session.user.role || 'cashier',
          'login',
          ipAddress
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        sessionId: userActivity._id,
        lastActivity: userActivity.lastActivity,
        isActive: userActivity.isActive
      }
    });
  } catch (error: any) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update activity' 
    }, { status: 500 });
  }
}
