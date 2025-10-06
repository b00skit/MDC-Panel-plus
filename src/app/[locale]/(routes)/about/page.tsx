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
import { getDictionary } from '@/i18n/get-dictionary';
import { createTranslator, getFromDictionary } from '@/i18n/translator';
import { isLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';

async function getConfig() {
  const configPath = path.join(process.cwd(), 'data/config.json');
  const file = await fs.readFile(configPath, 'utf8');
  return JSON.parse(file);
}

const techInfo = [
  { key: 'SITE_VERSION', dictionaryKey: 'about.tech.table.siteVersion' },
  { key: 'CACHE_VERSION', dictionaryKey: 'about.tech.table.cacheVersion' },
  { key: 'LOCAL_STORAGE_VERSION', dictionaryKey: 'about.tech.table.localStorageVersion' },
  { key: 'CONTENT_DELIVERY_NETWORK', dictionaryKey: 'about.tech.table.cdn' },
  { key: 'URL_GITHUB', dictionaryKey: 'about.tech.table.github' },
  { key: 'URL_DISCORD', dictionaryKey: 'about.tech.table.discord' },
] as const;

type AboutPageParams = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: AboutPageParams): Promise<Metadata> {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const t = createTranslator(dictionary);

  return {
    title: t('about.metadataTitle'),
  };
}

export default async function AboutPage({ params }: AboutPageParams) {
  const { locale } = params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [config, dictionary] = await Promise.all([
    getConfig(),
    getDictionary(locale),
  ]);

  const t = createTranslator(dictionary);
  const about = dictionary.about;

  const tableRows = techInfo.map(({ key, dictionaryKey }) => {
    const details = getFromDictionary<{ label: string; tooltip: string }>(
      dictionary,
      dictionaryKey
    );

    return {
      key,
      label: details.label,
      tooltip: details.tooltip,
    };
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <PageHeader
        title={about.header.title}
        description={about.header.description}
      />

      <Card>
        <CardHeader>
          <CardTitle>{about.intro.heading}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
          {about.intro.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{about.tech.heading}</CardTitle>
          <CardDescription>{about.tech.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <Code className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">{about.tech.cards.openSourceTitle}</h3>
                <p
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: t('about.tech.cards.openSourceText', {
                      github: config.URL_GITHUB,
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Bot className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">{about.tech.cards.aiTitle}</h3>
                <p className="text-muted-foreground">{about.tech.cards.aiText}</p>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <TooltipProvider>
              <Table>
                <TableBody>
                  {tableRows.map(({ key, label, tooltip }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{label}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            key === 'SITE_VERSION' &&
                              'text-green-600 border-green-600/50 bg-green-500/10'
                          )}
                        >
                          {config[key as keyof typeof config] || t('common.notSet')}
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
          <CardTitle>{about.support.heading}</CardTitle>
          <CardDescription>{about.support.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: about.support.body }}
          />
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href={config.URL_FOUNDER} target="_blank" rel="noopener noreferrer">
                <HandHeart className="mr-2" /> {about.support.founderCta}
              </Link>
            </Button>
            <Button asChild>
              <Link href={config.URL_KOFI} target="_blank" rel="noopener noreferrer">
                <Heart className="mr-2" /> {about.support.donateCta}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{about.contact.heading}</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: t('about.contact.body', {
                contact: config.SITE_DISCORD_CONTACT,
              }),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
