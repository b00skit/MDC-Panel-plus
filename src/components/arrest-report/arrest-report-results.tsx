
'use client';

import { useChargeStore, type PenalCode, type SelectedCharge } from '@/stores/charge-store';
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
import { AlertTriangle, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import config from '../../../data/config.json';


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
  if (bailInfo.auto === false) return <Badge variant="destructive">NO BAIL</Badge>;
  if (bailInfo.auto === true) return <Badge className="bg-green-500 hover:bg-green-600 text-white">AUTO BAIL</Badge>;
  if (bailInfo.auto === 2) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
  return <Badge variant="secondary">N/A</Badge>;
};


const formatBailCost = (bailInfo: any) => {
    if (bailInfo.auto === false || !bailInfo.cost || bailInfo.cost === 0) return 'N/A';
    return `$${bailInfo.cost.toLocaleString()}`;
};

const CopyableCard = ({ label, value }: { label: string, value: string | number }) => {
    const { toast } = useToast();
  
    const handleCopy = () => {
      navigator.clipboard.writeText(value.toString());
      toast({
        title: 'Copied to clipboard!',
        description: `${label} value has been copied.`,
      });
    };
  
    return (
      <Card>
        <CardContent className="p-4">
          <Label htmlFor={`copy-${label.toLowerCase().replace(' ', '-')}`}>{label}</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input id={`copy-${label.toLowerCase().replace(' ', '-')}`} value={value} readOnly disabled />
            <Button size="icon" variant="outline" onClick={handleCopy}>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
};

interface ArrestReportResultsProps {
    report: SelectedCharge[];
    penalCode: PenalCode;
    showCharges?: boolean;
    showStipulations?: boolean;
    showSummary?: boolean;
    showCopyables?: boolean;
}

export function ArrestReportResults({ 
    report, 
    penalCode, 
    showCharges = false, 
    showStipulations = false, 
    showSummary = false, 
    showCopyables = false 
}: ArrestReportResultsProps) {
  
    const extras = report.map(row => {
        const chargeDetails = penalCode[row.chargeId!];
        if (chargeDetails && chargeDetails.extra && chargeDetails.extra !== 'N/A') {
            const typePrefix = `${chargeDetails.type}${row.class}`;
            const title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
            return { title, extra: chargeDetails.extra };
        }
        return null;
    }).filter(Boolean);

    const totals = report.reduce(
        (acc, row) => {
          const chargeDetails = penalCode[row.chargeId!];
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
            if(isDrugCharge && row.category) return fineObj[row.category] || 0;
            return fineObj[row.offense!] || 0;
          }
    
          const minTime = getTime(chargeDetails.time);
          const maxTime = getTime(chargeDetails.maxtime);
    
          acc.minTime += formatTimeInMinutes(minTime);
          acc.maxTime += formatTimeInMinutes(maxTime);
          acc.points += chargeDetails.points?.[row.class as keyof typeof chargeDetails.points] ?? 0;
          acc.fine += getFine(chargeDetails.fine);
          
          const impound = chargeDetails.impound?.[row.offense as keyof typeof chargeDetails.impound];
          if (impound) acc.impound += impound;
    
          const suspension = chargeDetails.suspension?.[row.offense as keyof typeof chargeDetails.suspension];
          if (suspension) acc.suspension += suspension;
    
          const getBailAuto = () => {
            if (typeof chargeDetails.bail.auto === 'object' && row.category) {
                return chargeDetails.bail.auto[row.category];
            }
            return chargeDetails.bail.auto;
          }
    
          const bailAuto = getBailAuto();
          if(bailAuto === false) acc.bailStatus.noBail = true;
          if(bailAuto === 2) acc.bailStatus.discretionary = true;
          if(bailAuto === true) acc.bailStatus.eligible = true;
          
          const getBailCost = () => {
             if (typeof chargeDetails.bail.cost === 'object' && row.category) {
                return chargeDetails.bail.cost[row.category];
            }
            return chargeDetails.bail.cost;
          }
          
          if (bailAuto !== false) {
            const currentBail = getBailCost() || 0;
            if (currentBail > acc.highestBail) {
                acc.highestBail = currentBail;
            }
          }
          
          return acc;
        },
        { minTime: 0, maxTime: 0, points: 0, fine: 0, impound: 0, suspension: 0, bailStatus: { eligible: false, discretionary: false, noBail: false }, highestBail: 0 }
      );
    
      if (totals.minTime > totals.maxTime) {
        totals.maxTime = totals.minTime;
      }
      
      const getBailStatus = () => {
        if(totals.bailStatus.noBail) return 'NOT ELIGIBLE';
        if(totals.bailStatus.discretionary) return 'DISCRETIONARY';
        if(totals.bailStatus.eligible) return 'ELIGIBLE';
        return 'N/A';
      }
      
      const maxSentenceMinutes = config.MAX_SENTENCE_DAYS * 1440;
      const minTimeCapped = Math.min(totals.minTime, maxSentenceMinutes);
      const maxTimeCapped = Math.min(totals.maxTime, maxSentenceMinutes);
      const isCapped = totals.minTime > maxSentenceMinutes || totals.maxTime > maxSentenceMinutes;

      const formatTotalTime = (totalMinutes: number) => {
        if (totalMinutes === 0) return '0 minutes';
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;
        
        const parts = [];
        if(days > 0) parts.push(`${days} Day(s)`);
        if(hours > 0) parts.push(`${hours} Hour(s)`);
        if(minutes > 0) parts.push(`${minutes} Minute(s)`);
    
        return `${parts.join(' ')} (${totalMinutes} mins)`;
      }

  return (
    <div className="space-y-6">
      {showCharges && (
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
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
                {report.map((row) => {
                    const chargeDetails = penalCode[row.chargeId!];
                    if (!chargeDetails) return null;

                    const isDrugCharge = !!chargeDetails.drugs;

                    const typePrefix = `${chargeDetails.type}${row.class}`;
                    const title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
                    
                    const getTime = (timeObj: any, simple = false) => {
                        if(!timeObj) return 'N/A';
                        let timeValue;
                        if (isDrugCharge && row.category) {
                            timeValue = timeObj[row.category];
                        } else {
                            timeValue = timeObj;
                        }
                        return simple ? formatTimeSimple(timeValue) : formatTime(timeValue);
                    }
                    const minTime = getTime(chargeDetails.time, true);
                    const maxTime = getTime(chargeDetails.maxtime, true);

                    const getFine = (fineObj: any) => {
                        if (!fineObj) return '$0';
                        if(isDrugCharge && row.category) return `$${(fineObj[row.category] || 0).toLocaleString()}`;
                        return `$${(fineObj[row.offense!] || 0).toLocaleString()}`;
                    }
                    
                    const impound = chargeDetails.impound?.[row.offense as keyof typeof chargeDetails.impound];
                    const suspension = chargeDetails.suspension?.[row.offense as keyof typeof chargeDetails.suspension];

                    const getBailInfo = () => {
                        let auto = chargeDetails.bail.auto;
                        let cost = chargeDetails.bail.cost;
                        if(isDrugCharge && row.category) {
                        if(typeof chargeDetails.bail.auto === 'object') auto = chargeDetails.bail.auto[row.category];
                        if(typeof chargeDetails.bail.cost === 'object') cost = chargeDetails.bail.cost[row.category];
                        }
                        return {auto, cost};
                    }
                    const bailInfo = getBailInfo();

                    return (
                        <TableRow key={row.uniqueId}>
                            <TableCell className="font-medium">{title}</TableCell>
                            <TableCell>{row.addition}</TableCell>
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
                            <TableCell>{minTime}</TableCell>
                            <TableCell>{maxTime}</TableCell>
                            <TableCell>{chargeDetails.points?.[row.class as keyof typeof chargeDetails.points] ?? 0}</TableCell>
                            <TableCell>{getFine(chargeDetails.fine)}</TableCell>
                            <TableCell>{impound ? `${impound} Day(s)` : 'No'}</TableCell>
                            <TableCell>{suspension ? `${suspension} Day(s)` : 'No'}</TableCell>
                            <TableCell><BailStatusBadge bailInfo={bailInfo} /></TableCell>
                            <TableCell>{formatBailCost(bailInfo)}</TableCell>
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
                        <br /><b>Original Min Time:</b> {formatTotalTime(totals.minTime)}
                        <br /><b>Original Max Time:</b> {formatTotalTime(totals.maxTime)}
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
                    <TableCell>{formatTotalTime(minTimeCapped)}</TableCell>
                    <TableCell>{formatTotalTime(maxTimeCapped)}</TableCell>
                    <TableCell>{totals.points}</TableCell>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CopyableCard label="Min Minutes" value={minTimeCapped} />
            <CopyableCard label="Max Minutes" value={maxTimeCapped} />
            <CopyableCard label="Total Fine" value={totals.fine} />
            <CopyableCard label="Bail Cost" value={totals.highestBail} />
        </div>
      )}
    </div>
  );
}
