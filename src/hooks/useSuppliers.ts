'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  paymentTerms?: string;
  rating?: number;
  totalOrders?: number;
  totalPurchased?: number;
  lastOrder?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export interface SuppliersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useSuppliers(params?: SuppliersParams) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => apiGet<Supplier[]>(`/api/suppliers?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => apiGet<Supplier>(`/api/suppliers/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Supplier>) => apiPost<Supplier>('/api/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      apiPut<Supplier>(`/api/suppliers/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to delete supplier');
    },
  });
}
