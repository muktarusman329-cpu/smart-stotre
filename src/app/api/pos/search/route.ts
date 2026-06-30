import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/actions/pos';
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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    console.log('Search query:', query);

    const products = await searchProducts(query);
    console.log('Search results:', products.length, 'products found');

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Search error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}
