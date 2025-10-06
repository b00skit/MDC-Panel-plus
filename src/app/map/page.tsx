import { MapPage } from '@/components/map/map-page';
import { getTranslations } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('map.pageTitle'),
    };
}

export default function Map() {
  return <MapPage />;
}
