import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const count = await Notification.countDocuments({ isRead: false });
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
