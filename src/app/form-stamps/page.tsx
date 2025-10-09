
import { promises as fs } from 'fs';
import path from 'path';
import { PageHeader } from '@/components/dashboard/page-header';
import { getTranslations } from '@/lib/i18n/server';
import { PaperworkGeneratorsList } from '@/components/paperwork-generators/paperwork-generators-list';
import type { Metadata } from 'next';

async function getFormStampsData() {
    const baseDir = path.join(process.cwd(), 'data/form-stamps');
    let globalGenerators = [];
    let factionGroups = [];

    try {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });

        const globalFiles = entries.filter(entry => entry.isFile() && path.extname(entry.name) === '.json');
        globalGenerators = await Promise.all(
            globalFiles.map(async (file) => {
                const filePath = path.join(baseDir, file.name);
                const fileContents = await fs.readFile(filePath, 'utf8');
                return JSON.parse(fileContents);
            })
        );
        
        const directories = entries.filter(entry => entry.isDirectory());
        for (const dir of directories) {
            const groupDir = path.join(baseDir, dir.name);
            if (dir.name === 'img' || dir.name === 'font') continue; // Skip asset directories
            const manifestPath = path.join(groupDir, 'manifest.json');
            try {
                const manifestContents = await fs.readFile(manifestPath, 'utf8');
                const manifest = JSON.parse(manifestContents);

                if (manifest.url) {
                    continue;
                }

                const groupFiles = await fs.readdir(groupDir);
                const generatorFiles = groupFiles.filter(file => path.extname(file) === '.json' && file !== 'manifest.json');
                
                const generators = await Promise.all(
                    generatorFiles.map(async (file) => {
                        const filePath = path.join(groupDir, file);
                        const fileContents = await fs.readFile(filePath, 'utf8');
                        return JSON.parse(fileContents);
                    })
                );

                factionGroups.push({ ...manifest, generators });
            } catch (e) {
                console.error(`Skipping directory ${dir.name} due to missing or invalid manifest.json`, e);
            }
        }
    } catch (error) {
        console.error("Could not read form stamps directory:", error);
    }

    return { globalGenerators, factionGroups };
}

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('navigation.formStamps'),
    };
}

export default async function FormStampsPage() {
    const [{ globalGenerators, factionGroups }, { t }] = await Promise.all([
        getFormStampsData(),
        getTranslations('navigation'),
    ]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <PageHeader
                title={t('formStamps')}
                description="Select a form stamp template to use."
            />
            <PaperworkGeneratorsList 
                globalGenerators={globalGenerators} 
                factionGroups={factionGroups} 
                basePath="/form-stamps"
            />
        </div>
    );
}
