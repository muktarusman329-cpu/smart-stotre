import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/actions/pos';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    console.log('Search query:', query);

    const products = await searchProducts(query);
    console.log('Search results:', products.length, 'products found');

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
