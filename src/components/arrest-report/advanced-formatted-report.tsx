
'use client';
import { useI18n } from '@/lib/i18n/client';

interface AdvancedFormattedReportProps {
    formData: any;
    innerRef: React.RefObject<HTMLTableElement | null>;
}

export function AdvancedFormattedReport({ formData, innerRef }: AdvancedFormattedReportProps) {
    const { t } = useI18n();
    const { arrestee, persons, incident, officers, narrative } = formData;
    const isLSSD = officers && officers[0]?.department === "Los Santos County Sheriff's Department";
    
    const renderWithBreaks = (text: string | undefined) => {
        if (!text) return <span style={{ fontFamily: "'Times New Roman', serif" }}>N/A</span>;
        return text.split('\n').map((line, index, arr) => (
            <span key={index} style={{ fontFamily: "'Times New Roman', serif" }}>
                {line}
                {index < arr.length - 1 && <br />}
            </span>
        ));
    };

    const tableStyle: React.CSSProperties = {
        padding: '2px',
        border: '2px solid #000',
        backgroundColor: 'white',
        width: '100%',
        color: 'black',
        fontFamily: 'Arial, sans-serif',
        borderCollapse: 'collapse'
    };

    const baseCellStyle: React.CSSProperties = {
        fontFamily: "'Times New Roman', serif",
        border: '1px solid black',
        padding: '4px',
        backgroundColor: 'white'
    };

    const cellStyle: React.CSSProperties = {
        ...baseCellStyle,
        fontSize: '14px',
        textAlign: 'left'
    };

    const headerCellStyle: React.CSSProperties = {
        ...baseCellStyle,
        fontWeight: 'bold',
        fontSize: '10px',
        textAlign: 'left'
    };

    const sectionHeaderStyle: React.CSSProperties = {
        ...headerCellStyle,
        borderTop: '2px solid black'
    };

    const reportHeaderStyle: React.CSSProperties = {
        ...baseCellStyle,
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
        borderBottom: '2px solid black',
        padding: '12px 8px'
    };

    return (
        <table
            ref={innerRef}
            border={1}
            cellPadding={2}
            style={tableStyle}
        >
            <thead>
                <tr>
                    <th colSpan={5} style={reportHeaderStyle}>
                        {isLSSD ? t('arrestReport.advancedReport.department.lssd') : t('arrestReport.advancedReport.department.lspd')}<br />
                        {t('arrestReport.advancedReport.title')}
                    </th>
                </tr>
            </thead>
            <tbody>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.arresteeName')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.sex')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.hair')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.eyes')}</th>
                    </tr>
                    <tr>
                        <td colSpan={2} style={cellStyle}>{arrestee.name || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.sex || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.hair || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.eyes || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.residence')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.age')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.height')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.descent')}</th>
                    </tr>
                    <tr>
                        <td colSpan={2} style={cellStyle}>{arrestee.residence || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.age || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.height || 'N/A'}</td>
                        <td style={cellStyle}>{arrestee.descent || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={3} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.clothing')}</th>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.oddities')}</th>
                    </tr>
                    <tr>
                        <td colSpan={3} style={cellStyle}>{arrestee.clothing || 'N/A'}</td>
                        <td colSpan={2} style={cellStyle}>{arrestee.oddities || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th colSpan={3} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.alias')}</th>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.gang')}</th>
                    </tr>
                    <tr>
                        <td colSpan={3} style={cellStyle}>{arrestee.alias || 'N/A'}</td>
                        <td colSpan={2} style={cellStyle}>{arrestee.gang || 'N/A'}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.headers.personsWithSubject')}</th></tr>
                    <tr>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.name')}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.sex')}</th>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.gangMoniker')}</th>
                    </tr>
                    {persons && persons.map((person: any, index: number) => (
                        <tr key={index}>
                            <td colSpan={2} style={cellStyle}>{person.name || 'N/A'}</td>
                            <td style={cellStyle}>{person.sex || 'N/A'}</td>
                            <td colSpan={2} style={cellStyle}>{person.gang || 'N/A'}</td>
                        </tr>
                    ))}
                     <tr>
                        <th style={sectionHeaderStyle}>{t('arrestReport.advancedForm.headers.date')}</th>
                        <th style={sectionHeaderStyle}>{t('arrestReport.advancedForm.headers.time')}</th>
                        <th colSpan={3} style={{ ...sectionHeaderStyle, textTransform: 'uppercase' }}>{t('arrestReport.advancedForm.headers.location')}</th>
                    </tr>
                    <tr>
                        <td style={cellStyle}>{incident.date || 'N/A'}</td>
                        <td style={cellStyle}>{incident.time || 'N/A'}</td>
                        <td colSpan={3} style={cellStyle}>{incident.locationStreet || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th style={headerCellStyle}>{t('arrestReport.advancedReport.officer', { officer: isLSSD ? 'DEPUTY' : 'OFFICER' })}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.badgeNo', { badge: isLSSD ? "BADGE" : "SERIAL" })}</th>
                        <th style={headerCellStyle}>{t('arrestReport.advancedForm.headers.callsign')}</th>
                        <th colSpan={2} style={headerCellStyle}>{t('arrestReport.advancedForm.headers.divDetail', { div: isLSSD ? "UNIT" : "DIV" })}</th>
                    </tr>
                    {officers && officers.map((officer: any, index: number) => (
                         <tr key={index}>
                            <td style={cellStyle}>{officer.rank || 'N/A'} {officer.name || 'N/A'}</td>
                            <td style={cellStyle}>{officer.badgeNumber || 'N/A'}</td>
                            <td style={cellStyle}>{officer.callSign || 'N/A'}</td>
                            <td colSpan={2} style={cellStyle}>{officer.divDetail || 'N/A'}</td>
                        </tr>
                    ))}
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.source.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.source)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.investigation.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.investigation)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.arrest.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.arrest)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.photographs.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.photographs)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.booking.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.booking)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.evidence.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.evidence)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.court.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.court)}</td></tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>{t('arrestReport.advancedForm.narrative.additional.title')}</th></tr>
                    <tr><td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.additional)}</td></tr>
            </tbody>
        </table>
    );
};
