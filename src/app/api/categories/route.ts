import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { handleApiError } from '@/lib/error-handler';

// GET all categories
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const searchParams = request.nextUrl.searchParams;
      const search = searchParams.get('search') || '';
      
      const query: any = { isActive: true };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const categories = await Category.find(query)
        .sort({ name: 1 });
      
      // Get product count for each category
      const Product = (await import('@/models/Product')).default;
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ 
            categoryId: category._id, 
            isActive: true 
          });
          return {
            ...category.toObject(),
            productCount
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: categoriesWithCount
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

// POST create category
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      
      const category = await Category.create({
        ...data,
        createdBy: user.id
      });
      
      return NextResponse.json({
        success: true,
        data: category
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
