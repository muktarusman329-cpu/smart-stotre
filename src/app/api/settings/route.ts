import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const branchId = session.user.branchId;
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
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const branchId = session.user.branchId;
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
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
