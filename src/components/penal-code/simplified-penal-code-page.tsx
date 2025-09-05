
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, Sparkles } from 'lucide-react';
import { type PenalCode, type Charge } from '@/stores/charge-store';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import configData from '../../../data/config.json';
import { Alert, AlertTitle } from '../ui/alert';
import { PenalCodeAIDialog } from './penal-code-ai-dialog';

const getTypeClasses = (type: Charge['type']) => {
    switch (type) {
      case 'F':
        return 'bg-red-500 hover:bg-red-500/80 text-white';
      case 'M':
        return 'bg-yellow-500 hover:bg-yellow-500/80 text-white';
      case 'I':
        return 'bg-green-500 hover:bg-green-500/80 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-500/80 text-white';
    }
  };
  
const getTypeFullName = (type: Charge['type']) => {
    switch (type) {
        case 'F': return 'Felony';
        case 'M': return 'Misdemeanor';
        case 'I': return 'Infraction';
        default: return 'Other';
    }
};

const formatTime = (time: any) => {
    if (!time || (time.days === 0 && time.hours === 0 && time.min === 0)) return 'N/A';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days} Day(s)`);
    if (time.hours > 0) parts.push(`${time.hours} Hour(s)`);
    if (time.min > 0) parts.push(`${time.min} Minute(s)`);
    return parts.join(' ');
};

const formatBail = (bail: any) => {
    if (!bail) return 'N/A';
    if (bail.auto === false) return 'No Bail';
    if (bail.auto === 2) return `Discretionary ($${bail.cost.toLocaleString()})`;
    if (bail.auto === true) return `Auto Bail ($${bail.cost.toLocaleString()})`;
    return 'N/A';
}

const ChargeDetail = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{value}</p>
    </div>
);


const ChargeCard = ({ charge }: { charge: Charge }) => {
    const isDrugCharge = !!charge.drugs;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold">{charge.id}. {charge.charge}</CardTitle>
                         {charge.definition && <CardDescription className="mt-1 whitespace-pre-wrap">{charge.definition}</CardDescription>}
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                            <Badge className={cn(getTypeClasses(charge.type))}>{getTypeFullName(charge.type)}</Badge>
                            {isDrugCharge && <Badge variant="secondary">Drug Related</Badge>}
                        </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">ID: {charge.id}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ChargeDetail label="Classes" value={Object.entries(charge.class).filter(([, v]) => v).map(([k]) => k).join(', ') || 'N/A'} />
                    <ChargeDetail label="Offenses" value={Object.entries(charge.offence).filter(([, v]) => v).map(([k]) => `#${k}`).join(', ') || 'N/A'} />
                    <ChargeDetail label="Points" value={!isDrugCharge ? `A: ${charge.points.A}, B: ${charge.points.B}, C: ${charge.points.C}`: 'Varies'} />
                    <ChargeDetail label="Fine" value={isDrugCharge ? 'Varies by Category' : `$${(charge.fine['1'] || 0).toLocaleString()} - $${(charge.fine['3'] || 0).toLocaleString()}`} />
                    <ChargeDetail label="Min Sentence (Guilty)" value={isDrugCharge ? 'Varies by Category' : formatTime(charge.time)} />
                    <ChargeDetail label="Max Sentence (No Contest)" value={isDrugCharge ? 'Varies by Category' : formatTime(charge.maxtime)} />
                    <ChargeDetail label="Bail" value={isDrugCharge ? 'Varies by Category' : formatBail(charge.bail)} />
                </div>
                 {charge.extra && (
                    <>
                        <Separator />
                         <div className="space-y-2">
                            <h4 className="text-md font-semibold text-muted-foreground">Stipulations</h4>
                            <Alert className="text-sm border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-500">
                                <AlertTitle className="font-semibold">Note</AlertTitle>
                                <CardDescription className="whitespace-pre-wrap">{charge.extra}</CardDescription>
                            </Alert>
                         </div>
                    </>
                 )}
                {isDrugCharge && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="text-md font-semibold">Drug Categories & Stipulations</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(charge.drugs!).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                        <span className="font-semibold">{value}:</span>
                                        <span> Min Time: {formatTime(charge.time[value])}</span>
                                        <span> | Fine: ${charge.fine[value].toLocaleString()}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const PenalCodeSkeleton = () => (
    <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-1" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export function SimplifiedPenalCodePage() {
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'F' | 'M' | 'I'>('all');
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

    useEffect(() => {
        fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_penal_code.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch penal code data');
                }
                return res.json();
            })
            .then(data => {
                setPenalCode(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const filteredCharges = useMemo(() => {
        if (!penalCode) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        
        return Object.values(penalCode).filter(charge => {
            if (charge.type === '?') return false;

            const searchMatch = charge.charge.toLowerCase().includes(lowercasedFilter) ||
                                charge.id.includes(lowercasedFilter) ||
                                (charge.definition && charge.definition.toLowerCase().includes(lowercasedFilter)) ||
                                (charge.extra && charge.extra.toLowerCase().includes(lowercasedFilter));

            const typeMatch = typeFilter === 'all' || charge.type === typeFilter;

            return searchMatch && typeMatch;
        });
    }, [penalCode, searchTerm, typeFilter]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PenalCodeAIDialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen} />
            <PageHeader
                title="Simplified Penal Code"
                description="Browse and search through the list of charges."
            />

            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by ID, name, definition, or stipulation..."
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2">
                        <Button variant={typeFilter === 'all' ? 'default' : 'outline'} onClick={() => setTypeFilter('all')}>All</Button>
                        <Button variant={typeFilter === 'F' ? 'default' : 'outline'} onClick={() => setTypeFilter('F')}>Felonies</Button>
                        <Button variant={typeFilter === 'M' ? 'default' : 'outline'} onClick={() => setTypeFilter('M')}>Misdemeanors</Button>
                        <Button variant={typeFilter === 'I' ? 'default' : 'outline'} onClick={() => setTypeFilter('I')}>Infractions</Button>
                    </div>
                    <Button variant="outline" className="sm:ml-auto" onClick={() => setIsAIDialogOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Assistant
                    </Button>
                 </div>
            </div>

            {loading && <PenalCodeSkeleton />}
            
            {error && (
                 <div className="flex flex-col items-center justify-center text-center text-destructive bg-destructive/10 border border-destructive rounded-lg p-8">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <h2 className="text-2xl font-bold">Failed to Load Data</h2>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-4">
                    {filteredCharges.length > 0 ? (
                        filteredCharges.map(charge => (
                            <ChargeCard key={charge.id} charge={charge} />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <p>No charges found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
