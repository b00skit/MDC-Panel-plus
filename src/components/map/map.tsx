
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

const Map = () => {
  return <MapComponent />;
};

export default Map;
