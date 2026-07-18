import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const searchParams = request.nextUrl.searchParams;
      const action = searchParams.get('action') || 'all';
      const search = searchParams.get('search') || '';
      const limit = parseInt(searchParams.get('limit') || '50');
      
      const query: any = {};
      if (action !== 'all') {
        query.action = action;
      }
      if (search) {
        query.$or = [
          { action: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
        ];
      }
      
      const activityLogs = await ActivityLog
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return NextResponse.json({
        success: true,
        data: activityLogs.map(log => ({
          ...log,
          id: log._id.toString(),
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
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      
      const activityLog = await ActivityLog.create({
        ...data,
        userId: user.id,
        userName: user.name || 'Unknown',
        userRole: user.role || 'unknown',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });
      
      return NextResponse.json({
        success: true,
        data: {
          ...activityLog.toObject(),
          id: activityLog._id.toString(),
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
