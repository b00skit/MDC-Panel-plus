
'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import L from 'leaflet';
import 'leaflet-search';

// You might need to create a simple CSS file for leaflet-search or import it if it's in your node_modules
// For now, let's assume some basic styles are needed and can be added later.
// import 'leaflet-search/dist/leaflet-search.min.css';


export function MapPage() {
  const [streets, setStreets] = useState([]);

  useEffect(() => {
    fetch('/data/streets.json')
      .then(res => res.json())
      .then(data => setStreets(data))
      .catch(err => console.error("Failed to fetch streets data:", err));
  }, []);

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
        title="Interactive Map"
        description="An interactive map of Los Santos & Blaine County."
      />
      <div className="h-[calc(100vh-220px)] w-full" style={{ backgroundColor: '#0fa8d2', borderRadius: '0.5rem' }}>
        <MapComponent streets={streets} />
      </div>
    </div>
  );
}
