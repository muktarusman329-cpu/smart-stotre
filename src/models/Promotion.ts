import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'buy-one-get-one';
  value: number;
  startDate?: Date;
  endDate?: Date;
  products?: string[];
  categories?: string[];
  status: 'active' | 'inactive' | 'scheduled' | 'expired' | 'paused';
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'buy-one-get-one'],
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    products: [{
      type: String,
    }],
    categories: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled', 'expired', 'paused'],
      default: 'active',
      index: true,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      index: true,
    },
    createdByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PromotionSchema.index({ createdAt: -1 });
PromotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ type: 1, status: 1 });

export default mongoose.models.Promotion || mongoose.model<IPromotion>('Promotion', PromotionSchema);
