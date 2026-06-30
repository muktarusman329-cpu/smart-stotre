import { NextRequest, NextResponse } from 'next/server';
import { predictSales } from '@/lib/actions/ai';

export async function POST(request: NextRequest) {
  try {
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
