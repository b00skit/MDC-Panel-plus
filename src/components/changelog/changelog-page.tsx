'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
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
import {
    Wrench,
    PlusCircle,
    Pencil,
    GitCommit,
    Server,
    Search,
    GitMerge,
    Rocket,
    Bug,
    LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

// --- TYPE DEFINITIONS ---
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

// --- STYLING & CONFIGURATION CONSTANTS ---
const itemTypeDetails = {
    feature: { icon: PlusCircle, label: '🚀 Feature', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    addition: { icon: PlusCircle, label: '✨ Addition', color: 'text-green-500', bgColor: 'bg-green-500/10' },
    modification: { icon: Pencil, label: '🎨 Modification', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    backend: { icon: Server, label: '🔧 Backend', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    fix: { icon: Wrench, label: '🐛 Fix', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
};
const changelogTypeColors = {
    Release: 'bg-green-500/10 text-green-500 border-green-500/50',
    'Major Update': 'bg-blue-500/10 text-blue-500 border-blue-500/50',
    'Minor Update': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50',
    Hotfix: 'bg-red-500/10 text-red-500 border-red-500/50',
};
const markerColors = {
    Release: 'bg-green-500 text-green-50',
    'Major Update': 'bg-blue-500 text-blue-50',
    'Minor Update': 'bg-yellow-500 text-yellow-50',
    Hotfix: 'bg-red-500 text-red-50',
};
const cardHeaderGradients = {
    Release: 'bg-gradient-to-r from-green-500/10 to-transparent',
    'Major Update': 'bg-gradient-to-r from-blue-500/10 to-transparent',
    'Minor Update': 'bg-gradient-to-r from-yellow-500/10 to-transparent',
    Hotfix: 'bg-gradient-to-r from-red-500/10 to-transparent',
};
const releaseTypeInfo = [
    { type: 'Release', description: 'Major features and stable releases.', icon: '🚀' },
    { type: 'Major Update', description: 'Significant new functionality.', icon: '✨' },
    { type: 'Minor Update', description: 'Smaller improvements and tweaks.', icon: '🎨' },
    { type: 'Hotfix', description: 'Urgent bug fixes.', icon: '🐛' },
];
const typeOrder = ['feature', 'addition', 'modification', 'backend', 'fix'];

// --- ANIMATION VARIANTS ---
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } } };


// --- ANIMATED STAT CARD COMPONENT ---
interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const animatedValue = useSpring(0, {
        mass: 0.8,
        stiffness: 75,
        damping: 15,
    });
    
    const displayValue = useTransform(animatedValue, (latest) => {
        return Math.round(latest).toLocaleString();
    });

    useEffect(() => {
        if (isInView) {
            animatedValue.set(value);
        }
    }, [isInView, value, animatedValue]);

    return (
        <Card ref={ref}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    <motion.p>{displayValue}</motion.p>
                </div>
            </CardContent>
        </Card>
    );
}


// --- MAIN COMPONENT ---
export function ChangelogPage({ initialChangelogs }: ChangelogPageProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const stats = useMemo(() => {
        const allItems = initialChangelogs.flatMap(log => log.items);
        return {
            totalVersions: initialChangelogs.length,
            totalChanges: allItems.length,
            featuresAdded: allItems.filter(item => ['feature', 'addition'].includes(item.type)).length,
            bugsFixed: allItems.filter(item => item.type === 'fix').length,
        };
    }, [initialChangelogs]);

    const sortedChangelogs = useMemo(
        () => [...initialChangelogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [initialChangelogs]
    );

    const filteredChangelogs = useMemo(() => {
        return sortedChangelogs.filter((entry) => {
            const matchesType = typeFilter === 'all' || entry.type === typeFilter;
            const haystack = `${entry.version} ${entry.items.map((i) => i.description).join(' ')}`.toLowerCase();
            const matchesSearch = haystack.includes(search.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [sortedChangelogs, typeFilter, search]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader
                title="Changelog"
                description="Follow our journey! All the latest features, improvements, and fixes."
            />

            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Versions" value={stats.totalVersions} icon={GitCommit} />
                <StatCard title="Overall Changes" value={stats.totalChanges} icon={GitMerge} />
                <StatCard title="Features & Additions" value={stats.featuresAdded} icon={Rocket} />
                <StatCard title="Bugs Fixed" value={stats.bugsFixed} icon={Bug} />
            </div>

            <Card className="mb-8 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>What's New?</CardTitle>
                    <CardDescription>A quick guide to understanding our update types.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {releaseTypeInfo.map((info) => (
                            <li key={info.type} className="flex items-start gap-3">
                                <div className="text-xl">{info.icon}</div>
                                <div>
                                    <Badge variant="outline" className={cn('text-xs font-semibold', changelogTypeColors[info.type])}>
                                        {info.type}
                                    </Badge>
                                    <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search changelog..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Release">Release</SelectItem>
                        <SelectItem value="Major Update">Major Update</SelectItem>
                        <SelectItem value="Minor Update">Minor Update</SelectItem>
                        <SelectItem value="Hotfix">Hotfix</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <motion.div
                className="relative pl-6 before:absolute before:inset-y-0 before:left-[28px] before:w-1 before:rounded-full before:bg-gradient-to-b before:from-sky-300 before:via-blue-500 before:to-indigo-600"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredChangelogs.map((changelog) => (
                    <motion.div key={changelog.version} className="relative mb-10 pl-8" variants={itemVariants}>
                        <div className={cn('absolute -left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-background shadow-md', markerColors[changelog.type])}>
                            <GitCommit className="h-5 w-5" />
                        </div>
                        <Card className="shadow-sm transition-shadow hover:shadow-lg">
                            <CardHeader className={cn('rounded-t-lg', cardHeaderGradients[changelog.type])}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Version {changelog.version}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {changelog.type === 'Hotfix' ? 'Last Updated on' : 'Released on'}{' '} {format(new Date(changelog.date), 'PPP')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className={cn('text-sm font-semibold', changelogTypeColors[changelog.type])}>
                                        {changelog.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {Object.entries(changelog.items.reduce((acc, item) => {
                                            (acc[item.type] = acc[item.type] || []).push(item);
                                            return acc;
                                        }, {} as Record<ChangelogItem['type'], ChangelogItem[]>))
                                    .sort(([typeA], [typeB]) => typeOrder.indexOf(typeA as any) - typeOrder.indexOf(typeB as any))
                                    .map(([type, items]) => {
                                        const details = itemTypeDetails[type as keyof typeof itemTypeDetails];
                                        return (
                                            <div key={type}>
                                                <h3 className="mb-3 text-lg font-semibold">{details.label}</h3>
                                                <ul className="space-y-4">
                                                    {items.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="flex items-start gap-4">
                                                            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', details.bgColor)}>
                                                                <details.icon className={cn('h-5 w-5', details.color)} />
                                                            </div>
                                                            <p className="pt-1 text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.description }}/>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                                {(changelog.cacheVersion || changelog.localStorageVersion) && (
                                    <div className="mt-6 border-t pt-4 space-y-2 text-sm text-muted-foreground">
                                        {changelog.cacheVersion && (
                                            <div className="flex items-center gap-2">
                                                <span>Cache Version:</span>
                                                <Badge variant="secondary">{changelog.cacheVersion}</Badge>
                                            </div>
                                        )}
                                        {changelog.localStorageVersion && (
                                            <div className="flex items-center gap-2">
                                                <span>Local Storage Version:</span>
                                                <Badge variant="secondary">{changelog.localStorageVersion}</Badge>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}