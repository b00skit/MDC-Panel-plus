
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

const getTypePillStyle = (type: string | undefined) => {
    const baseStyle = {
        display: 'inline-block',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        border: '1px solid transparent',
    };

    switch (type) {
        case 'F':
            return {
                ...baseStyle,
                backgroundColor: '#b91c1c',
                color: '#ffffff',
                borderColor: '#7f1d1d',
            };
        case 'M':
            return {
                ...baseStyle,
                backgroundColor: '#f59e0b',
                color: '#1f2937',
                borderColor: '#b45309',
            };
        case 'I':
            return {
                ...baseStyle,
                backgroundColor: '#0ea5e9',
                color: '#0f172a',
                borderColor: '#0369a1',
            };
        default:
            return {
                ...baseStyle,
                backgroundColor: '#e5e7eb',
                color: '#111827',
                borderColor: '#9ca3af',
            };
    }
};

const toCamelCase = (str: string) =>
    str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');

const formatTotalTime = (totalMinutes: number, t: (key: string, values?: any) => string) => {
    if (totalMinutes === 0) return t('time.zero');
    totalMinutes = Math.round(totalMinutes);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const formatUnit = (unit: 'days' | 'hours' | 'minutes', count: number) =>
        t(`time.${unit}.${count === 1 ? 'one' : 'other'}`, { count });

    const parts = [] as string[];
    if (days > 0) parts.push(formatUnit('days', days));
    if (hours > 0) parts.push(formatUnit('hours', hours));
    if (minutes > 0) parts.push(formatUnit('minutes', minutes));

    return t('time.summary', { parts: parts.join(' '), minutes: totalMinutes });
};

