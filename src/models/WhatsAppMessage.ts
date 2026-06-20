import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IWhatsAppMessage extends Document {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  saleId?: string;
  amount?: number;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

WhatsAppMessageSchema.index({ customerName: 'text', customerPhone: 'text' });

const WhatsAppMessage: Model<IWhatsAppMessage> = mongoose.models.WhatsAppMessage || mongoose.model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);

export default WhatsAppMessage;
