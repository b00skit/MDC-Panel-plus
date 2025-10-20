
import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { PlusCircle, Pencil, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PaperworkGeneratorsList } from '@/components/paperwork-generators/paperwork-generators-list';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

async function getPaperworkData() {
    const baseDir = path.join(process.cwd(), 'data/paperwork-generators');
    let globalGenerators = [];
    let factionGroups = [];

    try {
        const entries = await fs.readdir(baseDir, { withFileTypes: true });

        // Process global generators (files at the root)
        const globalFiles = entries.filter(entry => entry.isFile() && path.extname(entry.name) === '.json');
        globalGenerators = await Promise.all(
            globalFiles.map(async (file) => {
                const filePath = path.join(baseDir, file.name);
                const fileContents = await fs.readFile(filePath, 'utf8');
                return JSON.parse(fileContents);
            })
        );
        
        // Process faction groups (directories)
        const directories = entries.filter(entry => entry.isDirectory());
        for (const dir of directories) {
            const groupDir = path.join(baseDir, dir.name);
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
        console.error("Could not read paperwork generators directory:", error);
    }

    // Sort faction groups by order
    factionGroups.sort((a, b) => (a.order || 99) - (b.order || 99));

    return { globalGenerators, factionGroups };
}


async function getUserForms() {
    const dirPath = path.join(process.cwd(), 'data/forms');
    try {
      const files = await fs.readdir(dirPath);
      const forms = await Promise.all(
        files.map(async (file) => {
          if (path.extname(file) === '.json') {
            const filePath = path.join(dirPath, file);
            const fileContents = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContents);
            const stats = await fs.stat(filePath);
            return {
                ...data,
                lastModified: stats.mtime.toLocaleString(),
            };
          }
          return null;
        })
      );
      return forms.filter(f => f !== null);
    } catch (error) {
      // It's okay if this directory doesn't exist
      return [];
    }
  }

async function getConfig() {
    const configPath = path.join(process.cwd(), 'data/config.json');
    const configFile = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configFile);
    return {
        isBuilderEnabled: config.ENABLE_FORM_BUILDER === true
    };
}

export default async function PaperworkGeneratorsPage() {
  const [{ globalGenerators, factionGroups }, userForms, { isBuilderEnabled }, { t }] = await Promise.all([
    getPaperworkData(),
    getUserForms(),
    getConfig(),
    getTranslations('paperworkGenerators'),
  ]);

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
         <div className="flex justify-between items-center">
             <PageHeader
                title={t('page.header.title')}
                description={t('page.header.description')}
            />
            {isBuilderEnabled && (
                <Button asChild>
                    <Link href="/paperwork-generators/builder">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('page.builderButton')}
                    </Link>
                </Button>
            )}
        </div>

        <PaperworkGeneratorsList globalGenerators={globalGenerators} factionGroups={factionGroups} />

        {isBuilderEnabled && (
            <>
                <Separator />
                <Card>
                    <CardHeader>
                        <CardTitle>{t('page.customForms.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 pt-4">
                        {userForms.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('page.customForms.table.title')}</TableHead>
                                        <TableHead>{t('page.customForms.table.description')}</TableHead>
                                        <TableHead>{t('page.customForms.table.lastModified')}</TableHead>
                                        <TableHead className="text-right">{t('page.customForms.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userForms.map((form: any) => (
                                        <TableRow key={form.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Badge variant="outline">{form.icon}</Badge> {form.title}
                                            </TableCell>
                                            <TableCell>{form.description}</TableCell>
                                            <TableCell>{form.lastModified}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link
                                                        href={`/paperwork-generators/form?type=user&id=${form.id}`}
                                                        title={t('page.customForms.table.useForm')}
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ): (
                            <p className="text-muted-foreground">{t('page.customForms.empty')}</p>
                        )}
                    </CardContent>
                </Card>
            </>
        )}
      </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('paperworkGenerators.page.documentTitle'),
    };
}
