'use client';

import { useMemo, useState } from 'react';
import { legalSearchFlow, LegalSearchOutput } from '@/ai/flows/legal-search';
import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bot,
  ExternalLink,
  Landmark,
  Scale,
  Sparkles,
  User,
} from 'lucide-react';

interface UserMessage {
  id: string;
  role: 'user';
  query: string;
}

interface AssistantMessage {
  id: string;
  role: 'assistant';
  query: string;
  result: LegalSearchOutput;
}

type ChatMessage = UserMessage | AssistantMessage;

const typeClasses: Record<string, string> = {
  F: 'bg-red-500/10 text-red-500 border border-red-500/30',
  M: 'bg-amber-500/10 text-amber-500 border border-amber-500/30',
  I: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30',
};

const typeLabels: Record<string, string> = {
  F: 'Felony',
  M: 'Misdemeanor',
  I: 'Infraction',
};

const getTypeBadge = (type: string) =>
  cn(
    'rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
    typeClasses[type] || 'bg-muted text-muted-foreground'
  );

export function LegalSearchPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = input.trim();
    if (!query || isLoading) {
      return;
    }

    const userMessage: UserMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await legalSearchFlow({ query });
      const assistantMessage: AssistantMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        query,
        result,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while searching. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const introShown = useMemo(() => messages.length === 0 && !isLoading, [messages.length, isLoading]);

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <PageHeader
        title="AI Legal Search"
        description="Ask one question and get penal code and caselaw citations in a single response."
      />

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Experimental Feature</AlertTitle>
        <AlertDescription>
          This assistant can make mistakes. Always confirm the cited penal code and caselaw before acting on the
          information provided.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-0 h-[480px] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {introShown && (
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Legal Search Assistant</h3>
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs uppercase tracking-wide">
                        <Sparkles className="h-3 w-3" />
                        Beta
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Describe a situation or ask about a statute. I will provide a short explanation and cite relevant penal
                      code charges or caselaw so you can dig deeper instantly.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Find matching San Andreas Penal Code charges.</li>
                      <li>Surface local caselaw summaries and implications.</li>
                      <li>Link out to similar Oyez cases for further reading.</li>
                    </ul>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                if (message.role === 'user') {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="flex items-start gap-3 max-w-[80%]">
                        <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow">
                          <p className="whitespace-pre-wrap">{message.query}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                }

                const { result } = message;
                return (
                  <div key={message.id} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Explanation
                        </p>
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                      </div>

                      <div className="space-y-4">
                        <section className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                            <Scale className="h-4 w-4" />
                            Penal Code Citations
                          </div>
                          {result.penal_code_results.length > 0 ? (
                            <div className="space-y-3">
                              {result.penal_code_results.map((charge) => (
                                <div key={charge.id} className="border rounded-lg p-4 bg-background shadow-sm">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold">
                                        {charge.id}. {charge.name}
                                      </p>
                                    </div>
                                    <span className={getTypeBadge(charge.type)}>
                                      {typeLabels[charge.type] || 'Other'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                    {charge.definition}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No penal code charges were identified for this query.
                            </p>
                          )}
                        </section>

                        <section className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                            <Landmark className="h-4 w-4" />
                            Caselaw Citations
                          </div>
                          {result.caselaw_result ? (
                            <div className="border rounded-lg p-4 bg-background shadow-sm space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-semibold">
                                  {result.caselaw_result.case} ({result.caselaw_result.year})
                                </p>
                                <Badge variant="outline" className="uppercase text-xs tracking-wide">
                                  {result.caselaw_result.jurisdiction}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium text-foreground">Summary:</span> {result.caselaw_result.summary}
                                </p>
                                <p>
                                  <span className="font-medium text-foreground">Implication:</span>{' '}
                                  {result.caselaw_result.implication}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No local caselaw directly matched this question.
                            </p>
                          )}
                        </section>

                        {result.oyez_cases && result.oyez_cases.length > 0 && (
                          <section className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
                              <ExternalLink className="h-4 w-4" />
                              Oyez References
                            </div>
                            <ul className="space-y-2 text-sm">
                              {result.oyez_cases.map((oyezCase) => (
                                <li key={oyezCase.href}>
                                  <a
                                    href={oyezCase.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {oyezCase.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-3">
            <div className="flex items-center gap-2 flex-1 rounded-full border bg-background px-4">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a charge, caselaw, or legal scenario..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'Searching…' : 'Search'}
            </Button>
          </form>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to search</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
