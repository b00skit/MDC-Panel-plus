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
    const [header, setHeader] = useState('COUNTY OF LOS SANTOS');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedOfficer = localStorage.getItem('initial-officer-storage');
            if (storedOfficer) {
                try {
                    const parsedOfficer = JSON.parse(storedOfficer);
                    if (parsedOfficer.department) {
                        setHeader(parsedOfficer.department.toUpperCase());
                    }
                } catch (e) {
                    console.error('Failed to parse stored officer data', e);
                }
            }
        }
    }, []);
    

    return (
        <table
        ref={innerRef}
        style={{
            width: '100%',
            fontFamily: 'Times New Roman, serif',
            borderCollapse: 'collapse',
            border: '4px solid black',
        }}
        >
        <tbody>
            {/* Header */}
            <tr>
            <td colSpan={3} style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                {header}
                </h1>
                <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                Arrest Report
                </h2>
            </td>
            </tr>

            {/* Section 1: General Information */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                1. GENERAL INFORMATION
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>A. DATE:</strong> {general.date}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>B. TIME (24HR):</strong> {general.time}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>C. CALLSIGN:</strong> {general.callSign}
                    </td>
                    </tr>
                </tbody>
                </table>
            </td>
            </tr>

            {/* Section 2: Officer Information */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                2. OFFICER(S) INFORMATION
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {officers.map((officer: any, index: number) => (
                    <tr key={officer.id}>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '41.66%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>A. OFFICER {index + 1} NAME:</strong> {officer.name}
                        </td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>B. RANK:</strong> {officer.rank}
                        </td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '25%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>C. BADGE:</strong> {officer.badgeNumber}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </td>
            </tr>

            {/* Section 3: Suspect Information */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                3. SUSPECT INFORMATION
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>A. FULL NAME:</strong> {arrest.suspectName}
                    </td>
                    </tr>
                </tbody>
                </table>
            </td>
            </tr>

            {/* Section 4: Location of Arrest */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                4. LOCATION OF ARREST
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>A. DISTRICT:</strong> {location.district}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}>
                        <strong style={{ fontFamily: 'Arial, sans-serif' }}>B. STREET:</strong> {location.street}
                    </td>
                    </tr>
                </tbody>
                </table>
            </td>
            </tr>

            {/* Section 5: Charges */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                5. CHARGES
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                <thead style={{ backgroundColor: '#E5E7EB' }}>
                    <tr>
                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>CHARGE DESCRIPTION</th>
                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>TYPE</th>
                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>CLASS</th>
                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>OFFENCE</th>
                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>ADDITION</th>
                    </tr>
                </thead>
                <tbody>
                    {report.map((row: any) => {
                    const chargeDetails = penalCode[row.chargeId!];
                    if (!chargeDetails) return null;
                    const title = `${chargeDetails.id}. ${chargeDetails.charge}${row.offense !== '1' ? ` (Offence #${row.offense})` : ''}`;
                    return (
                        <tr key={row.uniqueId}>
                        <td style={{ border: '1px solid black', padding: '0.5rem' }}>{title}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem' }}>{getType(chargeDetails.type)}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem' }}>{row.class}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem' }}>{row.offense}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem' }}>{row.addition}</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </td>
            </tr>
            
            {/* Section 6: Narrative */}
            <tr>
                <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    6. NARRATIVE
                    </h3>
                    <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '150px', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {arrest.narrative}
                    </p>
                </td>
            </tr>

            {/* Section 7: Evidence */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                7. EVIDENCE
                </h3>
                <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: '0 0 0.5rem 0' }}>
                <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>
                    A. SUPPORTING EVIDENCE:
                </strong>
                {evidence.supporting}
                </p>
                <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: 0 }}>
                <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>
                    B. DASHCAM FOOTAGE:
                </strong>
                {evidence.dashcam}
                </p>
            </td>
            </tr>

            {/* Section 8: Processing Summary */}
            <tr>
            <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                8. SENTENCING & AUTO-BAIL SUMMARY
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>
                        <p style={{ margin: 0 }}><strong>MINIMUM SENTENCE:</strong> {totals ? formatTotalTime(totals.minTime) : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>MAXIMUM SENTENCE:</strong> {totals ? formatTotalTime(totals.maxTime) : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>TOTAL FINE:</strong> ${totals ? totals.fine.toLocaleString() : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>POINTS:</strong> {totals ? totals.points : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>BAIL STATUS:</strong> {totals ? getBailStatus(totals) : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>BAIL AMOUNT:</strong> ${totals ? totals.bailCost.toLocaleString() : 'N/A'}</p>
                    </td>
                    </tr>
                </tbody>
                </table>
            </td>
            </tr>
        </tbody>
        </table>
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
  const reportRef = useRef<HTMLTableElement>(null);
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
        
        // A hack to remove react-specific attributes.
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = clonedNode.outerHTML;
        tempDiv.querySelectorAll('*').forEach(el => {
            for (const attr of el.attributes) {
                if (attr.name.startsWith('data-') || attr.name === 'class') {
                    el.removeAttribute(attr.name);
                }
            }
        });

        setReportHtml(tempDiv.innerHTML);
    }
  }, [formData, report, penalCode, totals, isClient]);

  const handleCopy = () => {
    if (reportRef.current) {
      navigator.clipboard.writeText(reportHtml);
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
            <div className='p-4 border rounded-lg bg-card'>
              <FormattedReport innerRef={reportRef} formData={formData} report={report} penalCode={penalCode} totals={totals} />
            </div>
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

    