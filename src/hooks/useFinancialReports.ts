'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet, ApiResponse } from '@/lib/api-client';

export interface FinancialMetrics {
  totalRevenue: number;
  netProfit: number;
  totalExpenses: number;
  profitMargin: number;
  revenueChange: number;
  profitChange: number;
  expensesChange: number;
  marginChange: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface RevenueByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialData {
  metrics: FinancialMetrics;
  expenseBreakdown: ExpenseBreakdown[];
  revenueByCategory: RevenueByCategory[];
}

export interface FinancialParams {
  startDate?: string;
  endDate?: string;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

export function useFinancialReports(params?: FinancialParams) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.dateRange) queryParams.append('dateRange', params.dateRange);

  return useQuery({
    queryKey: ['financial-reports', params],
    queryFn: () => apiGet<FinancialData>(`/api/financial-reports?${queryParams}`),
    select: (data) => data.data,
  });
}
