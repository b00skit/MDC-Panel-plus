import { PaperworkSubmitPage } from '@/components/paperwork-submit/paperwork-submit-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paperwork Submission',
};

export default function PaperworkSubmit() {
  return (
      <PaperworkSubmitPage />
  );
};
