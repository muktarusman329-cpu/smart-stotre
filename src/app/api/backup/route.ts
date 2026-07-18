import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Backup from '@/models/Backup';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const backups = await Backup
        .find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      return NextResponse.json({
        success: true,
        data: backups.map(backup => ({
          ...backup,
          id: backup._id.toString(),
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
      const action = data.action || 'create';
      
      if (action === 'create') {
        const backup = await Backup.create({
          name: data.name || `Manual Backup - ${new Date().toLocaleDateString()}`,
          size: data.size || 'Calculating...',
          type: 'manual',
          status: 'in_progress',
          createdBy: user.id,
          createdByName: user.name || 'Unknown',
        });
        
        // Simulate backup process (in production, this would be a background job)
        setTimeout(async () => {
          try {
            await connectDB();
            await Backup.findByIdAndUpdate(backup._id, { 
              status: 'completed',
              size: data.size || '2.4 GB',
              completedAt: new Date()
            });
          } catch (err) {
            console.error('Backup completion error:', err);
          }
        }, 3000);
        
        return NextResponse.json({
          success: true,
          data: {
            ...backup.toObject(),
            id: backup._id.toString(),
          }
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
