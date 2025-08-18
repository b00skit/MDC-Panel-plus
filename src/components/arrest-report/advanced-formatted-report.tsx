
'use client';

interface AdvancedFormattedReportProps {
    formData: any;
    innerRef: React.RefObject<HTMLDivElement>;
}

export function AdvancedFormattedReport({ formData, innerRef }: AdvancedFormattedReportProps) {
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
    const headerCellStyle: React.CSSProperties = { fontWeight: 'bold', fontSize: '10px', borderBottom: 'none', backgroundColor: 'white', color: 'black', textAlign: 'left' };
    const sectionHeaderStyle: React.CSSProperties = { fontWeight: 'bold', fontSize: '10px', borderTop: '2px solid black', borderBottom: 'none', backgroundColor: 'white', textAlign: 'left' };

    return (
        <div ref={innerRef} style={{ padding: '2px', border: '1px solid #000', backgroundColor: 'white', width: '100%', color: 'black', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', margin: '10px 0', color: 'black' }}>
                LOS SANTOS POLICE DEPARTMENT<br />ARREST REPORT
            </h1>
            <table border={1} cellPadding={2} style={{ width: '100%', borderCollapse: 'collapse', color: 'black', backgroundColor: 'white' }}>
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
                    {persons && persons.map((person: any, index: number) => (
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
                    {officers && officers.map((officer: any, index: number) => (
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
