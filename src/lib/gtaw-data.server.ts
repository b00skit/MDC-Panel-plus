import { promises as fs } from 'fs';
import path from 'path';
import config from '@/../data/config.json';
import type { GtawDataFile } from './gtaw-data';

const LOCAL_DATA_DIRECTORY = path.join(process.cwd(), 'data', 'gtaw-data');

export async function loadGtawData<T = unknown>(file: GtawDataFile): Promise<T> {
  if (config.DISABLE_GTAW_CDN === false) {
    const normalizedPath = path.normalize(file);
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      throw new Error('Invalid GTAW data file path.');
    }

    const filePath = path.join(LOCAL_DATA_DIRECTORY, normalizedPath);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  }

  const response = await fetch(`${config.CONTENT_DELIVERY_NETWORK}${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch GTAW data file: ${file}`);
  }

  return (await response.json()) as T;
}
