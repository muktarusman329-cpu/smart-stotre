import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import { handleApiError } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const { id } = await context.params;
      const report = await Report.findById(id);
      
      if (!report) {
        return NextResponse.json(
          { success: false, error: 'Report not found' },
          { status: 404 }
        );
      }
      
      if (report.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Report is not ready for download' },
          { status: 400 }
        );
      }
      
      if (!report.fileUrl) {
        return NextResponse.json(
          { success: false, error: 'Report file not available' },
          { status: 404 }
        );
      }
      
      // Redirect to the file URL (Cloudinary or other storage)
      return NextResponse.redirect(report.fileUrl);
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  })(request);
}
