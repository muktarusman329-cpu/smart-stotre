import mongoose, { Schema, Document } from 'mongoose';

export interface IBackup extends Document {
  name: string;
  size: string;
  type: 'manual' | 'scheduled' | 'automatic';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  filePath?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    databaseSize?: number;
    compressedSize?: number;
    duration?: number;
    tables?: string[];
  };
}

const BackupSchema = new Schema<IBackup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['manual', 'scheduled', 'automatic'],
      default: 'manual',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    filePath: {
      type: String,
    },
    createdBy: {
      type: String,
      index: true,
    },
    createdByName: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BackupSchema.index({ createdAt: -1 });
BackupSchema.index({ type: 1, createdAt: -1 });
BackupSchema.index({ status: 1, createdAt: -1 });

// TTL index to automatically delete failed backups older than 30 days
BackupSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60,
  partialFilterExpression: { status: 'failed' }
});

// Keep successful backups for 90 days
BackupSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60,
  partialFilterExpression: { status: 'completed' }
});

export default mongoose.models.Backup || mongoose.model<IBackup>('Backup', BackupSchema);
