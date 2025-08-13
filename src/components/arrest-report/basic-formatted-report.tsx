
'use client';

import { useEffect, useState } from 'react';

const getType = (type: string | undefined) => {
    switch (type) {
      case 'F': return 'Felony';
      case 'M': return 'Misdemeanor';
      case 'I': return 'Infraction';
      default: return 'Unknown';
    }
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

const formatTimeInMinutes = (time: { days: number; hours: number; min: number }) => {
    if (!time) return 0;
    return time.days * 1440 + time.hours * 60 + time.min;
}

const getBailStatus = (totals: any) => {
    if(totals.bailStatus.noBail) return 'NOT ELIGIBLE';
    if(totals.bailStatus.discretionary) return 'DISCRETIONARY';
    if(totals.bailStatus.eligible) return 'ELIGIBLE';
    return 'N/A';
};

interface BasicFormattedReportProps {
    formData: any;
    report: any[];
    penalCode: any;
    innerRef: React.RefObject<HTMLTableElement>;
}

export function BasicFormattedReport({ formData, report, penalCode, innerRef }: BasicFormattedReportProps) {
    const { general, arrest, location, evidence, officers } = formData;
    const [header, setHeader] = useState('COUNTY OF LOS SANTOS');

    useEffect(() => {
        if (officers && officers.length > 0 && officers[0].department) {
            setHeader(officers[0].department.toUpperCase());
        }
    }, [officers]);

    const totals = report.reduce(
        (acc, row) => {
            const chargeDetails = penalCode[row.chargeId!];
            if (!chargeDetails) return acc;
            
            const isDrugCharge = !!chargeDetails.drugs;
      
            const getTime = (timeObj: any) => {
              if (!timeObj) return { days: 0, hours: 0, min: 0 };
              if (isDrugCharge && row.category) return timeObj[row.category] || { days: 0, hours: 0, min: 0 };
              return timeObj;
            }
            
            const getFine = (fineObj: any) => {
              if (!fineObj) return 0;
              if(isDrugCharge && row.category) return fineObj[row.category] || 0;
              return fineObj[row.offense!] || 0;
            }
      
            acc.minTime += formatTimeInMinutes(getTime(chargeDetails.time));
            acc.maxTime += formatTimeInMinutes(getTime(chargeDetails.maxtime));
            acc.fine += getFine(chargeDetails.fine);
            acc.points += chargeDetails.points?.[row.class as keyof typeof chargeDetails.points] ?? 0;
            
            const getBailAuto = () => (typeof chargeDetails.bail.auto === 'object' && row.category) ? chargeDetails.bail.auto[row.category] : chargeDetails.bail.auto;
            const bailAuto = getBailAuto();
            if(bailAuto === false) acc.bailStatus.noBail = true;
            if(bailAuto === 2) acc.bailStatus.discretionary = true;
            if(bailAuto === true) acc.bailStatus.eligible = true;
            
            if (bailAuto !== false) {
              const getBailCost = () => (typeof chargeDetails.bail.cost === 'object' && row.category) ? chargeDetails.bail.cost[row.category] : chargeDetails.bail.cost;
              const currentBail = getBailCost() || 0;
              if (currentBail > acc.highestBail) {
                  acc.highestBail = currentBail;
              }
            }
            
            return acc;
        },
        { minTime: 0, maxTime: 0, points: 0, fine: 0, bailStatus: { eligible: false, discretionary: false, noBail: false }, highestBail: 0 }
    );
      

    return (
        <table ref={innerRef} style={{ width: '100%', fontFamily: "'Times New Roman', serif", borderCollapse: 'collapse', border: '4px solid black' }}>
            <tbody>
                <tr>
                    <td colSpan={3} style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                        <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>{header}</h1>
                        <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Arrest Report</h2>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>1. GENERAL INFORMATION</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>A. DATE:</strong> {general.date}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>B. TIME (24HR):</strong> {general.time}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>C. CALLSIGN:</strong> {general.callSign}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>2. OFFICER(S) INFORMATION</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {officers.map((officer: any, index: number) => (
                                    <tr key={officer.id}>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '41.66%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>A. OFFICER {index + 1} NAME:</strong> {officer.name}</td>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>B. RANK:</strong> {officer.rank}</td>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '25%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>C. BADGE:</strong> #{officer.badgeNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>3. SUSPECT INFORMATION</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>A. FULL NAME:</strong> {arrest.suspectName}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>4. LOCATION OF ARREST</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>A. DISTRICT:</strong> {location.district}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>B. STREET:</strong> {location.street}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>5. CHARGES</h3>
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
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>6. NARRATIVE</h3>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '150px', whiteSpace: 'pre-wrap', margin: 0 }}>{arrest.narrative}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>7. EVIDENCE</h3>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: '0 0 0.5rem 0' }}>
                            <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>A. SUPPORTING EVIDENCE:</strong>
                            {evidence.supporting}
                        </p>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: 0 }}>
                            <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>B. DASHCAM FOOTAGE:</strong>
                            {evidence.dashcam}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>8. SENTENCING & AUTO-BAIL SUMMARY</h3>
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
}
