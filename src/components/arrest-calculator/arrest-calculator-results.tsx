
'use client';

import { useChargeStore, type SelectedCharge } from '@/stores/charge-store';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clipboard, Pencil, Link2, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import config from '../../../data/config.json';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { ArrestCalculation, ChargeResult } from '@/lib/arrest-calculator';
import { Skeleton } from '@/components/ui/skeleton';
import configData from '../../../data/config.json';
import { StreetsAlert } from '../shared/streets-act-warning';

const getType = (type: string | undefined) => {
  switch (type) {
    case 'F':
      return 'Felony';
    case 'M':
      return 'Misdemeanor';
    case 'I':
      return 'Infraction';
    default:
      return 'Unknown';
  }
};

const BailStatusBadge = ({ bailInfo }: { bailInfo: any }) => {
  if (!bailInfo) return <Badge variant="secondary">N/A</Badge>;
  if (bailInfo.auto === false) return <Badge variant="destructive">NO BAIL</Badge>;
  if (bailInfo.auto === true) return <Badge className="bg-green-500 hover:bg-green-600 text-white">AUTO BAIL</Badge>;
  if (bailInfo.auto === 2) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
  return <Badge variant="secondary">N/A</Badge>;
};

const CopyableCard = ({ label, value, tooltipContent }: { label: string; value: string | number; tooltipContent?: string }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value.toString());
    toast({
      title: 'Copied to clipboard!',
      description: `${label} value has been copied.`,
    });
  };

  const content = (
    <Card>
      <CardContent className="p-4">
        <Label htmlFor={`copy-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
          <div className="flex items-center gap-1">
            {label}
            {tooltipContent && <Asterisk className="h-3 w-3 text-yellow-500" />}
          </div>
        </Label>
        <div className="flex items-center gap-2 mt-2">
          <Input id={`copy-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} value={value} readOnly disabled />
          <Button size="icon" variant="outline" onClick={handleCopy} aria-label={`Copy ${label}`}>
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return content;
};

