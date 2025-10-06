import { CaselawPage } from '@/components/caselaw/caselaw-page';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('caselaw.pageTitle'),
    };
}

async function getCaselawData() {
    const caselawsPath = path.join(process.cwd(), 'data/caselaws.json');
    const resourcesPath = path.join(process.cwd(), 'data/resources.json');
    const configPath = path.join(process.cwd(), 'data/config.json');

    const [caselawsFile, resourcesFile, configFile] = await Promise.all([
        fs.readFile(caselawsPath, 'utf8'),
        fs.readFile(resourcesPath, 'utf8'),
        fs.readFile(configPath, 'utf8')
    ]);

    const caselaws = JSON.parse(caselawsFile);
    const resources = JSON.parse(resourcesFile);
    const config = JSON.parse(configFile);

    return { caselaws, resources, config };
}

export default async function Caselaw() {
  const { caselaws, resources, config } = await getCaselawData();
  
  return (
      <CaselawPage 
        initialResources={resources.resources} 
        initialCaselaws={caselaws.caselaws} 
        initialConfig={config} 
      />
  );
}
