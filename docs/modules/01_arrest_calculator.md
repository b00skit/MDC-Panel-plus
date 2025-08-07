# **Module Name**: Arrest Calculator

Create a new item in the navbar named "Arrest Calculator", use handcuffs as the icon, should route to /arrest-calculator

## Instructions:
- This will be implemented within x phases, work on the phase you've been instructed to work on, don't worry about the other phases but feel free to take in the information for more context.

## Phase 1:
- Create a page named /arrest-calculator, the page should have the same layout as the dashboard.
- Create a component that will handle the following:
    - Upon a user landing, there should be a button with a simple "+ Add Charge". If a user presses it, it should create four dropdowns in a row (a user has the ability to create multiple charges).
    - The first dropdown (also should be the widest) should populate with data from https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json. The dropdown should have a label next to the name of the charge, so for example, 001 would have a label of 001 in red (because it's a felony as recognized by the type, misdemeanor should be yellow and infraction should be green, anything else is gray), alongside the name of the charge. Example: "(Label: 001 - red) Treason". The label should be: Charge.
    - The second dropdown should be disabled by default and should only enable if something is selected in the first dropdown, by default it should not be populated, it should only populate once the first dropdown is selected, you should populate it with Class A, Class B, Class C and only enable/disable those that are enabled in the json. The label should be: Class
    - The third dropdown should be disabled by default and should only enable if something is selected in the first dropdown, by default it should not be populated, it should only populate once the first dropdown is selected, you should populate it with Offense 1, Offense 2, Offense 3 (or more). Only enable/disable those that are enabled in the json. The label should be: Offense.
    - The fourth dropdown should be disabled by default and should only enable if something is selected in the first dropdown, by default it should not be populated, it should only populate once the first dropdown is selected, you should populate it with Offender, Accomplice, Accessory, Conspiracy, Attempt, Solicitation, Parole Violation. The label should be: Addition.
    - There should be a minus next to each of the rows so that a user can also remove rows / charges as they deem fit.
- Below the selection there should be a Calculate Arrest button, don't do anything with it yet.

## Phase 2:
- This phase will be orientated towards adding functionality for drug charges, we'll more or less be modifying the component for the arrest calculator.
- If someone selects a drug charge, you can see an example in the json as to how a drug charge looks, your best bet is to detect if the charge has "drugs" as a classifier, if so, classify the charge as a drug charge in the background.
- If a drug is a drug charge, add a new dropdown to select the Category next to the existing dropdowns, the categories should be defined under "drugs" in the json.

## Phase 3:
- Create a new page called /arrest-report, the layout should be the same as the dashboard.
- There should be an API call/route call that redirects you to /arrest-report when you press Calculate Arrest
- The arrest report page should be fairly simple for now, it should have a table with the selected charges and all it's calculations, example of the table is below, but leave space below for future module implementation.
| Title | Addition | Offence | Type | Min Time | Max Time | Points | Fine | Impound | Suspension | Extra | Bail | Bail / Bond |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FC 115. Evading a Peace Officer (Offence #2) | Offender | 2 | Felony | 1 Day (1440 mins) | 5 Days (7200 mins) | 4 | $10,000 | Yes \| 7 Days | Yes \| 7 Days | N/A | AUTO BAIL | $500,000 / $50,000 (10%) |
| FA 120. Assault & Battery on a Government Worker | Accomplice | 1 | Felony | 2 Days (2880 mins) | 6 Days (8640 mins) | 5 | $0 | No | No | N/A | AUTO BAIL | $500,000 / $50,000 (10%) |
| MC 116. Resisting Arrest | Attempt | 1 | Misdemeanor | 3 Hours (180 mins) | 12 Hours (720 mins) | 0 | $0 | No | No | N/A | AUTO BAIL | $50,000 / $5,000 (10%) |
| IC 434. Possession of Open Container | Offender | 1 | Infraction | | | 0 | $1,000 | No | No | N/A | NO BAIL | N/A |
To explain the table
- Title should be compiled like so: MC 116. Resisting Arrest.
The MC is constructed as follows=> M is Misdemeanor (F for Felony, I for Infraction); C is Class C.
116 is the charge number
Resisting Arrest is the charge title
Append the Offence number at the end of the title IF more then #1 is selected.
- Addition is the dropdown selector for Addition
- Offence is the dropdown selector for Offence (it should only type the number and not Offence #1, Offence #2...)
- Type is determined off the charge, it's either Misdemanor, Felony or Infraction.
- Min Time is determined off the "time" selector in the json of the charge.
- Max Time is determined off the "maxtime" selector in the json of the charge.
- Points is determined off the "points" selector in the json of the charge.
- Fine is determined off the "fine" selector in the json of the charge.
- Impound is determined off the "impound" selector in the json of the charge.
- Suspension is determined off the "suspension" selector in the json of the charge.
- Extra is determined off the "extra" selector in the json of the charge.
- Bail has a couple of different selectors, the first one being "auto", it has three possibilities, false, true or 2. If it's False, display Auto-Bail as NO BAIL. If it's true, display AUTO BAIL. If 2, display DISCRETIONARY. Besides the Bail, display the full price of bail (don't worry about the 10% bond, skip that).
- Below the entire table, in it's own seperate table, add a summary of: Total Min Time (Human Readable AND Minutes), Total Max Time (Human Readable AND Minutes), Total Points, Total Fine, Total Impound, Total Suspension, If they're to be offered bail or not (based on the auto-bail selectors, this column should be named Bail Status and you should have three options: ELIGIBLE, DISCRETIONARY and NOT ELIGIBLE) and what the bail cost is.


## Context:
- The idea behind this Arrest Calculator is to assist people with the calculation of people's arrests.
- We'll be using a json file from an external source as the main component for the data in terms of charges and information.

## JSON Example:
Regular Charge:
"001": {
    "id": "001",
    "charge": "Treason",
    "type": "F",
    "class": {
        "A": true,
        "B": true,
        "C": true
    },
    "offence": {
        "1": true,
        "2": false,
        "3": false
    },
    "time": {
        "days": 9999,
        "hours": 0,
        "min": 0
    },
    "maxtime": {
        "days": 9999,
        "hours": 0,
        "min": 0
    },
    "points": {
        "A": 0,
        "B": 0,
        "C": 0
    },
    "fine": {
        "1": 0,
        "2": 0,
        "3": 0
    },
    "impound": {
        "1": 0,
        "2": 0,
        "3": 0
    },
    "suspension": {
        "1": 0,
        "2": 0,
        "3": 0
    },
    "bail": {
        "auto": false,
        "cost": 0
    },
    "extra": "Required Court Case"
}

Drug Charge:
"131": {
    "id": "131",
    "charge": "Bringing Contraband Into A Correctional Facility",
    "type": "F",
    "class": {
        "A": false,
        "B": false,
        "C": true
    },
    "offence": {
        "1": true,
        "2": false,
        "3": false
    },
    "time": {
        "A": {
            "days": 7,
            "hours": 0,
            "min": 0
        },
        "B": {
            "days": 6,
            "hours": 0,
            "min": 0
        },
        "C": {
            "days": 5,
            "hours": 0,
            "min": 0
        },
        "D": {
            "days": 4,
            "hours": 0,
            "min": 0
        },
        "T": {
            "days": 1,
            "hours": 0,
            "min": 0
        },
        "Alcohol": {
            "days": 3,
            "hours": 0,
            "min": 0
        },
        "Instruments": {
            "days": 5,
            "hours": 0,
            "min": 0
        }
    },
    "bail": {
        "auto": {
            "A": true,
            "B": true,
            "C": true,
            "D": true,
            "T": true,
            "Alcohol": true,
            "Instruments": true
        },
        "cost": {
            "A": 250000,
            "B": 250000,
            "C": 250000,
            "D": 250000,
            "T": 250000,
            "Alcohol": 250000,
            "instruments": 250000
        }
    },
    "points": {
        "A": 0,
        "B": 0,
        "C": 5
    },
    "fine": {
        "A": 45000,
        "B": 37500,
        "C": 30000,
        "D": 22500,
        "T": 8000,
        "Alcohol": 25000,
        "Instruments": 30000
    },
    "impound": {
        "1": 0,
        "2": 0,
        "3": 0
    },
    "suspension": {
        "1": 0,
        "2": 0,
        "3": 0
    },
    "extra": "N/A",
    "drugs": {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
        "5": "T",
        "6": "Alcohol",
        "7": "Instruments"
    }
},