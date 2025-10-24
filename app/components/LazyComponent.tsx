'use client';

import { lazy, Suspense } from 'react';

// Lazy load components that are not critical for initial render
const LazyInstagram = lazy(() => import('lucide-react').then(module => ({ default: module.Instagram })));

export function LazyInstagramComponent() {
  return (
    <Suspense fallback={<div className="h-5 w-5" />}>
      <LazyInstagram className="h-5 w-5" />
    </Suspense>
  );
}
