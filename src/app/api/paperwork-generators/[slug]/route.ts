
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const searchParams = request.nextUrl.searchParams;
  
  const formType = searchParams.get('type') as 'user' | 'static' | null;
  const formId = searchParams.get('id');
  const groupId = searchParams.get('group_id');

  if (!formId || !formType) {
    return NextResponse.json({ error: 'Generator not specified correctly' }, { status: 400 });
  }

  // Basic validation to prevent path traversal
  if (formId.includes('..') || (groupId && groupId.includes('..'))) {
      return NextResponse.json({ error: 'Invalid generator name' }, { status: 400 });
  }
  
  let basePath = 'data';
  if(formType === 'user'){
    basePath = path.join(basePath, 'forms');
  } else {
    basePath = path.join(basePath, 'paperwork-generators');
    if(groupId) {
        basePath = path.join(basePath, groupId);
    }
  }

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
