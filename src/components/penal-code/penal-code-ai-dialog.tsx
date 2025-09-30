
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, BookOpen } from 'lucide-react';
import { penalCodeAssistantFlow, PenalCodeOutput } from '@/ai/flows/penal-code-assistant';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

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

interface PenalCodeAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PenalCodeAIDialog({ open, onOpenChange }: PenalCodeAIDialogProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PenalCodeOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const flowResult = await penalCodeAssistantFlow({ query });
      setResult(flowResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching the answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
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
            Penal Code AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask a question about a criminal situation, and the AI will find relevant charges.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Experimental Feature</AlertTitle>
            <AlertDescription>
              This AI can make mistakes, so always double-check its suggestions. This AI only searches the San Andreas Penal Code.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'What is the charge for stealing a car?'"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {isLoading && (
                 <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                 </div>
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
                   {result.relevant_charges.length > 0 ? (
                        <div className="space-y-4">
                            {result.relevant_charges.map(charge => (
                                <Card key={charge.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <CardTitle>{charge.id}. {charge.name}</CardTitle>
                                            </div>
                                            <Badge className={cn(getTypeClasses(charge.type))}>
                                                {getTypeFullName(charge.type)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{charge.definition}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                   ) : (
                    <Alert>
                        <BookOpen className="h-4 w-4" />
                        <AlertTitle>No Relevant Charges Found</AlertTitle>
                        <AlertDescription>The AI could not find any charges matching your query. Try rephrasing your question.</AlertDescription>
                    </Alert>
                   )}
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
