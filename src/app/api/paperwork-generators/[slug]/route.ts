
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  if (!slug) {
    return NextResponse.json({ error: 'Generator not specified' }, { status: 400 });
  }

  // Basic validation to prevent path traversal
  if (slug.includes('..')) {
      return NextResponse.json({ error: 'Invalid generator name' }, { status: 400 });
  }
  
  try {
    const filePath = path.join(process.cwd(), 'data/paperwork-generators', `${slug}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Could not read or parse file for slug: ${slug}`, error);
    return NextResponse.json({ error: 'Generator not found' }, { status: 404 });
  }
}
