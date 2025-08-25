
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, BookOpen, Landmark, ShieldCheck, ExternalLink, Copy, Car, Sparkles } from 'lucide-react';
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
import { CaselawAIDialog } from './caselaw-ai-dialog';

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
};

const jurisdictionMap: { [key: string]: string } = {
    'federal': 'Federal',
    'federal-civil': 'Federal (Civil)',
    'local-supreme': 'SA Supreme Court',
    'local-appeals': 'SA Court of Appeals',
    'local-appeals-civil': 'SA Court of Appeals (Civil)',
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

    const handleCopy = () => {
        if (resource.button_content) {
            navigator.clipboard.writeText(resource.button_content);
            toast({
                title: "Copied to Clipboard",
                description: `${resource.title} content has been copied.`,
            });
        }
    };

    const cardContent = (
      <Card className="h-full flex flex-col justify-between transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
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

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="pr-2">{caselaw.case} ({caselaw.year})</CardTitle>
                    <Badge variant={isFederal ? 'default' : 'secondary'} className="text-right whitespace-nowrap">
                        {jurisdictionMap[caselaw.jurisdiction] || 'Unknown'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-muted-foreground">Summary</h4>
                    <p>{caselaw.summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-muted-foreground">Implication for Officers</h4>
                    <p>{caselaw.implication}</p>
                </div>
                {caselaw.source && (
                    <div>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <a href={caselaw.source} target='_blank' rel="noopener noreferrer">
                                View Source <ExternalLink className="ml-2 h-4 w-4" />
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
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);


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
            <CaselawAIDialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen} />

            <PageHeader
                title="Caselaw & Legal Resources"
                description="Quickly access legal documents, schedules, and important caselaw."
            />
            
            {loading ? <SkeletonGrid count={3} CardComponent={Card} /> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {resources.map(resource => <ResourceCard key={resource.id} resource={resource} config={config} />)}
             </div>
            }
            
            <div className="flex flex-col items-center justify-center text-center gap-4 p-6 border-2 border-dashed rounded-lg bg-card">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="text-xl font-semibold">Need a quick answer?</h3>
                 <p className="text-center text-muted-foreground max-w-md">
                    Use the experimental AI assistant to find relevant caselaw by describing a situation in plain English.
                 </p>
                 <Button onClick={() => setIsAIDialogOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" /> AI Caselaw Assistant
                 </Button>
            </div>

            <div>
                <h2 className="text-2xl font-bold tracking-tight">Caselaw Database</h2>
                <p className="text-muted-foreground">Search for relevant caselaws.</p>
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by case name or summary..."
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                </div>
                 <div className="flex gap-2">
                    <Button variant={jurisdictionFilter === 'all' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('all')}>All</Button>
                    <Button variant={jurisdictionFilter === 'federal' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('federal')}>United States</Button>
                    <Button variant={jurisdictionFilter === 'local' ? 'default' : 'outline'} onClick={() => setJurisdictionFilter('local')}>San Andreas</Button>
                 </div>
            </div>

            {loading ? <SkeletonGrid count={6} CardComponent={Card} /> :
             <div className="space-y-4">
                 {filteredCaselaws.length > 0 ? (
                     filteredCaselaws.map(law => <CaselawCard key={law.id} caselaw={law} />)
                 ) : (
                     <div className="text-center text-muted-foreground py-16">
                         <p>No caselaws found matching your search criteria.</p>
                     </div>
                 )}
             </div>
            }
        </div>
    );
}
