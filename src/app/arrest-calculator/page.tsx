import { ArrestCalculatorPage } from '@/components/arrest-calculator/arrest-calculator-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arrest Calculator',
};

export default function ArrestCalculator() {
  return (
      <ArrestCalculatorPage />
  );
}
