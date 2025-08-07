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
import { AlertTriangle, Clipboard } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useFormStore } from '@/stores/form-store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { renderToStaticMarkup } from 'react-dom/server';


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

const ChargesTable = ({ report, penalCode }: { report: any[], penalCode: any }) => (
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
);

const SummaryTable = ({ totals }: { totals: any }) => {
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
                            <TableCell>
                                {(() => {
                                    const status = getBailStatus();
                                    switch (status) {
                                        case 'NOT ELIGIBLE':
                                            return <Badge variant="destructive">NOT ELIGIBLE</Badge>;
                                        case 'DISCRETIONARY':
                                            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">DISCRETIONARY</Badge>;
                                        case 'ELIGIBLE':
                                            return <Badge className="bg-green-500 hover:bg-green-600 text-white">ELIGIBLE</Badge>;
                                        default:
                                            return <Badge variant="secondary">N/A</Badge>;
                                    }
                                })()}
                            </TableCell>
                            <TableCell>${totals.bailCost.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


const FormattedReport = ({ formData, report, penalCode, totals, innerRef }: any) => {
    const { general, arrest, location, evidence, officers } = formData;
    
    const getReportHeader = () => {
        const primaryOfficer = officers?.[0];
        if (primaryOfficer?.department === 'Los Santos Police Department') {
            return 'CITY OF LOS SANTOS';
        }
        return 'COUNTY OF LOS SANTOS';
    };

    return (
      <Card className="p-8 font-serif" ref={innerRef}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold uppercase">{getReportHeader()}</h1>
          <h2 className="text-2xl font-semibold">Arrest Report</h2>
        </div>
  
        <div className="border-4 border-black p-4 space-y-4">
          {/* Section 1: General Information */}
          <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">1. GENERAL INFORMATION</h3>
            <div className="grid grid-cols-3 gap-x-4">
              <div className="border p-2"><span className="font-semibold">A. DATE:</span> {general.date}</div>
              <div className="border p-2"><span className="font-semibold">B. TIME (24HR):</span> {general.time}</div>
              <div className="border p-2"><span className="font-semibold">C. CALLSIGN:</span> {general.callSign}</div>
            </div>
          </div>
  
          {/* Section 2: Officer Information */}
          <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">2. OFFICER(S) INFORMATION</h3>
            {officers.map((officer: any, index: number) => (
                <div key={officer.id} className="grid grid-cols-12 gap-x-4 mb-2">
                    <div className="border p-2 col-span-5"><span className="font-semibold">A. OFFICER {index + 1} NAME:</span> {officer.name}</div>
                    <div className="border p-2 col-span-4"><span className="font-semibold">B. RANK:</span> {officer.rank}</div>
                    <div className="border p-2 col-span-3"><span className="font-semibold">C. BADGE:</span> {officer.badgeNumber}</div>
                </div>
            ))}
          </div>

          {/* Section 3: Suspect Information */}
           <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">3. SUSPECT INFORMATION</h3>
            <div className="grid grid-cols-1">
              <div className="border p-2"><span className="font-semibold">A. FULL NAME:</span> {arrest.suspectName}</div>
            </div>
          </div>
  
          {/* Section 4: Location of Arrest */}
          <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">4. LOCATION OF ARREST</h3>
             <div className="grid grid-cols-2 gap-x-4">
              <div className="border p-2"><span className="font-semibold">A. DISTRICT:</span> {location.district}</div>
              <div className="border p-2"><span className="font-semibold">B. STREET:</span> {location.street}</div>
            </div>
          </div>
  
          {/* Section 5: Charges */}
          <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">5. CHARGES</h3>
            <div className="border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-200 dark:bg-gray-700">
                            <TableHead className="w-[70%]">CHARGE DESCRIPTION</TableHead>
                            <TableHead>TYPE</TableHead>
                            <TableHead>CLASS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.map((row: any) => {
                             const chargeDetails = penalCode[row.chargeId!];
                             if (!chargeDetails) return null;
                             const title = `${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
                             return (
                                <TableRow key={row.uniqueId}>
                                    <TableCell>{title}</TableCell>
                                    <TableCell>{getType(chargeDetails.type)}</TableCell>
                                    <TableCell>{row.class}</TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            </div>
          </div>
  
          {/* Section 6: Narrative */}
          <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">6. NARRATIVE</h3>
            <div className="border p-2 min-h-[150px] whitespace-pre-wrap">{arrest.narrative}</div>
          </div>

           {/* Section 7: Evidence */}
           <div className="border-b-2 border-black pb-2">
            <h3 className="font-bold text-lg mb-2">7. EVIDENCE</h3>
            <div className="border p-2 mb-2 min-h-[100px] whitespace-pre-wrap"><span className="font-semibold block mb-1">A. SUPPORTING EVIDENCE:</span>{evidence.supporting}</div>
            <div className="border p-2 min-h-[100px] whitespace-pre-wrap"><span className="font-semibold block mb-1">B. DASHCAM FOOTAGE:</span>{evidence.dashcam}</div>
          </div>
  
          {/* Section 8: Processing Summary */}
          <div>
            <h3 className="font-bold text-lg mb-2">8. SENTENCING & AUTO-BAIL SUMMARY</h3>
            <div className="border p-2">
                <p><strong>MINIMUM SENTENCE:</strong> {totals ? formatTotalTime(totals.minTime) : 'N/A'}</p>
                <p><strong>MAXIMUM SENTENCE:</strong> {totals ? formatTotalTime(totals.maxTime) : 'N/A'}</p>
                <p><strong>TOTAL FINE:</strong> ${totals ? totals.fine.toLocaleString() : 'N/A'}</p>
                <p><strong>POINTS:</strong> {totals ? totals.points : 'N/A'}</p>
                <p><strong>BAIL STATUS:</strong> {totals ? getBailStatus(totals) : 'N/A'}</p>
                <p><strong>BAIL AMOUNT:</strong> ${totals ? totals.bailCost.toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  

const getBailStatus = (totals: any) => {
    if(totals.bailStatus.noBail) return 'NOT ELIGIBLE';
    if(totals.bailStatus.discretionary) return 'DISCRETIONARY';
    if(totals.bailStatus.eligible) return 'ELIGIBLE';
    return 'N/A';
};

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
};

export function PaperworkSubmitPage() {
  const { report, penalCode } = useChargeStore();
  const { formData } = useFormStore();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportHtml, setReportHtml] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasReport = isClient && report.length > 0 && !!penalCode;
  
  const totals = hasReport ? report.reduce(
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
  ) : null;

  useEffect(() => {
    if (reportRef.current) {
        // A hack to remove the data-ref attributes from the rendered HTML
        const clonedNode = reportRef.current.cloneNode(true) as HTMLElement;
        clonedNode.querySelectorAll('[data-ref]').forEach(el => el.removeAttribute('data-ref'));
        setReportHtml(clonedNode.innerHTML);
    }
  }, [formData, report, penalCode, totals]);

  const handleCopy = () => {
    if (reportRef.current) {
      const htmlToCopy = reportRef.current.outerHTML;
      navigator.clipboard.writeText(htmlToCopy);
      toast({
        title: "Success",
        description: "Arrest report HTML copied to clipboard.",
        variant: "default",
      })
    }
  };

  if (!isClient) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Paperwork Submission"
        description="Review the calculated charges and the formatted arrest report below."
      />
        
      {hasReport && (
        <div className="space-y-6">
            <ChargesTable report={report} penalCode={penalCode} />
            <SummaryTable totals={totals} />
            <Separator />
            <FormattedReport innerRef={reportRef} formData={formData} report={report} penalCode={penalCode} totals={totals} />
        </div>
      )}

       <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={handleCopy} disabled={!hasReport}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Arrest Report
            </Button>
        </div>
        <div className="space-y-2">
            <label htmlFor="final-submission" className="font-medium">Final Submission Area (HTML)</label>
            <Textarea 
                id="final-submission"
                placeholder="The HTML for the report will be generated here."
                className="min-h-[200px] font-mono text-xs"
                value={reportHtml}
                readOnly
            />
        </div>
      </div>

    </div>
  );
}

    