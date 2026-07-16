'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Sale {
  _id: string;
  saleNumber?: string;
  customer?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mobile';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  status: 'completed' | 'pending' | 'cancelled';
  cashier?: string;
  branch?: string;
  createdAt?: string;
}

export interface SaleItem {
  product: string;
  productName?: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface SalesParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useSales(params?: SalesParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => apiGet<Sale[]>(`/api/sales?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => apiGet<Sale>(`/api/sales/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useSalesStats() {
  return useQuery({
    queryKey: ['sales-stats'],
    queryFn: () => apiGet<any>('/api/sales/stats'),
    select: (data) => data.data,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Sale>) => apiPost<Sale>('/api/sales', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
      toast.success('Sale completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to complete sale');
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sale> }) =>
      apiPut<Sale>(`/api/sales/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales-stats'] });
      toast.success('Sale updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to update sale');
    },
  });
}
