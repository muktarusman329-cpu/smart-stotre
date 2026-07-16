'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Order {
  _id: string;
  orderNumber?: string;
  customer?: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: string;
  productName?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrdersParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useOrders(params?: OrdersParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiGet<Order[]>(`/api/orders?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiGet<Order>(`/api/orders/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useOrdersStats() {
  return useQuery({
    queryKey: ['orders-stats'],
    queryFn: () => apiGet<any>('/api/orders/stats'),
    select: (data) => data.data,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Order>) => apiPost<Order>('/api/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      toast.success('Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to create order');
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
      apiPut<Order>(`/api/orders/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      toast.success('Order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to update order');
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      toast.success('Order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to delete order');
    },
  });
}
