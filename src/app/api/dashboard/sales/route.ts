import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();

      const searchParams = request.nextUrl.searchParams;
      const filter = searchParams.get('filter') || 'monthly';

      let startDate = new Date();
      const endDate = new Date();

      switch (filter) {
        case 'daily':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const salesData = await Sale.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: filter === 'daily' ? '%Y-%m-%d %H:00' : filter === 'weekly' ? '%Y-%m-%d' : '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return NextResponse.json({
        success: true,
        data: salesData.map((item) => ({
          date: item._id,
          total: item.total,
          count: item.count,
        })),
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
