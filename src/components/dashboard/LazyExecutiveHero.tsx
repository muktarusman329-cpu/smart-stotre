'use client';

import dynamic from 'next/dynamic';
import { CardSkeleton } from '@/components/loading/CardSkeleton';

export const ExecutiveHero = dynamic(
  () => import('@/components/executive-hero').then((mod) => mod.default),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);
