'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, ApiResponse } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Backup {
  _id: string;
  name: string;
  size: string;
  type: 'manual' | 'scheduled';
  createdAt: string;
}

export interface BackupsParams {
  page?: number;
  limit?: number;
}

export function useBackups(params?: BackupsParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['backups', params],
    queryFn: () => apiGet<Backup[]>(`/api/backup?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => apiPost<Backup>('/api/backup', { action: 'create', ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup created successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to create backup');
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backupId: string) => apiPost('/api/backup', { action: 'restore', backupId }),
    onSuccess: () => {
      toast.success('Backup restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to restore backup');
    },
  });
}

export function useDeleteBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backupId: string) => apiDelete(`/api/backup/${backupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to delete backup');
    },
  });
}
