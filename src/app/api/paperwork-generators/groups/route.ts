import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { FactionGroup } from '@/stores/settings-store';

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'data/paperwork-generators');
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    const groups: FactionGroup[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(baseDir, entry.name, 'manifest.json');
      try {
        const manifestContents = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContents);
        groups.push(manifest);
      } catch (e) {
        console.error(`Skipping directory ${entry.name} due to missing or invalid manifest.json`, e);
      }
    }

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Could not read paperwork generators directory:', error);
    return NextResponse.json({ error: 'Failed to load groups' }, { status: 500 });
  }
}

