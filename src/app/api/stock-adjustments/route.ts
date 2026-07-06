import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import { handleApiError } from '@/lib/error-handler';

// Stock Adjustment interface
interface IStockAdjustment {
  productId: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  performedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      // For now, return mock data since we don't have a StockAdjustment model
      // In production, create a StockAdjustment model and use it
      const adjustments = [
        {
          id: 'ADJ-001',
          productId: '1',
          productName: 'Coca-Cola 50cl',
          adjustmentType: 'increase',
          quantity: 50,
          reason: 'Restock',
          previousStock: 45,
          newStock: 95,
          performedBy: user.name || 'Unknown',
          status: 'approved',
          createdAt: new Date('2024-01-15T10:30:00')
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: adjustments
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
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      const Product = (await import('@/models/Product')).default;
      
      const product = await Product.findById(data.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      
      const previousStock = product.stockQuantity;
      const newStock = data.adjustmentType === 'increase' 
        ? previousStock + data.quantity 
        : previousStock - data.quantity;
      
      if (newStock < 0) {
        return NextResponse.json(
          { success: false, error: 'Insufficient stock for decrease adjustment' },
          { status: 400 }
        );
      }
      
      // Update product stock
      product.stockQuantity = newStock;
      await product.save();
      
      // Create stock adjustment record (mock for now)
      const adjustment = {
        id: `ADJ-${Date.now()}`,
        productId: data.productId,
        productName: product.name,
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: data.reason,
        previousStock,
        newStock,
        performedBy: user.name || 'Unknown',
        status: 'approved',
        createdAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: adjustment
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
