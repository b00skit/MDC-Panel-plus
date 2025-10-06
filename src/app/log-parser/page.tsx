import { LogParserPage } from '@/components/log-parser/log-parser-page';
import { getTranslations } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('logParser.pageTitle'),
    };
}

export default function Page() {
  return <LogParserPage />;
}
