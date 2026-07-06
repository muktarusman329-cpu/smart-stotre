'use client';

import { useActivityTracking } from '@/hooks/useActivityTracking';

export function ActivityTracker() {
  useActivityTracking({
    enabled: true,
    interval: 30000, // 30 seconds
    trackPageChanges: true,
  });

  return null; // This component doesn't render anything
}
