import { MapPage } from '@/components/map/map-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Map',
};

export default function Map() {
  return <MapPage />;
}
