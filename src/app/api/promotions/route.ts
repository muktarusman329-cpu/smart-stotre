import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status') || 'all';
      const type = searchParams.get('type');
      
      const query: any = {};
      if (status !== 'all') {
        query.status = status;
      }
      if (type) {
        query.type = type;
      }
      
      const promotions = await Promotion
        .find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      return NextResponse.json({
        success: true,
        data: promotions.map(promo => ({
          ...promo,
          id: promo._id.toString(),
        }))
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
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      
      const promotion = await Promotion.create({
        ...data,
        status: data.status || 'active',
        createdBy: user.id,
        createdByName: user.name || 'Unknown',
      });
      
      return NextResponse.json({
        success: true,
        data: {
          ...promotion.toObject(),
          id: promotion._id.toString(),
        }
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
