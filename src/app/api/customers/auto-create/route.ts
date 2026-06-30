import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Customer, Loyalty } from '@/models';
import { generateCustomerId } from '@/lib/utils';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { phone, name, email, address } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Customer already exists',
        data: existingCustomer,
      }, { status: 409 });
    }

    // Generate customer ID
    const customerId = generateCustomerId();

    // Create new customer
    const customer = await Customer.create({
      customerId,
      phone,
      name: name || 'Walk-in Customer',
      email: email || undefined,
      address: address || undefined,
      loyaltyPoints: 0,
      totalSpent: 0,
      purchaseCount: 0,
      favoriteProducts: [],
      favoriteCategories: [],
    });

    // Create loyalty record
    await Loyalty.create({
      customerId: customer._id,
      pointsBalance: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      level: 'bronze',
      totalSpent: 0,
      rewards: [],
    });

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      data: {
        _id: customer._id,
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
        purchaseCount: customer.purchaseCount,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
