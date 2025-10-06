import { SimplifiedPenalCodePage } from '@/components/penal-code/simplified-penal-code-page';
import { getTranslations } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('simplifiedPenalCode.page.documentTitle'),
    };
}

export default function SimplifiedPenalCode() {
  return (
      <SimplifiedPenalCodePage />
  );
}
