import mongoose, { Schema, Model, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'stock' | 'expiry' | 'payment' | 'system' | 'ai_insight' | 'user_activity';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['stock', 'expiry', 'payment', 'system', 'ai_insight', 'user_activity'],
      required: [true, 'Notification category is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
