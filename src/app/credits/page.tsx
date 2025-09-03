
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credits & Contributions',
};

async function getCredits() {
    const filePath = path.join(process.cwd(), 'data/credits.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents).credits;
    } catch (error) {
        console.error("Could not read or parse credits.json:", error);
        return [];
    }
}


export default async function CreditsPage() {
    const credits = await getCredits();

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Credits & Contributions"
          description="This project stands on the shoulders of giants."
        />

        <div className="space-y-6">
            <p className="text-lg text-muted-foreground">A huge thank you to everyone who has contributed, inspired, or supported this project. Many ideas and features were inspired by the work of others in the community, condensed here into one unified tool.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credits.map((credit: any, index: number) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">{credit.name}</CardTitle>
                            <CardDescription>{credit.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{credit.contribution}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
  );
}
