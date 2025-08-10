
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function generateUniqueId(title: string) {
    if (!title) {
        return `form_${Date.now()}`;
    }
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9_]/g, '-').replace(/-+/g, '-').slice(0, 50);
    return `${sanitizedTitle}_${Date.now()}`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, icon, form, output } = body;

        if (!title || !description || !icon || !form || !output) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const id = generateUniqueId(title);

        const newGenerator = {
            id,
            title,
            description,
            icon,
            form,
            output,
        };

        const dirPath = path.join(process.cwd(), 'data/forms');
        const filePath = path.join(dirPath, `${id}.json`);
        
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(newGenerator, null, 4));

        return NextResponse.json({ message: 'Form created successfully', id: id }, { status: 201 });

    } catch (error) {
        console.error('Error saving form:', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
