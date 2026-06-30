import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { generateThankYouMessage } from '@/lib/whatsapp-utils';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerName, customerPhone, amount } = body;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'customerName and customerPhone are required' },
        { status: 400 }
      );
    }

    const testAmount = amount || 100;
    const message = generateThankYouMessage(customerName, testAmount);

    const result = await sendWhatsAppMessage({
      customerName,
      customerPhone,
      message,
      amount: testAmount,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
