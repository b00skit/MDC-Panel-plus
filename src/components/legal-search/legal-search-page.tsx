
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Sparkles, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import { legalAssistantFlow, LegalAssistantOutput } from '@/ai/flows/legal-assistant-flow';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const jurisdictionMap: { [key: string]: string } = {
    'federal': 'Federal',
    'federal-civil': 'Federal (Civil)',
    'local-supreme': 'SA Supreme Court',
    'local-appeals': 'SA Court of Appeals',
    'local-appeals-civil': 'SA Court of Appeals (Civil)',
};

const getTypeClasses = (type: string) => {
    switch (type) {
      case 'F': return 'bg-red-500 hover:bg-red-500/80 text-white';
      case 'M': return 'bg-yellow-500 hover:bg-yellow-500/80 text-white';
      case 'I': return 'bg-green-500 hover:bg-green-500/80 text-white';
      default: return 'bg-gray-500 hover:bg-gray-500/80 text-white';
    }
};

const getTypeFullName = (type: string) => {
    switch (type) {
        case 'F': return 'Felony';
        case 'M': return 'Misdemeanor';
        case 'I': return 'Infraction';
        default: return 'Other';
    }
};

export function LegalSearchPage() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<LegalAssistantOutput | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const flowResult = await legalAssistantFlow({ query });
            setResult(flowResult);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred while fetching results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
            <PageHeader
                title="AI Legal Search"
                description="Your unified search engine for the San Andreas Penal Code and Caselaw."
            />

            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'What are the penalties for evading police in a vehicle?'"
                        className="pl-10 h-12 text-base"
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" size="lg" disabled={isLoading || !query.trim()}>
                    {isLoading ? 'Searching...' : 'Search'}
                </Button>
            </form>

            <div className="space-y-6">
                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Search Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && (
                    <div className="space-y-8 animate-in fade-in-50 duration-500">
                        {result.explanation && (
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="text-primary" />
                                        AI Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg">{result.explanation}</p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {result.relevant_charges && result.relevant_charges.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Relevant Penal Code Sections</h2>
                                <div className="space-y-4">
                                {result.relevant_charges.map(charge => (
                                    <Card key={charge.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle>{charge.id}. {charge.name}</CardTitle>
                                                <Badge className={cn(getTypeClasses(charge.type))}>{getTypeFullName(charge.type)}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{charge.definition}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                </div>
                            </div>
                        )}

                        {result.found_case && (
                             <div>
                                <h2 className="text-2xl font-bold mb-4">Relevant Local Caselaw</h2>
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <CardTitle>{result.found_case.case} ({result.found_case.year})</CardTitle>
                                            </div>
                                            <Badge variant="secondary">{jurisdictionMap[result.found_case.jurisdiction]}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground">Summary</h4>
                                            <p>{result.found_case.summary}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground">Implication</h4>
                                            <p>{result.found_case.implication}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                        
                        {result.oyez_cases && result.oyez_cases.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Similar Federal Cases from Oyez.org</h2>
                                <div className="space-y-2">
                                    {result.oyez_cases.map(oyezCase => (
                                        <a href={oyezCase.href} target="_blank" rel="noopener noreferrer" key={oyezCase.href} className="block">
                                            <Card className="hover:bg-accent transition-colors">
                                                <CardContent className="p-3 flex items-center justify-between">
                                                    <p className="font-medium">{oyezCase.name}</p>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                </CardContent>
                                            </Card>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!result.explanation && (!result.relevant_charges || result.relevant_charges.length === 0) && !result.found_case && (!result.oyez_cases || result.oyez_cases.length === 0) && (
                            <Alert>
                                <BookOpen className="h-4 w-4" />
                                <AlertTitle>No Results Found</AlertTitle>
                                <AlertDescription>The AI could not find any relevant information for your query. Try rephrasing your question.</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
