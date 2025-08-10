
'use client';
import { promises as fs } from 'fs';
import path from 'path';
import { Layout } from '@/components/layout/layout';
import { PaperworkGeneratorForm } from '@/components/paperwork-generators/paperwork-generator-form';
import { notFound, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function getGeneratorConfig(slug: string | null) {
    if (!slug) return null;
    const filePath = path.join(process.cwd(), `data/paperwork-generators/${slug}.json`);
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        return data;
    } catch (error) {
        return null;
    }
}

function GeneratorPageContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('s');
    const [generatorConfig, setGeneratorConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGeneratorConfig(slug).then(config => {
            if (!config) {
                notFound();
            } else {
                setGeneratorConfig(config);
            }
            setLoading(false);
        });
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-4 mt-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        )
    }

    if (!generatorConfig) {
        return notFound();
    }

    return <PaperworkGeneratorForm generatorConfig={generatorConfig} />;
}


export default function GeneratorPage() {
    return (
        <Layout>
            <GeneratorPageContent />
        </Layout>
    );
}
