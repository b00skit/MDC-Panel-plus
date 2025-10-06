import { SimplifiedPenalCodePage } from '@/components/penal-code/simplified-penal-code-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simplified Penal Code',
};

export default function SimplifiedPenalCode() {
  return (
      <SimplifiedPenalCodePage />
  );
}
