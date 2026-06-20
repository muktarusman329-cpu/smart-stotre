import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  company?: string;
  email?: string;
  phone: string;
  address?: string;
  productsSupplied: mongoose.Types.ObjectId[];
  totalPurchases: number;
  outstandingDebt: number;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    productsSupplied: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    totalPurchases: {
      type: Number,
      default: 0,
      min: [0, 'Total purchases cannot be negative'],
    },
    outstandingDebt: {
      type: Number,
      default: 0,
      min: [0, 'Outstanding debt cannot be negative'],
    },
    paymentTerms: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SupplierSchema.index({ name: 'text', phone: 'text', email: 'text' });

const Supplier: Model<ISupplier> = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);

export default Supplier;
