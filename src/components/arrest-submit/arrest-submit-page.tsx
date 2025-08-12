
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
import { Clipboard, Info } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useFormStore } from '@/stores/form-store';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


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
    if (bailInfo.auto === false || !bailInfo.cost || bailInfo.cost === 0) return 'N/A';
    return `$${bailInfo.cost.toLocaleString()}`;
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
                            <TableHead>Highest Bail Amount</TableHead>
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
                            <TableCell>${totals.highestBail.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


const BasicFormattedReport = ({ formData, report, penalCode, totals, innerRef }: any) => {
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
                        <p style={{ margin: 0 }}><strong>BAIL AMOUNT:</strong> ${totals ? totals.highestBail.toLocaleString() : 'N/A'}</p>
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

  const AdvancedFormattedReport = ({ formData, innerRef }: any) => {
    const { arrestee, persons, incident, officers, narrative } = formData;
    
    const renderWithBreaks = (text: string | undefined) => {
        if (!text) return <span style={{ fontFamily: "'Times New Roman', serif" }}>N/A</span>;
        return text.split('\n').map((line, index, arr) => (
            <span key={index} style={{ fontFamily: "'Times New Roman', serif" }}>
                {line}
                {index < arr.length - 1 && <br />}
            </span>
        ));
    };

    const cellStyle = { fontSize: '14px', borderTop: 'none', color: 'black', fontFamily: "'Times New Roman', serif" };
    const headerCellStyle = { fontWeight: 'bold', fontSize: '10px', borderBottom: 'none', backgroundColor: 'white' };
    const sectionHeaderStyle = { fontWeight: 'bold', fontSize: '10px', borderTop: '2px solid black', borderBottom: 'none', backgroundColor: 'white' };

    return (
        <div ref={innerRef} style={{ padding: '2px', border: '1px solid #000', backgroundColor: 'white', width: '100%', maxWidth: '210mm', color: 'black', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
                LOS SANTOS POLICE DEPARTMENT<br />ARREST REPORT
            </h1>
            <table border={1} cellPadding={2} style={{ width: '100%', borderCollapse: 'collapse', color: 'black' }}>
                <tbody>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>ARRESTEE NAME (FIRST, MIDDLE, LAST)</th>
                        <th style={headerCellStyle}>SEX (M/F/O)</th>
                        <th style={headerCellStyle}>HAIR</th>
                        <th style={headerCellStyle}>EYES</th>
                    </tr>
                    <tr>
                        <td colSpan={2} style={cellStyle}>{arrestee.name || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.sex || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.hair || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.eyes || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>RESIDENCE</th>
                        <th style={headerCellStyle}>AGE</th>
                        <th style={headerCellStyle}>HEIGHT</th>
                        <th style={headerCellStyle}>DESCENT</th>
                    </tr>
                    <tr>
                        <td colSpan={2} style={cellStyle}>{arrestee.residence || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.age || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.height || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.descent || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={3} style={headerCellStyle}>CLOTHING</th>
                        <th colSpan={2} style={headerCellStyle}>PERSONAL ODDITIES</th>
                    </tr>
                    <tr>
                        <td colSpan={3} style={cellStyle}>{arrestee.clothing || 'N/A'}</td>
                        <td colSpan={2} style={cellStyle}>{arrestee.oddities || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={3} style={headerCellStyle}>MONIKER / ALIAS</th>
                        <th colSpan={2} style={headerCellStyle}>GANG / CLUB</th>
                    </tr>
                    <tr>
                        <td colSpan={3} style={cellStyle}>{arrestee.alias || 'N/A'}</td>
                        <td colSpan={2} style={cellStyle}>{arrestee.gang || 'N/A'}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>PERSONS WITH SUBJECT</th></tr>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>NAME (FIRST, MIDDLE, LAST)</th>
                        <th style={headerCellStyle}>SEX (M/F/O)</th>
                        <th colSpan={2} style={headerCellStyle}>GANG / MONIKER</th>
                    </tr>
                    {persons.map((person: any, index: number) => (
                        <tr key={index}>
                            <td colSpan={2} style={cellStyle}>{person.name || 'N/A'}</td>
                            <td style={cellStyle}>{person.sex || 'N/A'}</td>
                            <td colSpan={2} style={cellStyle}>{person.gang || 'N/A'}</td>
                        </tr>
                    ))}
                     <tr><th style={{...headerCellStyle, ...sectionHeaderStyle}}>DATE</th>
                        <th style={{...headerCellStyle, ...sectionHeaderStyle}}>TIME</th>
                        <th colSpan={3} style={{...headerCellStyle, ...sectionHeaderStyle, textTransform: 'uppercase' }}>LOCATION</th></tr>
                    <tr>
                        <td style={cellStyle}>{incident.date || 'N/A'}</td>
                        <td style={cellStyle}>{incident.time || 'N/A'}</td>
                        <td colSpan={3} style={cellStyle}>{incident.locationStreet || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th style={headerCellStyle}>OFFICER</th>
                        <th style={headerCellStyle}>SERIAL NO.</th>
                        <th style={headerCellStyle}>CALLSIGN</th>
                        <th colSpan={2} style={headerCellStyle}>DIV / DETAIL</th>
                    </tr>
                    {officers.map((officer: any, index: number) => (
                         <tr key={index}>
                            <td style={cellStyle}>{officer.rank || 'N/A'} {officer.name || 'N/A'}</td>
                            <td style={cellStyle}>{officer.badgeNumber || 'N/A'}</td>
                            <td style={cellStyle}>{officer.callSign || 'N/A'}</td>
                            <td colSpan={2} style={cellStyle}>{officer.divDetail || 'N/A'}</td>
                        </tr>
                    ))}
                    <tr><th colSpan={5} style={sectionHeaderStyle}>SOURCE OF ACTIVITY</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.source)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>INVESTIGATION</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.investigation)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>ARREST</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.arrest)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), AND DIGITAL IMAGING</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.photographs)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>BOOKING</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.booking)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>PHYSICAL EVIDENCE</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.evidence)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>COURT INFORMATION</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.court)}</td>
                    </tr>
                    <tr><th colSpan={5} style={headerCellStyle}>ADDITIONAL</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.additional)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
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