interface BasicFormattedReportProps {
    formData: any;
    report: any[];
    penalCode: any;
    innerRef: React.RefObject<HTMLTableElement | null>;
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
        const normalizedKey = name.toLowerCase().replace(/ /g, '');
        const translationKey = normalizedKey === 'paroleviolation' ? 'paroleViolation' : normalizedKey;
        return tShared(`additionNames.${translationKey}` as any) || name;
    }

    const sectionSpacingCell = {
        height: '0.75rem',
        padding: 0,
        border: 'none',
    } as const;

    const numberCellStyle = {
        border: '1px solid black',
        padding: '0.5rem',
        textAlign: 'center' as const,
        fontWeight: 'normal' as const,
        width: '6%',
        backgroundColor: '#f4f4f5',
    };

    const districtStreetLabelRaw = t('sections.general.districtStreet' as any);
    const districtStreetLabel =
        typeof districtStreetLabelRaw === 'string' && districtStreetLabelRaw.includes('sections.general.districtStreet')
            ? `${t('sections.location.district')} / ${t('sections.location.street')}`
            : districtStreetLabelRaw;

    return (
        <table
            ref={innerRef}
            style={{
                width: '100%',
                fontFamily: "'Times New Roman', serif",
                borderCollapse: 'collapse',
                border: '6px double black',
                backgroundColor: 'white',
                color: 'black',
            }}
        >
            <tbody>
                <tr>
                    <td colSpan={5} style={{ padding: '1.5rem 1rem 1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.95rem', margin: 0, letterSpacing: '0.1em' }}>{header}</p>
                        <p style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('title')}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.general.title')}
                        </p>
                    </td>
                </tr>
                <tr style={{ backgroundColor: '#f4f4f5' }}>
                    <td
                        colSpan={2}
                        style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5' }}
                    >
                        <strong>{t('sections.general.date')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>{general.date}</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5' }}>
                        <strong>{t('sections.general.time')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>{general.time}</td>
                </tr>
                <tr>
                    <td
                        colSpan={2}
                        style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5' }}
                    >
                        <strong>{t('sections.general.callsign')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>{general.callSign}</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5' }}>
                        <strong>{districtStreetLabel}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }}>
                        {[location.district, location.street].filter(Boolean).join(' / ')}
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.officers.title')}
                        </p>
                    </td>
                </tr>
                {officers.map((officer: any, index: number) => (
                    <tr key={officer.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={numberCellStyle}>{`#${index + 1}`}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '28%', backgroundColor: '#f4f4f5' }}><strong>{t('sections.officers.officerName', { number: index + 1 })}</strong></td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '28%' }}>{officer.name}</td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '19%', backgroundColor: '#f4f4f5' }}><strong>{t('sections.officers.rank')}</strong></td>
                        <td style={{ border: '1px solid black', padding: '0.5rem', width: '19%' }}>
                            <p style={{ margin: '0 0 0.25rem 0' }}>{officer.rank}</p>
                            <p style={{ margin: 0 }}><strong>{t('sections.officers.badge')}</strong> #{officer.badgeNumber}</p>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.suspect.title')}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td
                        colSpan={2}
                        style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5', width: '34%' }}
                    >
                        <strong>{t('sections.suspect.fullName')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', width: '66%' }} colSpan={3}>
                        {arrest.suspectName}
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.charges.title')}
                        </p>
                    </td>
                </tr>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold', textAlign: 'center', width: '6%' }}>#</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold' }}>{t('sections.charges.headers.description')}</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold' }}>{t('sections.charges.headers.type')}</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold' }}>{t('sections.charges.headers.class')}</td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontWeight: 'bold' }}>{t('sections.charges.headers.offense')}</td>
                </tr>
                {report.map((row: any, index: number) => {
                    const chargeDetails = penalCode[row.chargeId!];
                    if (!chargeDetails) return null;

                    let title = `${chargeDetails.id}. ${chargeDetails.charge}`;
                    if (row.offense !== '1') {
                        title += ` (Offence #${row.offense})`;
                    }
                    if (chargeDetails.drugs && row.category) {
                        title += ` (Category ${row.category})`;
                    }

                    const typeText = getType(chargeDetails.type, (key) => tShared(`${key}` as any));
                    const typeStyle = getTypePillStyle(chargeDetails.type);

                    return (
                        <tr key={row.uniqueId}>
                            <td style={numberCellStyle}>{`#${index + 1}`}</td>
                            <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>{title}</td>
                            <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                                <span style={typeStyle}>{typeText}</span>
                            </td>
                            <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>{row.class ? `Class (${row.class})` : 'Class (N/A)'}</td>
                            <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>{row.offense ? `Offence #${row.offense}` : 'Offence #N/A'}</td>
                        </tr>
                    );
                })}
                <tr>
                    <td style={numberCellStyle}></td>
                    <td
                        style={{
                            border: '1px solid black',
                            padding: '0.5rem',
                            backgroundColor: '#f4f4f5',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                        }}
                    >
                        {t('sections.charges.headers.addition')}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem', fontSize: '0.75rem' }} colSpan={3}>
                        {report.map((row: any, index: number) => {
                            const chargeDetails = penalCode[row.chargeId!];
                            if (!chargeDetails) return null;

                            const label = report.length > 1 ? `${index + 1}. ` : '';
                            const additionText = row.addition
                                ? reportIsParoleViolator
                                    ? `${getAdditionName(row.addition)} + ${getAdditionName(configData.PAROLE_VIOLATION_DEFINITION)}`
                                    : getAdditionName(row.addition)
                                : reportIsParoleViolator
                                    ? `${getAdditionName('Offender')} + ${getAdditionName(configData.PAROLE_VIOLATION_DEFINITION)}`
                                    : getAdditionName('Offender');

                            return (
                                <p
                                    key={`addition-${row.uniqueId}`}
                                    style={{
                                        margin: index === report.length - 1 ? 0 : '0 0 0.25rem 0',
                                        lineHeight: 1.35,
                                    }}
                                >
                                    <strong>{label}</strong>
                                    {additionText}
                                </p>
                            );
                        })}
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.narrative.title')}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style={{ border: '1px solid black', padding: '0.75rem', lineHeight: 1.5 }} colSpan={5}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{arrest.narrative}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.evidence.title')}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td
                        colSpan={2}
                        style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5', width: '34%' }}
                    >
                        <strong>{t('sections.evidence.supporting')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }} colSpan={3}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{evidence.supporting}</p>
                    </td>
                </tr>
                <tr>
                    <td
                        colSpan={2}
                        style={{ border: '1px solid black', padding: '0.5rem', backgroundColor: '#f4f4f5', width: '34%' }}
                    >
                        <strong>{t('sections.evidence.dashcam')}</strong>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.5rem' }} colSpan={3}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{evidence.dashcam}</p>
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} style={sectionSpacingCell}></td>
                </tr>
                <tr>
                    <td colSpan={5} style={{ borderTop: '2px solid black', padding: '0.75rem 1rem 0.25rem' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            {t('sections.summary.title')}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style={{ border: '1px solid black', padding: '0.75rem' }} colSpan={2}>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{t('sections.summary.minSentence')}:</strong> {calculation ? formatTotalTime(calculation.minTimeCapped, (key, values) => tShared(key, values)) : 'N/A'}</p>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{t('sections.summary.maxSentence')}:</strong> {calculation ? formatTotalTime(calculation.maxTimeCapped, (key, values) => tShared(key, values)) : 'N/A'}</p>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{t('sections.summary.totalFine')}:</strong> ${calculation ? calculation.totals.fine.toLocaleString() : 'N/A'}</p>
                    </td>
                    <td style={{ border: '1px solid black', padding: '0.75rem' }} colSpan={3}>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{t('sections.summary.points')}:</strong> {calculation ? Math.round(calculation.totals.modified.points) : 'N/A'}</p>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{t('sections.summary.bailStatus')}:</strong> {calculation ? tShared(`bailStatus.${toCamelCase(calculation.bailStatus)}` as any) : 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>{t('sections.summary.bailAmount')}:</strong> ${calculation ? calculation.totals.highestBail.toLocaleString() : 'N/A'}</p>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
