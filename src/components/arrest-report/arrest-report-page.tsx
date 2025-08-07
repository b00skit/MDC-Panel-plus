'use client';

import { useChargeStore } from '@/stores/charge-store';
import { PageHeader } from '@/components/dashboard/page-header';
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
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

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

const formatTimeInMinutes = (time: { days: number; hours: number; min: number }) => {
    if (!time) return 0;
    return time.days * 1440 + time.hours * 60 + time.min;
}

const BailStatusBadge = ({ bailInfo }: { bailInfo: any }) => {
  if (bailInfo.auto === false) {
    return <Badge variant="destructive">NO BAIL</Badge>;
  }
  if (bailInfo.auto === true) {
    return <Badge className="bg-green-500 hover:bg-green-600 text-white">AUTO BAIL</Badge>;
  }
  if (bailInfo.auto === 2) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
  }
  return <Badge variant="secondary">N/A</Badge>;
};


const formatBailCost = (bailInfo: any) => {
    if (bailInfo.auto === false || bailInfo.cost === 0) return 'N/A';
    const bond = bailInfo.cost * 0.1;
    return `$${bailInfo.cost.toLocaleString()} / $${bond.toLocaleString()} (10%)`;
};

export function ArrestReportPage() {
  const { report, penalCode } = useChargeStore();
  const router = useRouter();

  useEffect(() => {
    if (report.length === 0) {
      router.push('/arrest-calculator');
    }
  }, [report, router]);

  if (report.length === 0 || !penalCode) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader
                title="Arrest Report"
                description="No report data available. Please generate one from the calculator."
            />
        </div>
    );
  }

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
      if (impound) acc.impound = true;

      const suspension = chargeDetails.suspension?.[row.offense as keyof typeof chargeDetails.suspension];
      if (suspension) acc.suspension = true;

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
        acc.bailCost += getBailCost() || 0;
      }
      
      return acc;
    },
    { minTime: 0, maxTime: 0, points: 0, fine: 0, impound: false, suspension: false, bailStatus: { eligible: false, discretionary: false, noBail: false }, bailCost: 0 }
  );

  const getBailStatus = () => {
    if(totals.bailStatus.noBail) return 'NOT ELIGIBLE';
    if(totals.bailStatus.discretionary) return 'DISCRETIONARY';
    if(totals.bailStatus.eligible) return 'ELIGIBLE';
    return 'N/A';
  }
  
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Arrest Report"
        description="A summary of the calculated charges."
      />

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
                    <TableHead>Extra</TableHead>
                    <TableHead>Bail</TableHead>
                    <TableHead>Bail / Bond</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {report.map((row) => {
                    const chargeDetails = penalCode[row.chargeId!];
                    if (!chargeDetails) return null;

                    const isDrugCharge = !!chargeDetails.drugs;

                    const typePrefix = `${chargeDetails.type}${row.class}`;
                    const title = `${typePrefix} ${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
                    
                    const getTime = (timeObj: any) => {
                        if(!timeObj) return 'N/A';
                         if (isDrugCharge && row.category) {
                            return formatTime(timeObj[row.category]);
                        }
                        return formatTime(timeObj);
                    }
                    const minTime = getTime(chargeDetails.time);
                    const maxTime = getTime(chargeDetails.maxtime);

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
                            <TableCell>{impound ? `Yes | ${impound} Days` : 'No'}</TableCell>
                            <TableCell>{suspension ? `Yes | ${suspension} Days` : 'No'}</TableCell>
                            <TableCell>{chargeDetails.extra || 'N/A'}</TableCell>
                            <TableCell><BailStatusBadge bailInfo={bailInfo} /></TableCell>
                            <TableCell>{formatBailCost(bailInfo)}</TableCell>
                        </TableRow>
                    );
                })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Total Min Time</TableHead>
                        <TableHead>Total Max Time</TableHead>
                        <TableHead>Total Points</TableHead>
                        <TableHead>Total Fine</TableHead>
                        <TableHead>Impound</TableHead>
                        <TableHead>Suspension</TableHead>
                        <TableHead>Bail Status</TableHead>
                        <TableHead>Total Bail Cost</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>{formatTotalTime(totals.minTime)}</TableCell>
                        <TableCell>{formatTotalTime(totals.maxTime)}</TableCell>
                        <TableCell>{totals.points}</TableCell>
                        <TableCell>${totals.fine.toLocaleString()}</TableCell>
                        <TableCell>{totals.impound ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{totals.suspension ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{getBailStatus()}</TableCell>
                        <TableCell>${totals.bailCost.toLocaleString()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
            This tool is for informational purposes only and does not constitute legal advice. All calculations are based on the provided penal code and may not reflect all sentencing factors. Consult with a legal professional for official guidance.
        </AlertDescription>
      </Alert>
    </div>
  );
}