/** ---------- Loading UI ---------- */
function LoadingTableSkeleton() {
    return (
      <Card aria-busy="true" aria-live="polite">
        <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-44 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-md" />
            </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <div className="grid grid-cols-12 gap-4 bg-muted/50 p-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} className="grid grid-cols-12 gap-4 p-3">
                  {Array.from({ length: 12 }).map((__, c) => (
                    <Skeleton key={c} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  function LoadingSummarySkeleton() {
    return (
      <Card aria-busy="true">
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
           <div className="w-full overflow-hidden rounded-lg border">
              <div className="grid grid-cols-8 gap-4 bg-muted/50 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-8 gap-4 p-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                  ))}
              </div>
            </div>
        </CardContent>
      </Card>
    );
  }
  
  function LoadingCopyablesSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
/** -------------------------------- */

interface ArrestCalculatorResultsProps {
  report: SelectedCharge[];
  showCharges?: boolean;
  showStipulations?: boolean;
  showSummary?: boolean;
  showCopyables?: boolean;
  clickToCopy?: boolean;
  showModifyChargesButton?: boolean;
  onModifyCharges?: () => void;
  paroleViolatorOverride?: boolean;
}

export function ArrestCalculatorResults({
  report,
  showCharges = false,
  showStipulations = false,
  showSummary = false,
  showCopyables = false,
  clickToCopy = false,
  showModifyChargesButton = false,
  onModifyCharges,
  paroleViolatorOverride,
}: ArrestCalculatorResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { setCharges: setChargesForModification, isParoleViolator, reportIsParoleViolator } = useChargeStore();

  const [data, setData] = useState<ArrestCalculation | null>(null);

  const effectiveParoleStatus = paroleViolatorOverride ?? (report.length > 0 ? reportIsParoleViolator : isParoleViolator);

  useEffect(() => {
    fetch('/api/arrest-calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, isParoleViolator: effectiveParoleStatus }),
    })
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load arrest calculation:', err));
  }, [report, effectiveParoleStatus]);

  if (!data) {
    return (
      <div className="space-y-6">
        <LoadingTableSkeleton />
        <LoadingSummarySkeleton />
        <LoadingCopyablesSkeleton />
      </div>
    );
  }

  const { calculationResults, extras, totals, bailStatus, minTimeCapped, maxTimeCapped, isCapped, impoundCapped, isImpoundCapped, suspensionCapped, isSuspensionCapped, isStreetsEligible} = data;
  const formatTotalTime = (totalMinutes: number) => {
    if (totalMinutes === 0) return '0 minutes';
    totalMinutes = Math.round(totalMinutes);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} Day(s)`);
    if (hours > 0) parts.push(`${hours} Hour(s)`);
    if (minutes > 0) parts.push(`${minutes} Minute(s)`);

    return `${parts.join(' ')} (${totalMinutes} mins)`;
  };

  const handleCopyToClipboard = (text: string | number, label?: string) => {
    navigator.clipboard.writeText(text.toString());
    toast({
      title: 'Copied!',
      description: label ? `${label}: ${text}` : `"${text}" copied to clipboard.`,
    });
  };

  const handleModifyCharges = () => {
    onModifyCharges?.();
    setChargesForModification(report);
    router.push('/arrest-calculator?modify=true');
  };

  const handleCopyCalculationLink = () => {
    const additionMapping: { [key: string]: number } = {
      Offender: 1,
      Accomplice: 2,
      Accessory: 3,
      Conspiracy: 4,
      Attempt: 5,
      Solicitation: 6,
      'Parole Violation': 7,
    };

    const chargeParams = calculationResults.map(result => {
      const { row, chargeDetails } = result as ChargeResult;
      const additionIndex = additionMapping[row.addition || 'Offender'];
      let chargeStr = `${row.class?.toLowerCase()}${chargeDetails.id}-${row.offense}-${additionIndex}`;
      if (chargeDetails.drugs && row.category) {
        const categoryIndex = Object.keys(chargeDetails.drugs).find(
          key => chargeDetails.drugs![key] === row.category
        );
        if (categoryIndex) {
          chargeStr += `-${categoryIndex}`;
        }
      }
      return `c=${encodeURIComponent(chargeStr)}`;
    });

    if (chargeParams.length > 0) {
      const queryParts = [...chargeParams];
      if (effectiveParoleStatus) {
        queryParts.push('pv=1');
      }
      const url = `${window.location.origin}/arrest-calculation?${queryParts.join('&')}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Arrest calculation link copied to clipboard.',
      });
    }
  };

  const hasAnyModifiers = calculationResults.some(r => r.isModified);

  const charges = calculationResults.map(result => {
    const {
      row,
      chargeDetails,
      appliedAdditions,
      isModified,
      original,
      modified,
      fine,
      impound,
      suspension,
      bailAuto,
      bailCost,
    } = result as ChargeResult;

    const typePrefix = `${chargeDetails.type}${row.class}`;
    let title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}`;

    if (chargeDetails.drugs && row.category) {
      title += ` (Category ${row.category})`;
    } else if (row.offense !== '1') {
      title += ` (Offence #${row.offense})`;
    }

    const additions = appliedAdditions ?? [];
    const additionDisplayNames =
      additions.length > 0 ? additions.map(add => add.name).join(' + ') : row.addition || 'Offender';

    const typeDisplay = getType(chargeDetails.type);
    const typeColorClass =
      chargeDetails.type === 'F'
        ? 'text-red-500'
        : chargeDetails.type === 'M'
          ? 'text-yellow-500'
          : chargeDetails.type === 'I'
            ? 'text-green-500'
            : '';

    const minTimeFull = formatTotalTime(modified.minTime);
    const maxTimeFull = formatTotalTime(modified.maxTime);

    return {
      key: row.uniqueId,
      title,
      additionDisplayNames,
      additions,
      isModified,
      offense: row.offense,
      typeDisplay,
      typeColorClass,
      minTimeText: minTimeFull.split('(')[0].trim(),
      maxTimeText: maxTimeFull.split('(')[0].trim(),
      modifiedMinTimeFull: minTimeFull,
      modifiedMaxTimeFull: maxTimeFull,
      originalMinTime: formatTotalTime(original.minTime),
      originalMaxTime: formatTotalTime(original.maxTime),
      pointsDisplay: Math.round(modified.points),
      originalPoints: original.points,
      fine,
      impoundDisplay: impound ? `Yes | ${impound} Day(s)` : 'No',
      suspensionDisplay: suspension ? `Yes | ${suspension} Day(s)` : 'No',
      bailAuto,
      bailCost,
      bailCostDisplay: bailAuto !== false && bailCost > 0 ? `$${bailCost.toLocaleString()}` : 'N/A',
    };
  });

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {showCharges && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Charges</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyCalculationLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy Calculation Link
                </Button>
                {showModifyChargesButton && (
                  <Button variant="outline" size="sm" onClick={handleModifyCharges}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modify Charges
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden w-full overflow-x-auto sm:block">
                <Table className="w-full sm:min-w-[960px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Addition</TableHead>
                      <TableHead>Offence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Min Time</TableHead>
                      <TableHead>Max Time</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Fine</TableHead>
                      <TableHead>Impound</TableHead>
                      <TableHead>Suspension</TableHead>
                      <TableHead>Auto-Bail</TableHead>
                      <TableHead>Bail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map(charge => (
                      <TableRow key={charge.key}>
                        <TableCell
                          className={cn('font-medium', clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(charge.title, 'Title') : undefined}
                          title={clickToCopy ? 'Click to copy title' : undefined}
                        >
                          {charge.title}
                        </TableCell>
                        <TableCell>
                          {charge.isModified && charge.additions.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help font-bold text-yellow-500">{charge.additionDisplayNames}</span>
                              </TooltipTrigger>
                              <TooltipContent className="space-y-2">
                                {charge.additions.map(addition => (
                                  <div key={addition.name} className="space-y-1">
                                    <p className="font-semibold">{addition.name}</p>
                                    <p>Sentence Multiplier: {addition.sentence_multiplier}x</p>
                                    <p>Points Multiplier: {addition.points_multiplier}x</p>
                                  </div>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span>{charge.additionDisplayNames}</span>
                          )}
                        </TableCell>
                        <TableCell>{charge.offense}</TableCell>
                        <TableCell>
                          <span className={cn('font-bold', charge.typeColorClass)}>{charge.typeDisplay}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.minTimeText}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {charge.originalMinTime}</p>
                                  <p>Modified: {charge.modifiedMinTimeFull}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.maxTimeText}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {charge.originalMaxTime}</p>
                                  <p>Modified: {charge.modifiedMaxTimeFull}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.pointsDisplay}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {charge.originalPoints} points</p>
                                  <p>Modified: {charge.pointsDisplay} points</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(charge.fine, 'Raw fine') : undefined}
                          title={clickToCopy ? 'Click to copy raw fine' : undefined}
                          aria-label={clickToCopy ? 'Copy raw fine' : undefined}
                        >
                          ${charge.fine.toLocaleString()}
                        </TableCell>
                        <TableCell>{charge.impoundDisplay}</TableCell>
                        <TableCell>{charge.suspensionDisplay}</TableCell>
                        <TableCell>
                          <BailStatusBadge bailInfo={{ auto: charge.bailAuto }} />
                        </TableCell>
                        <TableCell>{charge.bailCostDisplay}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-4 sm:hidden">
                {charges.map(charge => (
                  <div
                    key={charge.key}
                    className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm text-center sm:text-left"
                  >
                    <div
                      className={cn('text-base font-semibold', clickToCopy && 'cursor-pointer hover:text-primary')}
                      onClick={clickToCopy ? () => handleCopyToClipboard(charge.title, 'Title') : undefined}
                    >
                      {charge.title}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs uppercase text-muted-foreground sm:justify-start">
                      <span className={cn('font-semibold', charge.typeColorClass)}>{charge.typeDisplay}</span>
                      <span>Offence #{charge.offense}</span>
                    </div>
                    <div className="mt-3 text-sm text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Addition</p>
                      {charge.isModified && charge.additions.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="mt-1 inline-flex cursor-help font-semibold text-yellow-500">
                              {charge.additionDisplayNames}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="space-y-2">
                            {charge.additions.map(addition => (
                              <div key={addition.name} className="space-y-1">
                                <p className="font-semibold">{addition.name}</p>
                                <p>Sentence Multiplier: {addition.sentence_multiplier}x</p>
                                <p>Points Multiplier: {addition.points_multiplier}x</p>
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="mt-1 block">{charge.additionDisplayNames}</span>
                      )}
                    </div>
                    <dl className="mt-3 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Min Time</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.minTimeText}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Original: {charge.originalMinTime}</p>
                                <p>Modified: {charge.modifiedMinTimeFull}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Max Time</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.maxTimeText}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Original: {charge.originalMaxTime}</p>
                                <p>Modified: {charge.modifiedMaxTimeFull}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Points</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.pointsDisplay}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Original: {charge.originalPoints} points</p>
                                <p>Modified: {charge.pointsDisplay} points</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Fine</dt>
                        <dd
                          className={cn('mt-1', clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(charge.fine, 'Raw fine') : undefined}
                        >
                          ${charge.fine.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Impound</dt>
                        <dd className="mt-1">{charge.impoundDisplay}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Suspension</dt>
                        <dd className="mt-1">{charge.suspensionDisplay}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Auto-Bail</dt>
                        <dd className="mt-1">
                          <BailStatusBadge bailInfo={{ auto: charge.bailAuto }} />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">Bail</dt>
                        <dd className="mt-1">{charge.bailCostDisplay}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isStreetsEligible && StreetsAlert()}

        {showStipulations && extras && extras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Stipulations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="w-full sm:min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Charge</TableHead>
                      <TableHead>Stipulation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{item.extra}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {showSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
               {isCapped && (
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sentence Capped</AlertTitle>
                  <AlertDescription>
                    The total sentence time has been capped at {config.MAX_SENTENCE_DAYS} days as per Legal Faction Management policy. The original uncapped totals are shown below for reference.
                    <br />
                    <b>Original Min Time:</b> {formatTotalTime(totals.modified.minTime)}
                    <br />
                    <b>Original Max Time:</b> {formatTotalTime(totals.modified.maxTime)}
                  </AlertDescription>
                </Alert>
              )}
               {isImpoundCapped && (
                 <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Impound Capped</AlertTitle>
                  <AlertDescription>
                    The total impound time has been capped at {config.MAX_IMPOUND_DAYS} days. The original uncapped total was {Math.round(totals.modified.impound)} days.
                  </AlertDescription>
                </Alert>
              )}
               {isSuspensionCapped && (
                 <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Suspension Capped</AlertTitle>
                  <AlertDescription>
                     The total suspension time has been capped at {config.MAX_SUSPENSION_DAYS} days. The original uncapped total was {Math.round(totals.modified.suspension)} days.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3 sm:hidden">
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Min Time</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {formatTotalTime(minTimeCapped)}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Original: {formatTotalTime(totals.original.minTime)}</p>
                          <p>Modified: {formatTotalTime(totals.modified.minTime)}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Max Time</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {formatTotalTime(maxTimeCapped)}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Original: {formatTotalTime(totals.original.maxTime)}</p>
                          <p>Modified: {formatTotalTime(totals.modified.maxTime)}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Points</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {Math.round(totals.modified.points)}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Original: {totals.original.points} points</p>
                          <p>Modified: {Math.round(totals.modified.points)} points</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Fine</p>
                  <p className="mt-1 text-sm font-medium">${totals.fine.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Impound</p>
                  <p className="mt-1 text-sm font-medium">{impoundCapped > 0 ? `${Math.round(impoundCapped)} Day(s)` : 'No'}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Suspension</p>
                  <p className="mt-1 text-sm font-medium">{suspensionCapped > 0 ? `${Math.round(suspensionCapped)} Day(s)` : 'No'}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Bail Status</p>
                  <div className="mt-2 flex justify-center">
                    {(() => {
                      if (bailStatus === 'NOT ELIGIBLE') return <Badge variant="destructive">NOT ELIGIBLE</Badge>;
                      if (bailStatus === 'DISCRETIONARY')
                        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
                      if (bailStatus === 'ELIGIBLE')
                        return <Badge className="bg-green-500 hover:bg-green-600 text-white">ELIGIBLE</Badge>;
                      return <Badge variant="secondary">N/A</Badge>;
                    })()}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Highest Bail Amount</p>
                  <p className="mt-1 text-sm font-medium">${totals.highestBail.toLocaleString()}</p>
                </div>
              </div>
              <div className="hidden w-full overflow-x-auto sm:block">
                <Table className="w-full sm:min-w-[720px]">
                  <TableHeader>
                  <TableRow>
                    <TableHead>Total Min Time</TableHead>
                    <TableHead>Total Max Time</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Total Fine</TableHead>
                    <TableHead>Total Impound</TableHead>
                    <TableHead>Total Suspension</TableHead>
                    <TableHead>Bail Status</TableHead>
                    <TableHead>Highest Bail Amount</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {formatTotalTime(minTimeCapped)}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Original: {formatTotalTime(totals.original.minTime)}</p>
                              <p>Modified: {formatTotalTime(totals.modified.minTime)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {formatTotalTime(maxTimeCapped)}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Original: {formatTotalTime(totals.original.maxTime)}</p>
                              <p>Modified: {formatTotalTime(totals.modified.maxTime)}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Math.round(totals.modified.points)}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Original: {totals.original.points} points</p>
                              <p>Modified: {Math.round(totals.modified.points)} points</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${totals.fine.toLocaleString()}</TableCell>
                    <TableCell>{impoundCapped > 0 ? `${Math.round(impoundCapped)} Day(s)` : 'No'}</TableCell>
                    <TableCell>{suspensionCapped > 0 ? `${Math.round(suspensionCapped)} Day(s)` : 'No'}</TableCell>
                    <TableCell>
                      {(() => {
                        if (bailStatus === 'NOT ELIGIBLE') return <Badge variant="destructive">NOT ELIGIBLE</Badge>;
                        if (bailStatus === 'DISCRETIONARY') return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
                        if (bailStatus === 'ELIGIBLE') return <Badge className="bg-green-500 hover:bg-green-600 text-white">ELIGIBLE</Badge>;
                        return <Badge variant="secondary">N/A</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>${totals.highestBail.toLocaleString()}</TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {showCopyables && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <CopyableCard label="Min Minutes" value={Math.round(minTimeCapped)} tooltipContent={hasAnyModifiers ? `Original: ${Math.round(totals.original.minTime)}` : undefined} />
            <CopyableCard label="Max Minutes" value={Math.round(maxTimeCapped)} tooltipContent={hasAnyModifiers ? `Original: ${Math.round(totals.original.maxTime)}` : undefined} />
            <CopyableCard label="Total Impound (Days)" value={Math.round(impoundCapped)} />
            <CopyableCard label="Total Suspension (Days)" value={Math.round(suspensionCapped)} />
            <CopyableCard label="Bail Cost" value={totals.highestBail} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
