import type { Locale } from './config';
import { promises as fs } from 'fs';
import path from 'path';

type Dictionary = Record<string, unknown>;

async function readDictionaryFile(locale: Locale): Promise<Dictionary> {
    const filePath = path.join(process.cwd(), 'data', 'i18n', `${locale}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}


export async function getDictionary(locale: Locale): Promise<Dictionary> {
    try {
        return await readDictionaryFile(locale);
    } catch (error) {
        console.warn(`Could not load '${locale}' dictionary, falling back to 'en'.`, error);
        return readDictionaryFile('en');
    }
}

export type { Dictionary };
