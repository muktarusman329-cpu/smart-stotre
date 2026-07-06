import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      // Get unique roles from users
      const roles = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      
      const roleData = roles.map(r => ({
        id: r._id,
        name: r._id,
        userCount: r.count,
        isSystem: ['admin', 'manager', 'cashier'].includes(r._id)
      }));
      
      return NextResponse.json({
        success: true,
        data: roleData
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
