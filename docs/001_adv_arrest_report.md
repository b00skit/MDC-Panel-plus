# **Adjustment File**: Advanced Arrest Reports

## Metadata:
- Adjustment Type: Modification
- Impacted Files: components/arrest-report/advanced-arrest-report-form.tsx, components/arrest-report/advanced-formatted-report.tsx

## Content:
- Fix: Enabling the "PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING" preset and not selecting the Photographs or any other modifier but still typing into the section returns "N/A" in the format.
- Feature: Add a listener event to the officer section, take the current format and form structure as the default one, if someone selects the any rank from the "Los Santos County Sheriff's Department" then adjust the following:
    - Modifiers: "In Metro Uniform?" to "In SEB Uniform?" and the "my department-issued metropolitan" to "my department-issued SEB"
    - Arrest Section: "Field Officer’s Notebook" to "Sheriff's Reference Book"
    - Form and Format Text: "SERIAL NO." to "BADGE NO."
    - Form and Format Text: "DIV/DETAIL" to "UNIT/DETAIL"
    - Title in Format: "LOS SANTOS POLICE DEPARTMENT" to "LOS SANTOS COUNTY SHERIFF'S DEPARTMENT"
    - Evidence section: "I booked all evidence into the booking station's property room."
    - Arrest Section: "I transported  to Mission Row Station." to "I transported  to the nearest booking station."