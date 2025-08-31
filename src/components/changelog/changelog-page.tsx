
'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Wrench, PlusCircle, Pencil, GitCommit, Server } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ChangelogItem = {
    id?: number;
    type: 'fix' | 'feature' | 'modification' | 'backend' | 'addition';
    description: string;
};

type ChangelogEntry = {
    version: string;
    type: 'Release' | 'Major Update' | 'Minor Update' | 'Hotfix';
    date: string;
    cacheVersion?: string;
    localStorageVersion?: string;
    items: ChangelogItem[];
};

interface ChangelogPageProps {
    initialChangelogs: ChangelogEntry[];
}

const itemTypeDetails = {
    feature: {
        icon: PlusCircle,
        color: 'text-green-500',
        label: 'Feature',
    },
    addition: {
        icon: PlusCircle,
        color: 'text-green-500',
        label: 'Addition',
    },
    modification: {
        icon: Pencil,
        color: 'text-blue-500',
        label: 'Modification',
    },
    backend: {
        icon: Server,
        color: 'text-purple-500',
        label: 'Backend',
    },
    fix: {
        icon: Wrench,
        color: 'text-orange-500',
        label: 'Fix',
    },
};

const changelogTypeColors = {
    'Release': 'bg-green-500/10 text-green-500 border-green-500/50',
    'Major Update': 'bg-blue-500/10 text-blue-500 border-blue-500/50',
    'Minor Update': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
    'Hotfix': 'bg-red-500/10 text-red-500 border-red-500/50',
};

const markerColors = {
    'Release': 'bg-green-500 text-green-50',
    'Major Update': 'bg-blue-500 text-blue-50',
    'Minor Update': 'bg-yellow-500 text-yellow-900',
    'Hotfix': 'bg-red-500 text-red-50',
};

const cardAccentColors = {
    'Release': 'border-l-4 border-green-500',
    'Major Update': 'border-l-4 border-blue-500',
    'Minor Update': 'border-l-4 border-yellow-500',
    'Hotfix': 'border-l-4 border-red-500',
};

const releaseTypeInfo = [
    {
        type: 'Release',
        description: 'Full releases introducing major features and changes.',
    },
    {
        type: 'Major Update',
        description: 'Significant additions or modifications to existing features.',
    },
    {
        type: 'Minor Update',
        description: 'Smaller improvements, tweaks, and adjustments.',
    },
    {
        type: 'Hotfix',
        description: 'Urgent fixes addressing specific issues.',
    },
];

const typeOrder = ['feature', 'addition', 'modification', 'backend', 'fix'];

export function ChangelogPage({ initialChangelogs }: ChangelogPageProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const sortedChangelogs = useMemo(() => {
        return [...initialChangelogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [initialChangelogs]);

    const filteredChangelogs = useMemo(() => {
        return sortedChangelogs.filter((entry) => {
            const matchesType = typeFilter === 'all' || entry.type === typeFilter;
            const haystack = (
                entry.version + ' ' + entry.items.map((i) => i.description).join(' ')
            ).toLowerCase();
            const matchesSearch = haystack.includes(search.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [sortedChangelogs, typeFilter, search]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader
                title="Changelog"
                description="Tracking all the changes, features, and fixes."
            />

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Understanding the Changelog</CardTitle>
                    <CardDescription>
                        Release tags highlight the scope of each update.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                        {releaseTypeInfo.map((info) => (
                            <li key={info.type} className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn('text-xs', changelogTypeColors[info.type])}
                                >
                                    {info.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {info.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Input
                    placeholder="Search changelog..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Release">Release</SelectItem>
                        <SelectItem value="Major Update">Major Update</SelectItem>
                        <SelectItem value="Minor Update">Minor Update</SelectItem>
                        <SelectItem value="Hotfix">Hotfix</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="relative pl-6 before:absolute before:inset-y-0 before:left-6 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-primary/20 before:via-primary/60 before:to-primary/20">
                {filteredChangelogs.map((changelog) => (
                    <div key={changelog.version} className="relative mb-8 pl-8">
                        <div
                            className={cn(
                                'absolute -left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background shadow',
                                markerColors[changelog.type]
                            )}
                        >
                            <GitCommit className="h-5 w-5" />
                        </div>
                        <Card className={cn('shadow-sm hover:shadow-md transition-shadow', cardAccentColors[changelog.type])}>
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Version {changelog.version}</CardTitle>
                                        <CardDescription>
                                            {changelog.type === 'Hotfix' ? 'Last Updated on' : 'Released on'}{' '}
                                            {format(new Date(changelog.date), 'PPP')}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn('text-sm', changelogTypeColors[changelog.type])}
                                    >
                                        {changelog.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {[...changelog.items]
                                        .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
                                        .map((item, itemIndex) => {
                                            const details = itemTypeDetails[item.type];
                                            const Icon = details.icon;
                                            return (
                                                <li
                                                    key={`${changelog.version}-${itemIndex}`}
                                                    className="flex items-start gap-4"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                                                        <Icon className={cn('h-5 w-5', details.color)} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{details.label}</p>
                                                        <p
                                                            className="text-muted-foreground"
                                                            dangerouslySetInnerHTML={{ __html: item.description }}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                </ul>
                                {(changelog.cacheVersion || changelog.localStorageVersion) && (
                                    <div className="mt-6 space-y-1 text-sm text-muted-foreground">
                                        {changelog.cacheVersion && (
                                            <p>
                                                Cache Version:{' '}
                                                <Badge className="ml-1 bg-green-500/10 text-green-700 border-green-500/20">
                                                    {changelog.cacheVersion}
                                                </Badge>
                                            </p>
                                        )}
                                        {changelog.localStorageVersion && (
                                            <p>
                                                Local Storage Version:{' '}
                                                <Badge className="ml-1 bg-green-500/10 text-green-700 border-green-500/20">
                                                    {changelog.localStorageVersion}
                                                </Badge>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
