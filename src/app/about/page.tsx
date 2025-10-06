
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart, Heart, Code, Bot, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { getTranslations } from '@/lib/i18n/server';
import { getDictionaryValue } from '@/lib/i18n/utils';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t('about.pageTitle'),
  };
}

async function getConfig() {
    const configPath = path.join(process.cwd(), 'data/config.json');
    const file = await fs.readFile(configPath, 'utf8');
    return JSON.parse(file);
}

const techInfo = [
    { key: 'SITE_VERSION', translationKey: 'siteVersion' },
    { key: 'CACHE_VERSION', translationKey: 'cacheVersion' },
    { key: 'LOCAL_STORAGE_VERSION', translationKey: 'localStorageVersion' },
    { key: 'CONTENT_DELIVERY_NETWORK', translationKey: 'cdn' },
    { key: 'URL_GITHUB', translationKey: 'github' },
    { key: 'URL_DISCORD', translationKey: 'discord' },
];

export default async function AboutPage() {
    const config = await getConfig();
    const { t, dictionary } = await getTranslations();
    const overviewParagraphs = (getDictionaryValue(dictionary, 'about.overview.paragraphs') as string[]) || [];
    const openSourceDescription = t('about.tech.cards.openSource.description', {
        link: `<a href="${config.URL_GITHUB}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${t('about.tech.cards.openSource.linkLabel')}</a>`
    });
    const supportIntro = t('about.support.intro', {
        gtaWorld: `<a href="https://gta.world/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">GTA:World</a>`,
        founder: `<strong>CXDezign</strong>`,
    });
    const contactDescription = t('about.contact.description', {
        maintainer: `<strong>${config.SITE_DISCORD_CONTACT}</strong>`,
    });
    const renderHtml = (content: string) => ({ __html: content });

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <PageHeader
          title={t('about.header.title')}
          description={t('about.header.description')}
        />

        <Card>
            <CardHeader>
                <CardTitle>{t('about.overview.title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                {overviewParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('about.tech.title')}</CardTitle>
                 <CardDescription>{t('about.tech.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Code className="h-8 w-8 text-primary mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold">{t('about.tech.cards.openSource.title')}</h3>
                            <p className="text-muted-foreground" dangerouslySetInnerHTML={renderHtml(openSourceDescription)} />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Bot className="h-8 w-8 text-primary mt-1 flex-shrink-0"/>
                        <div>
                            <h3 className="font-semibold">{t('about.tech.cards.ai.title')}</h3>
                            <p className="text-muted-foreground">{t('about.tech.cards.ai.description')}</p>
                        </div>
                    </div>
                </div>
                 <div className="border rounded-lg p-4">
                    <TooltipProvider>
                        <Table>
                            <TableBody>
                                {techInfo.map(({ key, translationKey }) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{t(`about.tech.table.${translationKey}.label`)}</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t(`about.tech.table.${translationKey}.tooltip`)}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    key === 'SITE_VERSION'
                                                    && 'text-green-600 border-green-600/50 bg-green-500/10'
                                                )}
                                            >
                                                {config[key] || t('about.tech.table.notSet')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('about.support.title')}</CardTitle>
                 <CardDescription>{t('about.support.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground" dangerouslySetInnerHTML={renderHtml(supportIntro)} />
                <div className="flex flex-wrap gap-4">
                     <Button asChild variant="outline">
                        <Link href={config.URL_FOUNDER} target="_blank" rel="noopener noreferrer">
                           <HandHeart className="mr-2" /> {t('about.support.buttons.supportFounder')}
                        </Link>
                    </Button>
                     <Button asChild>
                        <Link href={config.URL_KOFI} target="_blank" rel="noopener noreferrer">
                           <Heart className="mr-2" /> {t('about.support.buttons.donate')}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t('about.contact.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground" dangerouslySetInnerHTML={renderHtml(contactDescription)} />
            </CardContent>
        </Card>
      </div>
  );
}
