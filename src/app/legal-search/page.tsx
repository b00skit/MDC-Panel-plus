import { LegalSearchPage } from '@/components/legal-search/legal-search-page';
import { getTranslations } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('legalSearch.pageTitle'),
    };
}

export default function Page() {
  return <LegalSearchPage />;
}
