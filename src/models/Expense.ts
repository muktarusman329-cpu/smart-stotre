import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  description?: string;
  category: 'rent' | 'electricity' | 'transport' | 'salary' | 'supplier_payment' | 'maintenance' | 'other';
  amount: number;
  date: Date;
  branchId?: mongoose.Types.ObjectId;
  paidTo?: string;
  receipt?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['rent', 'electricity', 'transport', 'salary', 'supplier_payment', 'maintenance', 'other'],
      required: [true, 'Expense category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    paidTo: {
      type: String,
      trim: true,
    },
    receipt: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ description: 'text', category: 'text' });

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
