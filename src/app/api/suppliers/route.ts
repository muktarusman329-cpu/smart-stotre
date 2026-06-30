import { NextRequest, NextResponse } from 'next/server';
import { createSupplier, getSuppliers } from '@/lib/actions/suppliers';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 30 requests per minute per user/IP
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 30, 60 * 1000);
    
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

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
    };

    const suppliers = await getSuppliers(filters);
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per user/IP
    const identifier = getClientIdentifier(request);
    const rateLimitResult = rateLimit(identifier, 10, 60 * 1000);
    
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
    const supplier = await createSupplier(data);
    return NextResponse.json({ success: true, data: supplier });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    );
  }
}
