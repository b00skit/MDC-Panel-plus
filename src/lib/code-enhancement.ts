import { Charge, SelectedCharge } from "@/stores/charge-store";

export function areStreetCharges(
    charges: SelectedCharge[], chargesDetails: (Charge | null)[]
) {
    return getChargesAndDetailsMap(chargesDetails, charges).some((
        {chargeDetails, charge}:
            {chargeDetails: Charge | null,
            charge: SelectedCharge}
    ) => (
        isStreetCharge(chargeDetails) && hasEnoughCount(charge, chargeDetails) 
    ))
}

function isStreetCharge(charge: Charge | null) {
    return charge?.code_enhancement && charge.code_enhancement == "STREETS";
}

function hasEnoughCount(charge: SelectedCharge, chargeDetails: Charge | null) {
    return (!(chargeDetails?.code_enhancement_count)
        || (charge?.offense
            && Number(charge.offense) >= chargeDetails.code_enhancement_count)
    )
}

function getChargesAndDetailsMap(
    chargesDetails: (Charge | null)[], charges: SelectedCharge[]
) {
    return chargesDetails.map((value: Charge | null, index: number) => (
        {chargeDetails: value, charge: charges[index]}
    ))
}