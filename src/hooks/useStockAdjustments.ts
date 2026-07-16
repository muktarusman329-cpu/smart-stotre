'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { toast } from 'sonner';

export interface StockAdjustment {
  _id: string;
  productId: string;
  productName: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  performedBy: string;
  date: string;
  createdAt?: string;
}

export interface StockAdjustmentsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useStockAdjustments(params?: StockAdjustmentsParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['stock-adjustments', params],
    queryFn: () => apiGet<StockAdjustment[]>(`/api/stock-adjustments?${queryParams.toString()}`),
    select: (data) => data.data ?? [],
  });
}

export function useStockAdjustment(id: string) {
  return useQuery({
    queryKey: ['stock-adjustment', id],
    queryFn: () => apiGet<StockAdjustment>(`/api/stock-adjustments/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StockAdjustment>) =>
      apiPost<StockAdjustment>('/api/stock-adjustments', data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      toast.success('Stock adjustment created successfully');
    },

    onError: (error: any) => {
      toast.error(error?.error || 'Failed to create stock adjustment');
    },
  });
}

export function useApproveStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost(`/api/stock-adjustments/${id}/approve`, {}),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({
        queryKey: ['stock-adjustment', id],
      });
      toast.success('Stock adjustment approved successfully');
    },

    onError: (error: any) => {
      toast.error(error?.error || 'Failed to approve stock adjustment');
    },
  });
}

export function useRejectStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost(`/api/stock-adjustments/${id}/reject`, {}),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
      queryClient.invalidateQueries({
        queryKey: ['stock-adjustment', id],
      });
      toast.success('Stock adjustment rejected successfully');
    },

    onError: (error: any) => {
      toast.error(error?.error || 'Failed to reject stock adjustment');
    },
  });
}
