
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getTranslations();
    return {
        title: t('credits.pageTitle'),
    };
}

async function getCredits() {
    const filePath = path.join(process.cwd(), 'data/credits.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents).credits;
    } catch (error) {
        console.error("Could not read or parse credits.json:", error);
        return [];
    }
}


export default async function CreditsPage() {
    const credits = await getCredits();
    const { t } = await getTranslations();

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader
          title={t('credits.header.title')}
          description={t('credits.header.description')}
        />

        <div className="space-y-6">
            <p className="text-lg text-muted-foreground">{t('credits.intro')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credits.map((credit: any, index: number) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">{credit.name}</CardTitle>
                            <CardDescription>{credit.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{credit.contribution}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
  );
}
