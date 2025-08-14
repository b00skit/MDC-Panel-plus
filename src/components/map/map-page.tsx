'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MapPage() {
  const MapComponent = useMemo(
    () =>
      dynamic(() => import('@/components/map/map-component'), {
        loading: () => <Skeleton className="h-[600px] w-full rounded-lg" />,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="container mx-auto h-full p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Streets Guide"
        description="An interactive map of Los Santos & Blaine County."
      />
      <div className="h-[calc(100vh-220px)] w-full">
        <MapComponent />
      </div>
    </div>
  );
}
