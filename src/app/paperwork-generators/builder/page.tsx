import { PaperworkGeneratorBuilder } from '@/components/paperwork-generators/paperwork-generator-builder';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

async function getConfig() {
    const configPath = path.join(process.cwd(), 'data/config.json');
    const configFile = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configFile);
    return {
        isBuilderEnabled: config.ENABLE_FORM_BUILDER === true
    };
}


export default async function PaperworkGeneratorBuilderPage() {
    const { isBuilderEnabled } = await getConfig();

    if (!isBuilderEnabled) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="text-2xl font-bold">Form Builder is disabled.</h1>
                <p>Please contact an administrator to enable this feature.</p>
            </div>
        )
    }

  return (
      <PaperworkGeneratorBuilder />
  );
}

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('paperworkGenerators.builder.pageTitle'),
    };
}
