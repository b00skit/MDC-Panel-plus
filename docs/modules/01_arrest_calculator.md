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
- The arrest report page should be fairly simple for now, but leave space below for future module implementation.
- As a simple first step, you should sum up the days, hours and minutes someone is sentenced and provide an overview of the selected charges.

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