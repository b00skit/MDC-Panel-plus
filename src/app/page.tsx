
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

async function getNoticeData() {
    try {
        const filePath = path.join(process.cwd(), 'data/notice.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        return data;
    } catch (error) {
        console.error("Could not read or parse notice.json:", error);
        return null;
    }
}


export default async function Home() {
  const notice = await getNoticeData();

  return (
      <DashboardPage notice={notice} />
  );
}
