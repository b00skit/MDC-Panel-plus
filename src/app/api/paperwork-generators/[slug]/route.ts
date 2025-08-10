
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const searchParams = request.nextUrl.searchParams;
  const formType = searchParams.has('f') ? 'user' : 'static';
  const formId = searchParams.has('f') ? searchParams.get('f') : slug;

  if (!formId) {
    return NextResponse.json({ error: 'Generator not specified' }, { status: 400 });
  }

  // Basic validation to prevent path traversal
  if (formId.includes('..')) {
      return NextResponse.json({ error: 'Invalid generator name' }, { status: 400 });
  }
  
  const basePath = formType === 'user' ? 'data/forms' : 'data/paperwork-generators';
  
  try {
    const filePath = path.join(process.cwd(), basePath, `${formId}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Could not read or parse file for ID: ${formId}`, error);
    return NextResponse.json({ error: 'Generator not found' }, { status: 404 });
  }
}
