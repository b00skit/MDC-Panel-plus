
'use client';

interface AdvancedFormattedReportProps {
    formData: any;
    innerRef: React.RefObject<HTMLTableElement>;
}

export function AdvancedFormattedReport({ formData, innerRef }: AdvancedFormattedReportProps) {
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
                        {isLSSD ? "LOS SANTOS COUNTY SHERIFF'S DEPARTMENT" : "LOS SANTOS POLICE DEPARTMENT"}<br />
                        ARREST REPORT
                    </th>
                </tr>
            </thead>
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
                     <tr>
                        <th style={sectionHeaderStyle}>DATE</th>
                        <th style={sectionHeaderStyle}>TIME</th>
                        <th colSpan={3} style={{ ...sectionHeaderStyle, textTransform: 'uppercase' }}>LOCATION</th>
                    </tr>
                    <tr>
                        <td style={cellStyle}>{incident.date || 'N/A'}</td>
                        <td style={cellStyle}>{incident.time || 'N/A'}</td>
                        <td colSpan={3} style={cellStyle}>{incident.locationStreet || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th style={headerCellStyle}>{isLSSD ? 'DEPUTY' : 'OFFICER'}</th>
                        <th style={headerCellStyle}>{isLSSD ? "BADGE NO." : "SERIAL NO."}</th>
                        <th style={headerCellStyle}>CALLSIGN</th>
                        <th colSpan={2} style={headerCellStyle}>{isLSSD ? "UNIT/DETAIL" : "DIV/DETAIL"}</th>
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
                    <tr><th colSpan={5} style={sectionHeaderStyle}>INVESTIGATION</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.investigation)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>ARREST</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.arrest)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), AND DIGITAL IMAGING</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.photographs)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>BOOKING</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.booking)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>PHYSICAL EVIDENCE</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.evidence)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>COURT INFORMATION</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.court)}</td>
                    </tr>
                    <tr><th colSpan={5} style={sectionHeaderStyle}>ADDITIONAL</th></tr>
                    <tr>
                        <td colSpan={5} style={{...cellStyle, whiteSpace: 'pre-wrap' }}>{renderWithBreaks(narrative.additional)}</td>
                    </tr>
            </tbody>
        </table>
    );
};
