import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  images: string[];
  buyingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  expiryDate?: Date;
  supplierId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    images: [{
      type: String,
    }],
    buyingPrice: {
      type: Number,
      required: [true, 'Buying price is required'],
      min: [0, 'Buying price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock level cannot be negative'],
      default: 10,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
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

ProductSchema.index({ expiryDate: 1 });
ProductSchema.index({ stockQuantity: 1 });
ProductSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
