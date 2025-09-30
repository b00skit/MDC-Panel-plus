import { NextResponse } from 'next/server';
import type { SelectedCharge } from '@/stores/charge-store';
import { calculateArrest } from '@/lib/arrest-calculator';

export async function POST(req: Request) {
  try {
    const { report, isParoleViolator } = await req.json();
    if (!Array.isArray(report)) {
      return NextResponse.json({ error: 'Invalid report data' }, { status: 400 });
    }
    const result = await calculateArrest(report as SelectedCharge[], isParoleViolator);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Arrest calculation failed:', err);
    return NextResponse.json({ error: 'Failed to calculate arrest' }, { status: 500 });
  }
}

