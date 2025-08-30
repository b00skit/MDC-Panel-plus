
'use client';

import { useChargeStore, type PenalCode, type SelectedCharge, type Addition } from '@/stores/charge-store';
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


const getType = (type: string | undefined) => {
  switch (type) {
    case 'F': return 'Felony';
    case 'M': return 'Misdemeanor';
    case 'I': return 'Infraction';
    default: return 'Unknown';
  }
};

const formatTime = (time: { days: number; hours: number; min: number }) => {
  if (!time) return 'N/A';
  const parts = [];
  if (time.days > 0) parts.push(`${time.days} Day(s)`);
  if (time.hours > 0) parts.push(`${time.hours} Hour(s)`);
  if (time.min > 0) parts.push(`${time.min} Minute(s)`);
  if (parts.length === 0) return '0 Minutes';

  const totalMinutes = time.days * 1440 + time.hours * 60 + time.min;
  return `${parts.join(' ')} (${totalMinutes} mins)`;
};

const formatTimeSimple = (time: { days: number; hours: number; min: number }) => {
    if (!time) return 'N/A';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days} Day(s)`);
    if (time.hours > 0) parts.push(`${time.hours} Hour(s)`);
    if (time.min > 0) parts.push(`${time.min} Minute(s)`);
    if (parts.length === 0) return 'N/A';
    return parts.join(' ');
  };

const formatTimeInMinutes = (time: { days: number; hours: number; min: number }) => {
    if (!time) return 0;
    return time.days * 1440 + time.hours * 60 + time.min;
}

const BailStatusBadge = ({ bailInfo }: { bailInfo: any }) => {
  if (!bailInfo) return <Badge variant="secondary">N/A</Badge>;
  if (bailInfo.auto === false) return <Badge variant="destructive">NO BAIL</Badge>;
  if (bailInfo.auto === true) return <Badge className="bg-green-500 hover:bg-green-600 text-white">AUTO BAIL</Badge>;
  if (bailInfo.auto === 2) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
  return <Badge variant="secondary">N/A</Badge>;
};


const formatBailCost = (bailInfo: any) => {
    if (!bailInfo || bailInfo.auto === false || !bailInfo.cost || bailInfo.cost === 0) return 'N/A';
    return `$${bailInfo.cost.toLocaleString()}`;
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
                    <Button size="icon" variant="outline" onClick={handleCopy}>
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
                    <TooltipContent><p>{tooltipContent}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return content;
};

interface ArrestCalculatorResultsProps {
    report: SelectedCharge[];
    penalCode: PenalCode;
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
    penalCode, 
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
    const { additions, setAdditions } = useChargeStore();
    const setChargesForModification = useChargeStore(state => state.setCharges);

    useEffect(() => {
        if (additions.length === 0) {
            fetch('/data/additions.json')
                .then(res => res.json())
                .then(data => setAdditions(data.additions))
                .catch(err => console.error("Failed to load additions:", err));
        }
    }, [additions, setAdditions]);
  
    const extras = report.map(row => {
        const chargeDetails = penalCode[row.chargeId!];
        if (chargeDetails && chargeDetails.extra && chargeDetails.extra !== 'N/A') {
            const typePrefix = `${chargeDetails.type}${row.class}`;
            const title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
            return { title, extra: chargeDetails.extra };
        }
        return null;
    }).filter(Boolean);

    const calculationResults = report.map(row => {
        const chargeDetails = penalCode[row.chargeId!];
        if (!chargeDetails || !additions) return null;
    
        const additionDetails = additions.find(a => a.name === row.addition);
        const sentenceMultiplier = additionDetails?.sentence_multiplier ?? 1;
        const pointsMultiplier = additionDetails?.points_multiplier ?? 1;
    
        const isDrugCharge = !!chargeDetails.drugs;
    
        const getTime = (timeObj: any) => {
          if (!timeObj) return { days: 0, hours: 0, min: 0 };
          if (isDrugCharge && row.category) {
            return timeObj[row.category] || { days: 0, hours: 0, min: 0 };
          }
          return timeObj;
        }
    
        const getFine = (fineObj: any) => {
          if (!fineObj) return 0;
          if (isDrugCharge && row.category) return fineObj[row.category] || 0;
          return fineObj[row.offense!] || 0;
        }
    
        const originalMinTime = formatTimeInMinutes(getTime(chargeDetails.time));
        let originalMaxTime = formatTimeInMinutes(getTime(chargeDetails.maxtime));
        if (originalMaxTime < originalMinTime) {
          originalMaxTime = originalMinTime;
        }
        const originalPoints = chargeDetails.points?.[row.class as keyof typeof chargeDetails.points] ?? 0;

        const modifiedMinTime = originalMinTime * sentenceMultiplier;
        const modifiedMaxTime = originalMaxTime * sentenceMultiplier;
        const modifiedPoints = originalPoints * pointsMultiplier;
    
        const fine = getFine(chargeDetails.fine);
        const impound = chargeDetails.impound?.[row.offense as keyof typeof chargeDetails.impound] || 0;
        const suspension = chargeDetails.suspension?.[row.offense as keyof typeof chargeDetails.suspension] || 0;
    
        const getBailAuto = () => (typeof chargeDetails.bail.auto === 'object' && row.category) ? chargeDetails.bail.auto[row.category] : chargeDetails.bail.auto;
        const getBailCost = () => (typeof chargeDetails.bail.cost === 'object' && row.category) ? chargeDetails.bail.cost[row.category] : chargeDetails.bail.cost;
        const bailAuto = chargeDetails.bail ? getBailAuto() : null;
        const bailCost = chargeDetails.bail && bailAuto !== false ? getBailCost() : 0;
    
        return {
          row,
          chargeDetails,
          additionDetails,
          isModified: sentenceMultiplier !== 1 || pointsMultiplier !== 1,
          original: {
            minTime: originalMinTime,
            maxTime: originalMaxTime,
            points: originalPoints,
          },
          modified: {
            minTime: modifiedMinTime,
            maxTime: modifiedMaxTime,
            points: modifiedPoints,
          },
          fine, impound, suspension, bailAuto, bailCost
        };
      }).filter(Boolean);

    const totals = calculationResults.reduce(
        (acc, result) => {
            if(!result) return acc;

            acc.original.minTime += result.original.minTime;
            acc.original.maxTime += result.original.maxTime;
            acc.original.points += result.original.points;

            acc.modified.minTime += result.modified.minTime;
            acc.modified.maxTime += result.modified.maxTime;
            acc.modified.points += result.modified.points;
            
            acc.fine += result.fine;
            acc.impound += result.impound;
            acc.suspension += result.suspension;
          
            if (result.bailAuto !== null) {
                acc.bailStatus.hasBailCharge = true;
                if(result.bailAuto === false) acc.bailStatus.noBail = true;
                if(result.bailAuto === 2) acc.bailStatus.discretionary = true;
                if(result.bailAuto === true) acc.bailStatus.eligible = true;
            }
            if (result.bailAuto !== false && result.bailCost > acc.highestBail) {
                acc.highestBail = result.bailCost;
            }
          
          return acc;
        },
        { 
            original: { minTime: 0, maxTime: 0, points: 0 },
            modified: { minTime: 0, maxTime: 0, points: 0 },
            fine: 0, 
            impound: 0, 
            suspension: 0, 
            bailStatus: { eligible: false, discretionary: false, noBail: false, hasBailCharge: false }, 
            highestBail: 0 
        }
      );
    
      const getBailStatus = () => {
        if (!totals.bailStatus.hasBailCharge) return 'N/A';
        if (totals.bailStatus.noBail) return 'NOT ELIGIBLE';
        if (totals.bailStatus.discretionary) return 'DISCRETIONARY';
        if (totals.bailStatus.eligible) return 'ELIGIBLE';
        return 'N/A';
      }
      
      const maxSentenceMinutes = config.MAX_SENTENCE_DAYS * 1440;
      const minTimeCapped = Math.min(totals.modified.minTime, maxSentenceMinutes);
      const maxTimeCapped = Math.min(totals.modified.maxTime, maxSentenceMinutes);
      const isCapped = totals.modified.minTime > maxSentenceMinutes || totals.modified.maxTime > maxSentenceMinutes;

      const formatTotalTime = (totalMinutes: number) => {
        if (totalMinutes === 0) return '0 minutes';
        totalMinutes = Math.round(totalMinutes);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;
        
        const parts = [];
        if(days > 0) parts.push(`${days} Day(s)`);
        if(hours > 0) parts.push(`${hours} Hour(s)`);
        if(minutes > 0) parts.push(`${minutes} Minute(s)`);
    
        return `${parts.join(' ')} (${totalMinutes} mins)`;
      }

      const handleCopyToClipboard = (text: string | number) => {
        navigator.clipboard.writeText(text.toString());
        toast({
            title: "Copied!",
            description: `"${text}" copied to clipboard.`,
        });
    };

    const handleModifyCharges = () => {
      onModifyCharges?.();
      setChargesForModification(report);
      router.push('/arrest-calculator?modify=true');
    };

    const handleCopyCalculationLink = () => {
        const additionMapping: { [key: string]: number } = {
            'Offender': 1, 'Accomplice': 2, 'Accessory': 3,
            'Conspiracy': 4, 'Attempt': 5, 'Solicitation': 6, 'Parole Violation': 7,
        };

        const chargeParams = report.map(charge => {
            const chargeDetails = penalCode[charge.chargeId!];
            if (!chargeDetails) return null;

            const classChar = charge.class?.charAt(0).toLowerCase() || '';
            const chargeId = chargeDetails.id;
            const offense = charge.offense || '1';
            const addition = additionMapping[charge.addition!] || '1';

            let chargeStr = `${classChar}${chargeId}-${offense}-${addition}`;

            if (charge.category && chargeDetails.drugs) {
                const categoryIndex = Object.keys(chargeDetails.drugs).find(key => chargeDetails.drugs![key] === charge.category);
                if (categoryIndex) {
                    chargeStr += `-${categoryIndex}`;
                }
            }
            return `c=${encodeURIComponent(chargeStr)}`;
        }).filter(Boolean);

        if (chargeParams.length > 0) {
            const url = `${window.location.origin}/arrest-calculation?${chargeParams.join('&')}`;
            navigator.clipboard.writeText(url);
            toast({
                title: "Link Copied!",
                description: "Arrest calculation link copied to clipboard.",
            });
        }
    }

    const hasAnyModifiers = calculationResults.some(r => r?.isModified);

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
                {calculationResults.map((result) => {
                    if (!result) return null;
                    const { row, chargeDetails, additionDetails, isModified, original, modified, fine, impound, suspension, bailAuto, bailCost } = result;

                    const typePrefix = `${chargeDetails.type}${row.class}`;
                    const title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;

                    return (
                        <TableRow key={row.uniqueId}>
                             <TableCell 
                                className={cn("font-medium", clickToCopy && "cursor-pointer hover:text-primary")}
                                onClick={clickToCopy ? () => handleCopyToClipboard(title) : undefined}
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
                                <span className={cn('font-bold', {
                                    'text-red-500': chargeDetails.type === 'F',
                                    'text-yellow-500': chargeDetails.type === 'M',
                                    'text-green-500': chargeDetails.type === 'I',
                                })}>
                                    {getType(chargeDetails.type)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {formatTotalTime(modified.minTime).split('(')[0].trim()}
                                    {isModified && (
                                        <Tooltip>
                                            <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
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
                                            <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
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
                                            <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Original: {original.points} points</p>
                                                <p>Modified: {Math.round(modified.points)} points</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell 
                                className={cn(clickToCopy && "cursor-pointer hover:text-primary")}
                                onClick={clickToCopy ? () => handleCopyToClipboard(fine) : undefined}
                             >${fine.toLocaleString()}</TableCell>
                            <TableCell>{impound > 0 ? `${impound} Day(s)` : 'No'}</TableCell>
                            <TableCell>{suspension > 0 ? `${suspension} Day(s)` : 'No'}</TableCell>
                            <TableCell><BailStatusBadge bailInfo={{ auto: bailAuto }} /></TableCell>
                            <TableCell>{formatBailCost({ auto: bailAuto, cost: bailCost })}</TableCell>
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
            <CardHeader><CardTitle>Stipulations</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Charge</TableHead><TableHead>Stipulation</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {extras.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item!.title}</TableCell>
                                <TableCell>{item!.extra}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      {showSummary && (
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            {isCapped && (
                <Alert variant="warning" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Sentence Capped</AlertTitle>
                    <AlertDescription>
                        The total sentence time has been capped at {config.MAX_SENTENCE_DAYS} days as per Legal Faction Management policy. The original uncapped totals are shown below for reference.
                        <br /><b>Original Min Time:</b> {formatTotalTime(totals.modified.minTime)}
                        <br /><b>Original Max Time:</b> {formatTotalTime(totals.modified.maxTime)}
                    </AlertDescription>
                </Alert>
            )}
            <Table>
                <TableHeader><TableRow>
                    <TableHead>Total Min Time</TableHead>
                    <TableHead>Total Max Time</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Total Fine</TableHead>
                    <TableHead>Total Impound</TableHead>
                    <TableHead>Total Suspension</TableHead>
                    <TableHead>Bail Status</TableHead>
                    <TableHead>Highest Bail Amount</TableHead>
                </TableRow></TableHeader>
                <TableBody><TableRow>
                    <TableCell>
                         <div className="flex items-center gap-1">
                            {formatTotalTime(minTimeCapped)}
                            {hasAnyModifiers && (
                                <Tooltip>
                                    <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
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
                                    <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
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
                                    <TooltipTrigger><Asterisk className="h-3 w-3 text-yellow-500" /></TooltipTrigger>
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
                            const status = getBailStatus();
                            if (status === 'NOT ELIGIBLE') return <Badge variant="destructive">NOT ELIGIBLE</Badge>;
                            if (status === 'DISCRETIONARY') return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
                            if (status === 'ELIGIBLE') return <Badge className="bg-green-500 hover:bg-green-600 text-white">ELIGIBLE</Badge>;
                            return <Badge variant="secondary">N/A</Badge>;
                        })()}
                    </TableCell>
                    <TableCell>${totals.highestBail.toLocaleString()}</TableCell>
                </TableRow></TableBody>
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
