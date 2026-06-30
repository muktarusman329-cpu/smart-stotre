import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/actions/pos';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 60 requests per minute per user/IP (higher for search)
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 60, 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many search requests. Please try again later.',
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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const products = await searchProducts(query);

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}
