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
      const action = searchParams.get('action') || 'all';
      const search = searchParams.get('search') || '';
      const limit = parseInt(searchParams.get('limit') || '50');
      
      // Mock data for now - create ActivityLog model in production
      const activityLogs = [
        {
          id: 'LOG-001',
          action: 'USER_LOGIN',
          description: 'User logged in',
          userId: user.id,
          userName: user.name || 'Unknown',
          userRole: user.role || 'unknown',
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          timestamp: new Date(),
          severity: 'info'
        }
      ];
      
      let filtered = activityLogs;
      
      if (action !== 'all') {
        filtered = filtered.filter(log => log.action === action);
      }
      
      if (search) {
        filtered = filtered.filter(log => 
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.description.toLowerCase().includes(search.toLowerCase()) ||
          log.userName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return NextResponse.json({
        success: true,
        data: filtered.slice(0, limit)
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
      
      const activityLog = {
        id: `LOG-${Date.now()}`,
        ...data,
        userId: user.id,
        userName: user.name || 'Unknown',
        userRole: user.role || 'unknown',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: activityLog
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
