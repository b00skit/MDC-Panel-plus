
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, BookOpen, Landmark, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { promises as fs } from 'fs';
import path from 'path';

type Resource = {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'link' | 'dialog';
    href?: string;
    content?: {
        title: string;
        body: string;
    };
};

type Caselaw = {
    id: string;
    case: string;
    summary: string;
    implication: string;
};

type Config = {
    [key: string]: string;
}

const ICONS: { [key: string]: React.ReactNode } = {
    BookOpen: <BookOpen className="w-8 h-8 text-primary" />,
    Landmark: <Landmark className="w-8 h-8 text-primary" />,
    ShieldCheck: <ShieldCheck className="w-8 h-8 text-primary" />,
};

const ResourceCard = ({ resource, config }: { resource: Resource, config: Config | null }) => {
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
      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="group block h-full cursor-pointer">{cardContent}</div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{resource.content.title}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="py-4 whitespace-pre-wrap">{resource.content.body}</DialogDescription>
          </DialogContent>
        </Dialog>
      );
    }
  
    return null;
  };
  

const CaselawCard = ({ caselaw }: { caselaw: Caselaw }) => (
    <Card>
        <CardHeader>
            <CardTitle>{caselaw.case}</CardTitle>
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
        </CardContent>
    </Card>
);

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


export function CaselawPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [caselaws, setCaselaws] = useState<Caselaw[]>([]);
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/data/resources.json').then(res => res.json()),
            fetch('/data/caselaws.json').then(res => res.json()),
            fetch('/data/config.json').then(res => res.json())
        ]).then(([resourcesData, caselawsData, configData]) => {
            setResources(resourcesData.resources);
            setCaselaws(caselawsData.caselaws);
            setConfig(configData);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setError("Failed to load legal resources. Please try again later.");
            setLoading(false);
        });
    }, []);

    const filteredCaselaws = useMemo(() => {
        if (!caselaws) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        return caselaws.filter(law => 
            law.case.toLowerCase().includes(lowercasedFilter) ||
            law.summary.toLowerCase().includes(lowercasedFilter) ||
            law.implication.toLowerCase().includes(lowercasedFilter)
        );
    }, [caselaws, searchTerm]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <PageHeader
                title="Caselaw & Legal Resources"
                description="Quickly access legal documents, schedules, and important caselaw."
            />

            {loading ? <SkeletonGrid count={3} CardComponent={Card} /> :
             error ? <p>{error}</p> :
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {resources.map(resource => <ResourceCard key={resource.id} resource={resource} config={config} />)}
             </div>
            }

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
                        disabled={loading || !!error}
                    />
                </div>
            </div>

            {loading ? <SkeletonGrid count={6} CardComponent={Card} /> :
             error ? null :
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
