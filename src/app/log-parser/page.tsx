import { LogParserPage } from '@/components/log-parser/log-parser-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Parser',
};

export default function Page() {
  return <LogParserPage />;
}
