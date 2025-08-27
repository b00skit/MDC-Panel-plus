
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, ExternalLink, MessageSquare, GitCommit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '../dashboard/feedback-dialog';

type Resource = {
    id: string;
    title: string;
    description: string;
    icon: string;
    href?: string;
    action?: 'open_feedback_dialog';
};

type Faq = {
    id: string;
    question: string;
    answer: string;
};

type Config = {
    [key: string]: string;
}

const ICONS: { [key: string]: React.ReactNode } = {
    Discord: <svg role="img" viewBox="0 -28.5 256 256" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8 text-primary"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" /></svg>,
    MessageSquare: <MessageSquare className="w-8 h-8 text-primary" />,
    GitCommit: <GitCommit className="w-8 h-8 text-primary" />,
};

interface HelpPageProps {
    initialResources: Resource[];
    initialFaqs: Faq[];
    initialConfig: Config;
}

export function HelpPage({ initialResources, initialFaqs, initialConfig }: HelpPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return initialFaqs;
        return initialFaqs.filter(faq => 
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, initialFaqs]);

    const handleResourceClick = (action?: 'open_feedback_dialog') => {
        if (action === 'open_feedback_dialog') {
            setIsFeedbackDialogOpen(true);
        }
    }

    const SimpleMarkdown = ({ text }: { text: string }) => {
        const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
             <FeedbackDialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen} />
             <PageHeader
                title="Help & Feedback Center"
                description="Find answers to common questions and get support."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialResources.map(resource => {
                    const CardComponent = () => (
                         <Card className="h-full flex flex-col justify-between transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    {ICONS[resource.icon] || null}
                                    {resource.href && <ExternalLink className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="font-headline text-xl">{resource.title}</CardTitle>
                                <CardDescription className="mt-2">{resource.description}</CardDescription>
                            </CardContent>
                        </Card>
                    );

                    if (resource.href) {
                        const url = initialConfig[resource.href] || '#';
                        return (
                            <Link href={url} key={resource.id} target="_blank" rel="noopener noreferrer" className="group block h-full">
                                <CardComponent />
                            </Link>
                        );
                    }
                    return (
                        <div key={resource.id} onClick={() => handleResourceClick(resource.action)} className="group block h-full cursor-pointer">
                            <CardComponent />
                        </div>
                    )
                })}
            </div>

            <div>
                <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search questions..."
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                 <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map(faq => (
                         <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                                <SimpleMarkdown text={faq.answer} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {filteredFaqs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No questions found matching your search.</p>
                )}
            </div>

            <Card className="text-center p-6">
                <CardTitle>Can't find what you're looking for?</CardTitle>
                <CardDescription className="mt-2 mb-4">I'm always happy to collect feedback.</CardDescription>
                <Button onClick={() => setIsFeedbackDialogOpen(true)}>
                    <MessageSquare className="mr-2" /> Submit Feedback
                </Button>
            </Card>
        </div>
    )
}
