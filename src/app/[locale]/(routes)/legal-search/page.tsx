import { LegalSearchPage } from '@/components/legal-search/legal-search-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Search',
};

export default function Page() {
  return <LegalSearchPage />;
}
