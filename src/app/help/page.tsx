
import { HelpPage } from '@/components/help/help-page';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Help & Feedback',
};

async function getHelpData() {
    const { t } = await getTranslations();
    const helpPath = path.join(process.cwd(), 'data/help.json');
    const configPath = path.join(process.cwd(), 'data/config.json');

    const [helpFile, configFile] = await Promise.all([
        fs.readFile(helpPath, 'utf8'),
        fs.readFile(configPath, 'utf8')
    ]);

    const helpData = JSON.parse(helpFile);
    const config = JSON.parse(configFile);

    const translations = {
        headerTitle: t('help.header.title'),
        headerDescription: t('help.header.description'),
        faqTitle: t('help.faq.title'),
        faqPlaceholder: t('help.faq.searchPlaceholder'),
        faqEmpty: t('help.faq.empty'),
        ctaTitle: t('help.cta.title'),
        ctaDescription: t('help.cta.description'),
        ctaButton: t('help.cta.button'),
    };

    return { helpData, config, translations };
}


export default async function Help() {
  const { helpData, config, translations } = await getHelpData();

  return (
      <HelpPage
        initialResources={helpData.resources}
        initialFaqs={helpData.faq}
        initialConfig={config}
        translations={translations}
      />
  );
}
