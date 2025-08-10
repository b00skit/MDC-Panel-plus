import { ChangelogPage } from '@/components/changelog/changelog-page';
import { promises as fs } from 'fs';
import path from 'path';

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
