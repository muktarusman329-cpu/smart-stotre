import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withAuth } from '@/lib/api-auth';
import connectDB from '@/lib/mongodb';
import { handleApiError } from '@/lib/error-handler';
import { Report } from '@/models';
import { Sale, Product, Customer } from '@/models';

export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      await connectDB();
      
      const data = await request.json();
      const { type, dateRange, startDate, endDate } = data;
      
      // Validate report type
      const validTypes = ['sales', 'inventory', 'customers', 'financial'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
      }
      
      // Calculate date range
      let start: Date, end: Date;
      const now = new Date();
      
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (dateRange) {
          case 'today':
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'week':
            start = new Date(now.setDate(now.getDate() - 7));
            end = new Date();
            break;
          case 'month':
            start = new Date(now.setDate(now.getDate() - 30));
            end = new Date();
            break;
          case 'quarter':
            start = new Date(now.setDate(now.getDate() - 90));
            end = new Date();
            break;
          case 'year':
            start = new Date(now.setFullYear(now.getFullYear() - 1));
            end = new Date();
            break;
          default:
            start = new Date(now.setDate(now.getDate() - 30));
            end = new Date();
        }
      }
      
      // Generate report data based on type
      let reportData: any = {};
      
      switch (type) {
        case 'sales':
          const sales = await Sale.find({
            createdAt: { $gte: start, $lte: end }
          }).lean();
          const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
          const totalTransactions = sales.length;
          reportData = {
            totalRevenue,
            totalTransactions,
            averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
            salesCount: sales.length,
          };
          break;
          
        case 'inventory':
          const products = await Product.find().lean();
          const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || p.stock || 0), 0);
          const totalValue = products.reduce((sum, p) => sum + ((p.stockQuantity || p.stock || 0) * (p.cost || p.price || 0)), 0);
          reportData = {
            totalProducts: products.length,
            totalStock,
            totalValue,
            lowStockItems: products.filter(p => (p.stockQuantity || p.stock || 0) < 10).length,
          };
          break;
          
        case 'customers':
          const customers = await Customer.find({
            createdAt: { $gte: start, $lte: end }
          }).lean();
          reportData = {
            totalCustomers: customers.length,
            newCustomers: customers.length,
            averagePurchaseValue: 0,
          };
          break;
          
        case 'financial':
          const financialSales = await Sale.find({
            createdAt: { $gte: start, $lte: end }
          }).lean();
          const revenue = financialSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
          reportData = {
            revenue,
            expenses: 0,
            profit: revenue,
            profitMargin: revenue > 0 ? 100 : 0,
          };
          break;
      }
      
      // Create report record
      const report = await Report.create({
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type,
        generatedBy: user.name || 'Unknown',
        generatedById: user.id,
        generatedAt: new Date(),
        status: 'completed',
        dateRange: { start, end },
        metadata: {
          dateRange,
          startDate,
          endDate,
          userId: user.id,
          ...reportData,
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          ...report.toObject(),
          _id: report._id.toString(),
          generatedAt: report.generatedAt,
        },
        message: 'Report generated successfully'
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
