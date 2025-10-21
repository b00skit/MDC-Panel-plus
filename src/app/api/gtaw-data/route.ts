import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { shouldUseLocalGtawData } from '@/lib/gtaw-data';

const DATA_DIRECTORY = path.join(process.cwd(), 'data', 'gtaw-data');

export async function GET(request: Request) {
  if (!shouldUseLocalGtawData) {
    return NextResponse.json({ error: 'Local GTAW data is disabled.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter.' }, { status: 400 });
  }

  const normalizedPath = path.normalize(file);
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath) || !normalizedPath.endsWith('.json')) {
    return NextResponse.json({ error: 'Invalid file parameter.' }, { status: 400 });
  }

  const filePath = path.join(DATA_DIRECTORY, normalizedPath);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Requested file was not found.' }, { status: 404 });
  }
}
