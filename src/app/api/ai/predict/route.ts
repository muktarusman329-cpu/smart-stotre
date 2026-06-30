import { NextRequest, NextResponse } from 'next/server';
import { predictSales } from '@/lib/actions/ai';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, days } = await request.json();
    const prediction = await predictSales(productId, days);

    return NextResponse.json({ success: true, data: prediction });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
