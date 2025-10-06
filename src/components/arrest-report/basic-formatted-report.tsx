
'use client';

import { useEffect, useState } from 'react';
import type { ArrestCalculation } from '@/lib/arrest-calculator';
import { useChargeStore } from '@/stores/charge-store';
import configData from '../../../data/config.json';
import { useScopedI18n } from '@/lib/i18n/client';

const getType = (type: string | undefined, t: (key: string) => string) => {
    switch (type) {
      case 'F': return t('types.felony');
      case 'M': return t('types.misdemeanor');
      case 'I': return t('types.infraction');
      default: return t('types.unknown');
    }
};

const formatTotalTime = (totalMinutes: number, t: (key: string, values?: any) => string) => {
    if (totalMinutes === 0) return t('time.zero');
    totalMinutes = Math.round(totalMinutes);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts = [] as string[];
    if(days > 0) parts.push(t('time.days', { count: days }));
    if(hours > 0) parts.push(t('time.hours', { count: hours }));
    if(minutes > 0) parts.push(t('time.minutes', { count: minutes }));

    return t('time.summary', { parts: parts.join(' '), minutes: totalMinutes });
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
    const [calculation, setCalculation] = useState<ArrestCalculation | null>(null);
    const { reportIsParoleViolator } = useChargeStore();
    const t = useScopedI18n('arrestReport.basicReport');
    const tShared = useScopedI18n('arrestCalculation.results');


    useEffect(() => {
        if (officers && officers.length > 0 && officers[0].department) {
            setHeader(officers[0].department.toUpperCase());
        }
    }, [officers]);

    useEffect(() => {
        fetch('/api/arrest-calculator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report, isParoleViolator: reportIsParoleViolator }),
        })
            .then(res => res.json())
            .then(setCalculation)
            .catch(err => console.error('Failed to load arrest calculation:', err));
    }, [report, reportIsParoleViolator]);

    const getAdditionName = (name: string) => {
        const key = name.toLowerCase().replace(/ /g, '');
        return tShared(`additionNames.${key}` as any) || name;
    }

    return (
        <table ref={innerRef} style={{ width: '100%', fontFamily: "'Times New Roman', serif", borderCollapse: 'collapse', border: '4px solid black', backgroundColor: 'white', color: 'black' }}>
            <tbody>
                <tr>
                    <td colSpan={3} style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                        <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>{header}</h1>
                        <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{t('title')}</h2>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.general.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.general.date')}:</strong> {general.date}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.general.time')}:</strong> {general.time}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.general.callsign')}:</strong> {general.callSign}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.officers.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {officers.map((officer: any, index: number) => (
                                    <tr key={officer.id}>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '41.66%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.officers.officerName', { number: index + 1 })}:</strong> {officer.name}</td>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '33.33%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.officers.rank')}:</strong> {officer.rank}</td>
                                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '25%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.officers.badge')}:</strong> #{officer.badgeNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.suspect.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.suspect.fullName')}:</strong> {arrest.suspectName}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.location.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.location.district')}:</strong> {location.district}</td>
                                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '50%' }}><strong style={{ fontFamily: 'Arial, sans-serif' }}>{t('sections.location.street')}:</strong> {location.street}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.charges.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                            <thead style={{ backgroundColor: '#E5E7EB' }}>
                                <tr>
                                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{t('sections.charges.headers.description')}</th>
                                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{t('sections.charges.headers.type')}</th>
                                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{t('sections.charges.headers.class')}</th>
                                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{t('sections.charges.headers.offense')}</th>
                                    <th style={{ border: '1px solid black', padding: '0.5rem', fontFamily: 'Arial, sans-serif' }}>{t('sections.charges.headers.addition')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.map((row: any) => {
                                    const chargeDetails = penalCode[row.chargeId!];
                                    if (!chargeDetails) return null;
                                    
                                    let title = `${chargeDetails.id}. ${chargeDetails.charge}`;
                                    if (row.offense !== '1') {
                                        title += ` (Offence #${row.offense})`;
                                    }
                                    if (chargeDetails.drugs && row.category) {
                                        title += ` (Category ${row.category})`;
                                    }
                                    
                                    return (
                                        <tr key={row.uniqueId}>
                                            <td style={{ border: '1px solid black', padding: '0.5rem' }}>{title}</td>
                                            <td style={{ border: '1px solid black', padding: '0.5rem' }}>{getType(chargeDetails.type, (key) => tShared(`types.${key}` as any))}</td>
                                            <td style={{ border: '1px solid black', padding: '0.5rem' }}>{row.class}</td>
                                            <td style={{ border: '1px solid black', padding: '0.5rem' }}>{row.offense}</td>
                                            <td style={{ border: '1px solid black', padding: '0.5rem' }}>
                                                {row.addition
                                                    ? reportIsParoleViolator
                                                        ? `${getAdditionName(row.addition)} + ${getAdditionName(configData.PAROLE_VIOLATION_DEFINITION)}`
                                                        : getAdditionName(row.addition)
                                                    : reportIsParoleViolator
                                                        ? `${getAdditionName('Offender')} + ${getAdditionName(configData.PAROLE_VIOLATION_DEFINITION)}`
                                                        : getAdditionName('Offender')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.narrative.title')}</h3>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '150px', whiteSpace: 'pre-wrap', margin: 0 }}>{arrest.narrative}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.evidence.title')}</h3>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: '0 0 0.5rem 0' }}>
                            <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>{t('sections.evidence.supporting')}:</strong>
                            {evidence.supporting}
                        </p>
                        <p style={{ border: '1px solid black', padding: '0.5rem', minHeight: '100px', whiteSpace: 'pre-wrap', margin: 0 }}>
                            <strong style={{ fontFamily: 'Arial, sans-serif', display: 'block', marginBottom: '0.25rem' }}>{t('sections.evidence.dashcam')}:</strong>
                            {evidence.dashcam}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={3} style={{ borderTop: '2px solid black', padding: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('sections.summary.title')}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.minSentence')}:</strong> {calculation ? formatTotalTime(calculation.minTimeCapped, (key, values) => tShared(key, values)) : 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.maxSentence')}:</strong> {calculation ? formatTotalTime(calculation.maxTimeCapped, (key, values) => tShared(key, values)) : 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.totalFine')}:</strong> ${calculation ? calculation.totals.fine.toLocaleString() : 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.points')}:</strong> {calculation ? Math.round(calculation.totals.modified.points) : 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.bailStatus')}:</strong> {calculation ? tShared(`bailStatus.${calculation.bailStatus.toLowerCase().replace(/ /g, '')}` as any) : 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('sections.summary.bailAmount')}:</strong> ${calculation ? calculation.totals.highestBail.toLocaleString() : 'N/A'}</p>
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
