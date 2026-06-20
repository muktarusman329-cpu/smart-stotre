import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'paystack';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryDate?: Date;
  notes?: string;
  branchId?: mongoose.Types.ObjectId;
  source: 'online' | 'whatsapp' | 'pos';
  cashierId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
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
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    customerAddress: {
      type: String,
      trim: true,
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'paystack'],
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: [true, 'Delivery method is required'],
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    deliveryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    source: {
      type: String,
      enum: ['online', 'whatsapp', 'pos'],
      default: 'online',
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ source: 1 });
OrderSchema.index({ orderNumber: 'text', customerName: 'text', customerPhone: 'text' });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
