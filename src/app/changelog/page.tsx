import { ChangelogPage } from '@/components/changelog/changelog-page';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('changelog.pageTitle'),
    };
}

async function getChangelogData() {
    const filePath = path.join(process.cwd(), 'data/changelog.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.changelogs;
}

export default async function Changelog() {
  const changelogs = await getChangelogData();
  
  return (
      <ChangelogPage initialChangelogs={changelogs} />
  );
}
