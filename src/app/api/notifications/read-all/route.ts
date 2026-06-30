import { NextRequest, NextResponse } from 'next/server';
import { markAllAsRead } from '@/lib/actions/notifications';

export async function PUT(_request: NextRequest) {
  try {
    await markAllAsRead();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
