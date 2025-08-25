
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { caselawAssistantFlow, CaselawOutput } from '@/ai/flows/caselaw-assistant';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const jurisdictionMap: { [key: string]: string } = {
    'federal': 'Federal',
    'federal-civil': 'Federal (Civil)',
    'local-supreme': 'SA Supreme Court',
    'local-appeals': 'SA Court of Appeals',
    'local-appeals-civil': 'SA Court of Appeals (Civil)',
};


interface CaselawAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaselawAIDialog({ open, onOpenChange }: CaselawAIDialogProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaselawOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const flowResult = await caselawAssistantFlow({ query });
      setResult(sanitizeLocations(flowResult));
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
        setQuery('');
        setIsLoading(false);
        setError(null);
        setResult(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Caselaw AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask a question about a legal situation, and the AI will try to find relevant caselaw.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Experimental Feature</AlertTitle>
            <AlertDescription>
              This AI can make mistakes, so always double-check its suggestions against official sources.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Can I search a car without a warrant?'"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? 'Thinking...' : 'Ask'}
            </Button>
          </form>

          <div className="space-y-4">
            {isLoading && (
                 <Card>
                    <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                 </Card>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {result && (
                <div>
                   {result.found_case ? (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-primary">FROM LOCAL DATABASE</p>
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
                   ) : (
                    <Alert>
                        <AlertTitle>No Local Case Found</AlertTitle>
                        <AlertDescription>The AI could not find a directly relevant case in the local database.</AlertDescription>
                    </Alert>
                   )}

                   {result.oyez_cases && result.oyez_cases.length > 0 && (
                        <div className="mt-4">
                            <Separator className="my-4" />
                            <h3 className="text-lg font-semibold mb-2">Similar Federal Cases from Oyez.org</h3>
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
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
