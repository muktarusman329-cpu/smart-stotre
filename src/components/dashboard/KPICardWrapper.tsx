'use client';

import { KPICard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LucideIcon } from 'lucide-react';

interface KPICardWrapperProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
  iconColor: string;
  trend?: number;
  isLoading?: boolean;
  error?: string;
}

export function KPICardWrapper({
  title,
  value,
  change,
  changeType,
  icon,
  iconColor,
  trend,
  isLoading,
  error,
}: KPICardWrapperProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="bg-card rounded-xl border border-destructive/50 p-6">
          <p className="text-sm text-destructive">Failed to load</p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <KPICard
        title={title}
        value={value}
        change={change}
        changeType={changeType}
        icon={icon}
        iconColor={iconColor}
        trend={trend}
      />
    </ErrorBoundary>
  );
}
