
'use client';

import { PaperworkGeneratorForm } from '@/components/paperwork-generators/paperwork-generator-form';
import { notFound, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function GeneratorPageContent() {
    const searchParams = useSearchParams();
    const staticSlug = searchParams.get('s');
    const userFormSlug = searchParams.get('f');
    
    const slug = staticSlug || userFormSlug;
    const param = staticSlug ? `s=${staticSlug}` : `f=${userFormSlug}`;

    const [generatorConfig, setGeneratorConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            setError(true);
            return;
        }

        fetch(`/api/paperwork-generators/${slug}?${param}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setGeneratorConfig(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [slug, param]);

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

    if (error || !generatorConfig) {
        return notFound();
    }

    return <PaperworkGeneratorForm generatorConfig={generatorConfig} />;
}


export default function GeneratorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GeneratorPageContent />
        </Suspense>
    );
}
