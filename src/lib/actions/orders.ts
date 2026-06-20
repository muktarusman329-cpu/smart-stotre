'use server';

import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { revalidatePath } from 'next/cache';

export async function getOrders(source?: 'online' | 'whatsapp', filters?: { search?: string }) {
  await connectDB();
  const query: any = {};
  if (source) {
    query.source = source;
  }
  if (filters?.search) {
    query.$or = [
      { orderNumber: { $regex: filters.search, $options: 'i' } },
      { customerName: { $regex: filters.search, $options: 'i' } },
      { customerPhone: { $regex: filters.search, $options: 'i' } },
    ];
  }
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(orders));
}

export async function updateOrderStatus(id: string, status: string) {
  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
  revalidatePath('/dashboard/online-orders');
  revalidatePath('/dashboard/whatsapp-orders');
  return JSON.parse(JSON.stringify(order));
}

export async function updatePaymentStatus(id: string, status: string) {
  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { paymentStatus: status }, { new: true });
  revalidatePath('/dashboard/online-orders');
  revalidatePath('/dashboard/whatsapp-orders');
  return JSON.parse(JSON.stringify(order));
}
