import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status') || 'all';
      
      // Mock data for now - create Promotion model in production
      const promotions = [
        {
          id: 'PROM-001',
          name: 'Weekend Special',
          description: '20% off all beverages',
          type: 'percentage',
          value: 20,
          startDate: new Date('2024-01-13'),
          endDate: new Date('2024-01-15'),
          status: 'active',
          applicableProducts: ['Beverages'],
          usageCount: 156
        }
      ];
      
      const filtered = status === 'all' 
        ? promotions 
        : promotions.filter(promo => promo.status === status);
      
      return NextResponse.json({
        success: true,
        data: filtered
      });
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  })(request);
}

export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      
      const promotion = {
        id: `PROM-${Date.now()}`,
        ...data,
        status: 'active',
        createdBy: user.id,
        createdAt: new Date(),
        usageCount: 0
      };
      
      return NextResponse.json({
        success: true,
        data: promotion
      });
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  })(request);
}
