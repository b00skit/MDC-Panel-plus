
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart, Heart, Code, Bot } from 'lucide-react';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

async function getConfig() {
    const configPath = path.join(process.cwd(), 'data/config.json');
    const file = await fs.readFile(configPath, 'utf8');
    return JSON.parse(file);
}

export default async function AboutPage() {
    const config = await getConfig();

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <PageHeader
          title="About MDC Panel+"
          description="A passion project designed to help."
        />

        <Card>
            <CardHeader>
                <CardTitle>What's this all about?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                    Hello! I'm a solo developer who created this tool out of a genuine desire to assist our roleplay community's law enforcement officers. My goal was simple: make the paperwork and resource-gathering aspects of the job a little easier and more efficient.
                </p>
                <p>
                    This project is a labor of love, built to streamline daily tasks and provide a centralized hub for essential LEO tools. Whether you're calculating a sentence, writing a report, or looking up a piece of caselaw, I hope this panel makes your experience smoother.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Technical Tidbits</CardTitle>
                 <CardDescription>A brief look under the hood.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4">
                    <Code className="h-8 w-8 text-primary mt-1 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold">Open Source</h3>
                        <p className="text-muted-foreground">This entire project is open-source. You can view the code, suggest changes, or even contribute yourself over at the <a href={config.URL_GITHUB} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub repository</a>.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Bot className="h-8 w-8 text-primary mt-1 flex-shrink-0"/>
                    <div>
                        <h3 className="font-semibold">AI-Assisted Development</h3>
                        <p className="text-muted-foreground">To accelerate development and explore modern coding practices, this application was built with the assistance of AI, specifically Google's Firebase Studio.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Support & Donations</CardTitle>
                 <CardDescription>Your support is appreciated, but let's share the love.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    While I truly appreciate any thought of a donation, I'd first encourage you to support the platforms and people who made this project possible. Please consider donating to <a href="https://gtaw.gg/donate" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GTA:World</a> for keeping our community running, or to the original creator of the MDC Panel, <strong>CXDezign</strong>, whose foundation I built upon.
                </p>
                <div className="flex flex-wrap gap-4">
                     <Button asChild variant="outline">
                        <Link href={config.URL_FOUNDER} target="_blank" rel="noopener noreferrer">
                           <HandHeart className="mr-2" /> Support the Founder
                        </Link>
                    </Button>
                     <Button asChild>
                        <Link href={config.URL_KOFI} target="_blank" rel="noopener noreferrer">
                           <Heart className="mr-2" /> Donate to me on Ko-fi
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Contact & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    The current maintainer is <strong>{config.SITE_DISCORD_CONTACT}</strong>. If you have any questions, find a bug, or have a suggestion, please feel free to reach out via Discord or use the feedback form available on the site.
                </p>
            </CardContent>
        </Card>
      </div>
  );
}
