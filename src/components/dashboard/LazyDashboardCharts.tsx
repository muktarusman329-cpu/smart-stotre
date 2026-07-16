'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';

export const DashboardCharts = dynamic(
  () => import('@/components/dashboard-charts').then((mod) => mod.default),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
