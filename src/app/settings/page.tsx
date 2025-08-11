import { SettingsPage } from '@/components/settings/settings-page';
import { promises as fs } from 'fs';
import path from 'path';

async function getFactionGroups() {
    const baseDir = path.join(process.cwd(), 'data/paperwork-generators');
    let factionGroups = [];

    try {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });
        
        const directories = entries.filter(entry => entry.isDirectory());
        for (const dir of directories) {
            const manifestPath = path.join(baseDir, dir.name, 'manifest.json');
            try {
                const manifestContents = await fs.readFile(manifestPath, 'utf8');
                const manifest = JSON.parse(manifestContents);
                factionGroups.push(manifest);
            } catch (e) {
                // Ignore directories without a valid manifest
            }
        }
    } catch (error) {
        console.error("Could not read paperwork generators directory for factions:", error);
    }

    return factionGroups;
}

export default async function Settings() {
  const factionGroups = await getFactionGroups();

  return (
      <SettingsPage initialFactionGroups={factionGroups} />
  );
}
