
import { AnnouncementsPage } from '@/components/announcements/announcements-page';
import { promises as fs } from 'fs';
import path from 'path';

async function getAnnouncementsData() {
    const filePath = path.join(process.cwd(), 'data/announcements.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.announcements;
}

export default async function Announcements() {
  const announcements = await getAnnouncementsData();
  
  return (
      <AnnouncementsPage initialAnnouncements={announcements} />
  );
}
