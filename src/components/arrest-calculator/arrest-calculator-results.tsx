
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
}: ArrestCalculatorResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const setChargesForModification = useChargeStore(state => state.setCharges);

  const [data, setData] = useState<ArrestCalculation | null>(null);

  useEffect(() => {
    fetch('/api/arrest-calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
    })
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load arrest calculation:', err));
  }, [report]);

  if (!data) {
    return (
      <div className="space-y-6">
        <LoadingTableSkeleton />
        <LoadingSummarySkeleton />
        <LoadingCopyablesSkeleton />
      </div>
    );
  }

  const { calculationResults, extras, totals, bailStatus, minTimeCapped, maxTimeCapped, isCapped } = data;

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
      const url = `${window.location.origin}/arrest-calculation?${chargeParams.join('&')}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Arrest calculation link copied to clipboard.',
      });
    }
  };

  const hasAnyModifiers = calculationResults.some(r => r.isModified);

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
              <Table>
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
                  {calculationResults.map(result => {
                    const { row, chargeDetails, additionDetails, isModified, original, modified, fine, impound, suspension, bailAuto, bailCost } = result as ChargeResult;

                    const typePrefix = `${chargeDetails.type}${row.class}`;
                    let title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}`;

                    if (row.offense !== '1') {
                        title += ` (Offence #${row.offense})`;
                    }

                    if (chargeDetails.drugs && row.category) {
                        title += ` (Category ${row.category})`;
                    }

                    return (
                      <TableRow key={row.uniqueId}>
                        <TableCell
                          className={cn('font-medium', clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(title, 'Title') : undefined}
                          title={clickToCopy ? 'Click to copy title' : undefined}
                        >
                          {title}
                        </TableCell>
                        <TableCell>
                          {isModified ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-bold text-yellow-500 cursor-help">{row.addition}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sentence Multiplier: {additionDetails?.sentence_multiplier}x</p>
                                <p>Points Multiplier: {additionDetails?.points_multiplier}x</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span>{row.addition}</span>
                          )}
                        </TableCell>
                        <TableCell>{row.offense}</TableCell>
                        <TableCell>
                          <span
                            className={cn('font-bold', {
                              'text-red-500': chargeDetails.type === 'F',
                              'text-yellow-500': chargeDetails.type === 'M',
                              'text-green-500': chargeDetails.type === 'I',
                            })}
                          >
                            {getType(chargeDetails.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatTotalTime(modified.minTime).split('(')[0].trim()}
                            {isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {formatTotalTime(original.minTime)}</p>
                                  <p>Modified: {formatTotalTime(modified.minTime)}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatTotalTime(modified.maxTime).split('(')[0].trim()}
                            {isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {formatTotalTime(original.maxTime)}</p>
                                  <p>Modified: {formatTotalTime(modified.maxTime)}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Math.round(modified.points)}
                            {isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Original: {original.points} points</p>
                                  <p>Modified: {Math.round(modified.points)} points</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        {/* 👇 Fine cell: click to copy RAW number */}
                        <TableCell
                          className={cn(clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(fine, 'Raw fine') : undefined}
                          title={clickToCopy ? 'Click to copy raw fine' : undefined}
                          aria-label={clickToCopy ? 'Copy raw fine' : undefined}
                        >
                          ${fine.toLocaleString()}
                        </TableCell>

                        <TableCell>{impound ? `Yes | ${impound} Day(s)` : 'No'}</TableCell>
                        <TableCell>{suspension ? `Yes | ${suspension} Day(s)` : 'No'}</TableCell>
                        <TableCell><BailStatusBadge bailInfo={{ auto: bailAuto }} /></TableCell>
                        <TableCell>{bailAuto !== false && bailCost > 0 ? `$${bailCost.toLocaleString()}` : 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {showStipulations && extras && extras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Stipulations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
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
                      <TableCell>{item.extra}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
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
                    <TableCell>{totals.impound > 0 ? `${totals.impound} Day(s)` : 'No'}</TableCell>
                    <TableCell>{totals.suspension > 0 ? `${totals.suspension} Day(s)` : 'No'}</TableCell>
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
            </CardContent>
          </Card>
        )}

        {showCopyables && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <CopyableCard label="Min Minutes" value={Math.round(minTimeCapped)} tooltipContent={hasAnyModifiers ? `Original: ${Math.round(totals.original.minTime)}` : undefined} />
            <CopyableCard label="Max Minutes" value={Math.round(maxTimeCapped)} tooltipContent={hasAnyModifiers ? `Original: ${Math.round(totals.original.maxTime)}` : undefined} />
            <CopyableCard label="Total Impound (Days)" value={totals.impound} />
            <CopyableCard label="Total Suspension (Days)" value={totals.suspension} />
            <CopyableCard label="Bail Cost" value={totals.highestBail} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