function ArrestSubmitContent() {
    const { report, penalCode } = useChargeStore();
    const { formData: basicFormData } = useFormStore();
    const { formData: advancedFormData } = useAdvancedReportStore();

    const searchParams = useSearchParams();
    const reportType = searchParams.get('type') || 'basic';
    
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
    const [reportHtml, setReportHtml] = useState('');
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    const isBasicReport = reportType === 'basic';
    const isAdvancedReport = reportType === 'advanced';
    
    const formData = isBasicReport ? basicFormData : advancedFormData;
    
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
            const currentBail = getBailCost() || 0;
            if (currentBail > acc.highestBail) {
                acc.highestBail = currentBail;
            }
        }
        
        return acc;
      },
      { minTime: 0, maxTime: 0, points: 0, fine: 0, impound: false, suspension: false, bailStatus: { eligible: false, discretionary: false, noBail: false }, highestBail: 0 }
    ) : null;
  
    useEffect(() => {
        if (reportRef.current) {
            setReportHtml(reportRef.current.outerHTML);
        }
    }, [formData, report, penalCode, totals, isClient, reportType]);
  
    const handleCopy = () => {
        if (reportRef.current) {
          navigator.clipboard.writeText(reportRef.current.outerHTML);
          toast({
            title: "Success",
            description: "Paperwork HTML copied to clipboard.",
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
          title="Arrest Report Submission"
          description="Review the calculated charges and the formatted arrest report below."
        />
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                The preview on this page may not look 100% accurate, but the generated HTML is designed to work perfectly on the actual MDC.
            </AlertDescription>
        </Alert>
          
        {( (isBasicReport || isAdvancedReport) && hasReport && totals) ? (
            <div className="space-y-6">
                <ChargesTable report={report} penalCode={penalCode} />
                <SummaryTable totals={totals} />
                <Separator />
                <div className='p-4 border rounded-lg bg-card'>
                {isBasicReport && (
                    <BasicFormattedReport innerRef={reportRef} formData={formData} report={report} penalCode={penalCode} totals={totals} />
                )}
                {isAdvancedReport && (
                    <AdvancedFormattedReport innerRef={reportRef} formData={formData} />
                )}
                </div>
            </div>
        ): null }
  
         <div className="space-y-4 mt-6">
          <div className="flex justify-end">
              <Button onClick={handleCopy} disabled={isClient && !formData}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy Paperwork
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

export function ArrestSubmitPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArrestSubmitContent />
        </Suspense>
    )
}
