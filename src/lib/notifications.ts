import connectDB from './mongodb';
import { Notification } from '@/models';
import { User } from '@/models';

export async function notifyAdminsOfUserActivity(
  userName: string,
  userEmail: string,
  userRole: string,
  action: 'login' | 'logout',
  ipAddress?: string
) {
  try {
    await connectDB();

    // Get all admin users
    const admins = await User.find({ role: 'admin', isActive: true });

    if (admins.length === 0) {
      console.log('No admins found to notify');
      return;
    }

    const title = action === 'login' 
      ? `User Login: ${userName}` 
      : `User Logout: ${userName}`;

    const message = action === 'login'
      ? `${userName} (${userRole}) has logged in from IP: ${ipAddress || 'unknown'}`
      : `${userName} (${userRole}) has logged out`;

    const type = action === 'login' ? 'success' : 'info';

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      title,
      message,
      type,
      category: 'user_activity' as const,
      priority: 'medium' as const,
      userId: admin._id,
      actionUrl: '/dashboard/active-users',
      metadata: {
        userName,
        userEmail,
        userRole,
        action,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
    }));

    await Notification.insertMany(notifications);
    console.log(`Sent ${action} notifications to ${admins.length} admins`);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
}
