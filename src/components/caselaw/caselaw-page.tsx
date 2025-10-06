
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, TrafficCone, BookOpen, Landmark, ShieldCheck, ExternalLink, Copy, Car } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { FeedbackDialog } from '@/components/dashboard/feedback-dialog';
import { useToast } from '@/hooks/use-toast';
import { useI18n, useScopedI18n } from '@/lib/i18n/client';

type Resource = {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'link' | 'dialog' | 'default';
    href?: string;
    content?: {
        title: string;
        body: string;
    };
    button_text?: string;
    button_action?: 'external_link' | 'copy';
    button_content?: string;
};

type Caselaw = {
    id: string;
    case: string;
    summary: string;
    implication: string;
    jurisdiction: 'federal' | 'federal-civil' | 'local-supreme' | 'local-appeals' | 'local-appeals-civil';
    year: string;
    source?: string;
};

type Config = {
    [key: string]: string;
}

const ICONS: { [key: string]: React.ReactNode } = {
    BookOpen: <BookOpen className="w-8 h-8 text-primary" />,
    Landmark: <Landmark className="w-8 h-8 text-primary" />,
    ShieldCheck: <ShieldCheck className="w-8 h-8 text-primary" />,
    Car: <Car className="w-8 h-8 text-primary" />,
    TrafficCone: <TrafficCone className='w-8 h-8 text-primary'/>,
};

const jurisdictionMap: { [key: string]: string } = {
    'federal': 'jurisdictions.federal',
    'federal-civil': 'jurisdictions.federalCivil',
    'local-supreme': 'jurisdictions.localSupreme',
    'local-appeals': 'jurisdictions.localAppeals',
    'local-appeals-civil': 'jurisdictions.localAppealsCivil',
};


const SimpleMarkdownParser = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>');

    const lines = html.split('\n');
    let inList = false;
    html = lines.map(line => {
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const liContent = `<li>${line.substring(2)}</li>`;
            if (!inList) {
                inList = true;
                return `<ul>${liContent}`;
            }
            return liContent;
        } else {
            if (inList) {
                inList = false;
                return `</ul><p>${line}</p>`;
            }
            return `<p>${line}</p>`;
        }
    }).join('');

    if (inList) {
        html += '</ul>';
    }

    return html.replace(/<p><\/p>/g, '<br/>');
};

const ResourceCard = ({ resource, config }: { resource: Resource, config: Config | null }) => {
    const { toast } = useToast();
    const t = useScopedI18n('caselaw');

    const handleCopy = () => {
        if (resource.button_content) {
            navigator.clipboard.writeText(resource.button_content);
            toast({
                title: t('toasts.copied.title'),
                description: t('toasts.copied.description', { title: resource.title }),
            });
        }
    };

    const cardContent = (
      <Card className="h-full flex flex-col flex-start transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            {ICONS[resource.icon] || <BookOpen className="w-8 h-8 text-primary" />}
            {resource.type === 'link' && <ExternalLink className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />}
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-xl">{resource.title}</CardTitle>
          <CardDescription className="mt-2">{resource.description}</CardDescription>
        </CardContent>
        {resource.button_text && (
            <CardFooter>
                {resource.button_action === 'copy' && (
                    <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4" />{resource.button_text}</Button>
                )}
                {resource.button_action === 'external_link' && resource.button_content && (
                     <Button asChild><a href={resource.button_content} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />{resource.button_text}</a></Button>
                )}
            </CardFooter>
        )}
      </Card>
    );
  
    if (resource.type === 'link' && resource.href && config) {
      const url = config[resource.href] || '#';
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="group block h-full">
          {cardContent}
        </a>
      );
    }
  
    if (resource.type === 'dialog' && resource.content) {
      const parsedBody = SimpleMarkdownParser(resource.content.body);
      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="group block h-full cursor-pointer">{cardContent}</div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{resource.content.title}</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none py-4" dangerouslySetInnerHTML={{ __html: parsedBody }} />
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
    }
  
    return (
        <div className="group block h-full cursor-pointer">{cardContent}</div>
    );
  };
  

const CaselawCard = ({ caselaw }: { caselaw: Caselaw }) => {
    const isFederal = caselaw.jurisdiction.startsWith('federal');
    const t = useScopedI18n('caselaw');
    const jurisdictionLabel = t(jurisdictionMap[caselaw.jurisdiction] || 'jurisdictions.unknown');

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="pr-2">{caselaw.case} ({caselaw.year})</CardTitle>
                    <Badge variant={isFederal ? 'default' : 'secondary'} className="text-right whitespace-nowrap">
                        {jurisdictionLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-muted-foreground">{t('cards.summary')}</h4>
                    <p>{caselaw.summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-muted-foreground">{t('cards.implication')}</h4>
                    <p>{caselaw.implication}</p>
                </div>
                {caselaw.source && (
                    <div>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <a href={caselaw.source} target='_blank' rel="noopener noreferrer">
                                {t('cards.viewSource')} <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const SkeletonGrid = ({ count = 3, CardComponent = Card }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <CardComponent key={i} className="h-[190px]">
                <CardHeader><Skeleton className="h-8 w-8" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </CardComponent>
        ))}
    </div>
);

type CaselawPageProps = {
    initialResources: Resource[];
    initialCaselaws: Caselaw[];
    initialConfig: Config;
}

export function CaselawPage({ initialResources, initialCaselaws, initialConfig }: CaselawPageProps) {
    const [resources] = useState<Resource[]>(initialResources);
    const [caselaws] = useState<Caselaw[]>(initialCaselaws);
    const [config] = useState<Config | null>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [jurisdictionFilter, setJurisdictionFilter] = useState<'all' | 'federal' | 'local'>('all');
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
    const t = useScopedI18n('caselaw');

    const filteredCaselaws = useMemo(() => {
        if (!caselaws) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        
        return caselaws.filter(law => {
            const searchMatch = law.case.toLowerCase().includes(lowercasedFilter) ||
                                law.summary.toLowerCase().includes(lowercasedFilter) ||
                                law.implication.toLowerCase().includes(lowercasedFilter);

            const jurisdictionMatch = jurisdictionFilter === 'all' || law.jurisdiction.startsWith(jurisdictionFilter);

            return searchMatch && jurisdictionMatch;
        });
    }, [caselaws, searchTerm, jurisdictionFilter]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />

            <PageHeader
                title={t('header.title')}
                description={t('header.description')}
            />
            
            {loading ? <SkeletonGrid count={3} CardComponent={Card} /> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {resources.map(resource => <ResourceCard key={resource.id} resource={resource} config={config} />)}
             </div>
            }
            

            <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('database.title')}</h2>
                <p className="text-muted-foreground">{t('database.description')}</p>
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t('database.searchPlaceholder')}
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                </div>
                 <div className="flex gap-2">
                    <Button variant={jurisdictionFilter === 'all' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('all')}>{t('database.filters.all')}</Button>
                    <Button variant={jurisdictionFilter === 'federal' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('federal')}>{t('database.filters.federal')}</Button>
                    <Button variant={jurisdictionFilter === 'local' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('local')}>{t('database.filters.local')}</Button>
                 </div>
            </div>

            {loading ? <SkeletonGrid count={6} CardComponent={Card} /> :
             <div className="space-y-4">
                 {filteredCaselaws.length > 0 ? (
                     filteredCaselaws.map(law => <CaselawCard key={law.id} caselaw={law} />)
                 ) : (
                     <div className="text-center text-muted-foreground py-16">
                         <p>{t('database.noResults')}</p>
                     </div>
                 )}
             </div>
            }
        </div>
    );
}
