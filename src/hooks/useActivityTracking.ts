import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UseActivityTrackingOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  trackPageChanges?: boolean;
}

export function useActivityTracking(options: UseActivityTrackingOptions = {}) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    trackPageChanges = true,
  } = options;

  const { data: session } = useSession();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = async (action?: string, details?: Record<string, any>) => {
    if (!session?.user?.id || !enabled) return;

    try {
      await fetch('/api/user-activity/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          action,
          details,
        }),
      });
    } catch (error) {
      console.error('Activity tracking heartbeat failed:', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.id || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat('session_start', { page: pathname });

    // Set up periodic heartbeat
    intervalRef.current = setInterval(() => {
      sendHeartbeat('heartbeat');
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.user?.id, enabled, interval]);

  // Track page changes
  useEffect(() => {
    if (!trackPageChanges || !session?.user?.id || !enabled) return;

    if (previousPathRef.current !== pathname) {
      sendHeartbeat('page_navigation', {
        from: previousPathRef.current,
        to: pathname,
      });
      previousPathRef.current = pathname;
    }
  }, [pathname, trackPageChanges, session?.user?.id, enabled]);

  // Function to manually log an action
  const logAction = (action: string, details?: Record<string, any>) => {
    sendHeartbeat(action, details);
  };

  return { logAction };
}
