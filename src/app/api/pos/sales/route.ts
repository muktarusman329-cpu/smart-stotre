import { NextRequest, NextResponse } from 'next/server';
import { createSale } from '@/lib/actions/pos';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 requests per minute per user/IP
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 20, 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const sale = await createSale({
      ...data,
      cashierId: session.user.id,
      branchId: session.user.branchId,
    });

    return NextResponse.json({ success: true, data: sale });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}
