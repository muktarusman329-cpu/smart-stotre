'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

export interface InventoryItem {
  _id: string;
  product: string;
  productName?: string;
  quantity: number;
  location?: string;
  branch?: string;
  lastUpdated?: string;
}

export interface InventoryParams {
  search?: string;
  branch?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export function useInventory(params?: InventoryParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.branch) queryParams.append('branch', params.branch);
  if (params?.lowStock) queryParams.append('lowStock', 'true');
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => apiGet<InventoryItem[]>(`/api/inventory?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => apiGet<any>('/api/inventory/stats'),
    select: (data) => data.data,
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { productId: string; quantity: number; type: 'add' | 'remove'; reason?: string }) =>
      apiPost('/api/inventory/adjust', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Inventory adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to adjust inventory');
    },
  });
}
