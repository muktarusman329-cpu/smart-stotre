import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Backup from '@/models/Backup';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const backup = await Backup.findById(params.id);
      
      if (!backup) {
        return NextResponse.json(
          { success: false, error: 'Backup not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: backup
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const backup = await Backup.findById(params.id);
      
      if (!backup) {
        return NextResponse.json(
          { success: false, error: 'Backup not found' },
          { status: 404 }
        );
      }
      
      const body = await request.json();
      const { action } = body;
      
      if (action === 'restore') {
        // Update status to in_progress
        backup.status = 'in_progress';
        await backup.save();
        
        // Simulate restore process (in production, this would be a background job)
        setTimeout(async () => {
          try {
            await connectDB();
            await Backup.findByIdAndUpdate(params.id, { 
              status: 'completed',
              completedAt: new Date()
            });
          } catch (err) {
            console.error('Restore completion error:', err);
          }
        }, 5000);
        
        return NextResponse.json({
          success: true,
          message: 'Backup restore initiated',
          data: backup
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    } catch (error) {
      const errorResponse = handleApiError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  })(request);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const backup = await Backup.findById(params.id);
      
      if (!backup) {
        return NextResponse.json(
          { success: false, error: 'Backup not found' },
          { status: 404 }
        );
      }
      
      if (backup.status === 'in_progress') {
        return NextResponse.json(
          { success: false, error: 'Cannot delete backup in progress' },
          { status: 400 }
        );
      }
      
      await Backup.findByIdAndDelete(params.id);
      
      return NextResponse.json({
        success: true,
        message: 'Backup deleted successfully'
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
