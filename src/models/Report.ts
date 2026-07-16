import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  name: string;
  type: 'sales' | 'inventory' | 'customers' | 'financial';
  generatedBy: string;
  generatedById?: mongoose.Types.ObjectId;
  generatedAt: Date;
  status: 'pending' | 'completed' | 'failed';
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'csv' | 'xlsx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['sales', 'inventory', 'customers', 'financial'],
      required: true,
    },
    generatedBy: {
      type: String,
      required: true,
    },
    generatedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'csv', 'xlsx'],
    },
    dateRange: {
      start: {
        type: Date,
      },
      end: {
        type: Date,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReportSchema.index({ type: 1, generatedAt: -1 });
ReportSchema.index({ status: 1, generatedAt: -1 });
ReportSchema.index({ generatedById: 1, generatedAt: -1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
