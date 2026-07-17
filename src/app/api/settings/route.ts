import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAdmin(async (req, user) => {
    try {
      const branchId = user.branchId;
      if (!branchId) {
        return NextResponse.json({ success: false, error: 'No branch associated with user' }, { status: 400 });
      }

      await connectDB();
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: branch.settings });
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.statusCode });
    }
  })(request);
}

export async function POST(request: NextRequest) {
  return withAdmin(async (req, user) => {
    try {
      const branchId = user.branchId;
      if (!branchId) {
        return NextResponse.json({ success: false, error: 'No branch associated with user' }, { status: 400 });
      }

      const body = await request.json();
      const { settings } = body;

      if (!settings) {
        return NextResponse.json({ success: false, error: 'Missing settings payload' }, { status: 400 });
      }

      await connectDB();
      
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
      }

      // Merge and save settings
      branch.settings = {
        ...branch.settings,
        ...settings,
      };

      await branch.save();

      return NextResponse.json({ success: true, data: branch.settings });
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json({ success: false, error: errorResponse.error }, { status: errorResponse.statusCode });
    }
  })(request);
}
