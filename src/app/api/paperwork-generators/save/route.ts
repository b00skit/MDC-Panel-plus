
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function sanitizeFilename(name: string) {
    if (!name) {
        // Fallback for untitled forms
        return `form_${Date.now()}`;
    }
    return name.toLowerCase().replace(/[^a-z0-9_]/g, '-').replace(/-+/g, '-').slice(0, 50);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, icon, form, output } = body;

        if (!title || !description || !icon || !form || !output) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const id = sanitizeFilename(title);

        const newGenerator = {
            id,
            title,
            description,
            icon,
            form,
            output,
        };

        const dirPath = path.join(process.cwd(), 'data/paperwork-generators');
        const filePath = path.join(dirPath, `${id}.json`);
        
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(newGenerator, null, 4));

        return NextResponse.json({ message: 'Form created successfully', id: id }, { status: 201 });

    } catch (error) {
        console.error('Error saving form:', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
