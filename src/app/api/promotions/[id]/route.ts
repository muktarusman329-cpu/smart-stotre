import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/middleware';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const promotion = await Promotion.findById(params.id);
      
      if (!promotion) {
        return NextResponse.json(
          { success: false, error: 'Promotion not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: promotion
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const promotion = await Promotion.findById(params.id);
      
      if (!promotion) {
        return NextResponse.json(
          { success: false, error: 'Promotion not found' },
          { status: 404 }
        );
      }
      
      const body = await request.json();
      const { name, description, type, value, startDate, endDate, products, categories, status, minPurchase, maxDiscount, usageLimit } = body;
      
      if (name !== undefined) promotion.name = name;
      if (description !== undefined) promotion.description = description;
      if (type !== undefined) promotion.type = type;
      if (value !== undefined) promotion.value = value;
      if (startDate !== undefined) promotion.startDate = startDate;
      if (endDate !== undefined) promotion.endDate = endDate;
      if (products !== undefined) promotion.products = products;
      if (categories !== undefined) promotion.categories = categories;
      if (status !== undefined) promotion.status = status;
      if (minPurchase !== undefined) promotion.minPurchase = minPurchase;
      if (maxDiscount !== undefined) promotion.maxDiscount = maxDiscount;
      if (usageLimit !== undefined) promotion.usageLimit = usageLimit;
      
      promotion.updatedAt = new Date();
      await promotion.save();
      
      return NextResponse.json({
        success: true,
        data: promotion
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAdmin(async (req, user) => {
    try {
      await connectDB();
      
      const promotion = await Promotion.findById(params.id);
      
      if (!promotion) {
        return NextResponse.json(
          { success: false, error: 'Promotion not found' },
          { status: 404 }
        );
      }
      
      await Promotion.findByIdAndDelete(params.id);
      
      return NextResponse.json({
        success: true,
        message: 'Promotion deleted successfully'
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
