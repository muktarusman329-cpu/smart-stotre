import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status') || 'all';
      
      // Mock data for now - create PurchaseOrder model in production
      const purchaseOrders = [
        {
          id: 'PO-001',
          supplierName: 'Coca-Cola Bottling Company',
          orderDate: new Date('2024-01-15'),
          expectedDelivery: new Date('2024-01-20'),
          totalAmount: 150000,
          status: 'pending',
          itemCount: 45,
          items: [
            { name: 'Coca-Cola 50cl', quantity: 100, price: 150 },
            { name: 'Fanta 50cl', quantity: 50, price: 150 }
          ]
        }
      ];
      
      const filtered = status === 'all' 
        ? purchaseOrders 
        : purchaseOrders.filter(po => po.status === status);
      
      return NextResponse.json({
        success: true,
        data: filtered
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
      
      const purchaseOrder = {
        id: `PO-${Date.now()}`,
        ...data,
        status: 'pending',
        createdBy: user.id,
        createdAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        data: purchaseOrder
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
