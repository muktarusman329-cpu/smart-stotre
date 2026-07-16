import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import { handleApiError } from '@/lib/error-handler';
import { Report } from '@/models';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') || '';
      const status = searchParams.get('status') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      
      const query: any = {};
      
      if (type) query.type = type;
      if (status) query.status = status;
      
      const reports = await Report
        .find(query)
        .sort({ generatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      
      const total = await Report.countDocuments(query);
      
      return NextResponse.json({
        success: true,
        data: reports.map(report => ({
          ...report,
          _id: report._id.toString(),
          generatedAt: report.generatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
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

export async function DELETE(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const { searchParams } = new URL(request.url);
      const reportId = searchParams.get('id');
      
      if (!reportId) {
        return NextResponse.json(
          { success: false, error: 'Report ID is required' },
          { status: 400 }
        );
      }
      
      await Report.findByIdAndDelete(reportId);
      
      return NextResponse.json({
        success: true,
        message: 'Report deleted successfully'
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
