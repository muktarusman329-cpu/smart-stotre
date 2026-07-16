'use server';

import connectDB from '@/lib/mongodb';
import { Notification } from '@/models';
import { revalidatePath } from 'next/cache';

export async function getNotifications(filters?: {
  userId?: string;
  isRead?: boolean;
  category?: string;
  userRole?: string;
  branchId?: any;
}) {
  await connectDB();

  const query: any = {};

  if (filters?.userId) {
    query.userId = filters.userId;
  }

  if (filters?.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  if (filters?.category) {
    query.category = filters.category;
  }

  // Role-based filtering
  if (filters?.userRole) {
    // Admins see all notifications
    // Managers see system, stock, expiry, payment notifications
    // Cashiers see only their own notifications and system notifications
    // user_activity category is only for admins
    if (filters.userRole === 'cashier') {
      query.$or = [
        { userId: filters.userId },
        { category: { $in: ['system', 'stock', 'expiry'] } },
        { userRole: 'cashier' },
      ];
    } else if (filters.userRole === 'manager') {
      query.$or = [
        { userId: filters.userId },
        { category: { $in: ['system', 'stock', 'expiry', 'payment', 'ai_insight'] } },
        { userRole: { $in: ['manager', 'cashier'] } },
        { branchId: filters.branchId },
      ];
    }
    // Admin sees everything (no additional filtering)
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  return JSON.parse(JSON.stringify(notifications));
}

export async function getNotificationById(id: string) {
  await connectDB();

  const notification = await Notification.findById(id);

  return JSON.parse(JSON.stringify(notification));
}

export async function createNotification(data: any) {
  await connectDB();

  const notification = await Notification.create(data);

  revalidatePath('/dashboard/notifications');
  return JSON.parse(JSON.stringify(notification));
}

export async function markAsRead(id: string) {
  await connectDB();

  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  revalidatePath('/dashboard/notifications');
  return JSON.parse(JSON.stringify(notification));
}

export async function markAllAsRead(userId?: string) {
  await connectDB();

  const query = userId ? { userId } : {};
  await Notification.updateMany(query, { isRead: true });

  revalidatePath('/dashboard/notifications');
  return { success: true };
}

export async function deleteNotification(id: string) {
  await connectDB();

  await Notification.findByIdAndDelete(id);

  revalidatePath('/dashboard/notifications');
  return { success: true };
}

export async function getUnreadCount(userId?: string) {
  await connectDB();

  const query: any = { isRead: false };
  if (userId) {
    query.userId = userId;
  }

  const count = await Notification.countDocuments(query);
  return count;
}
