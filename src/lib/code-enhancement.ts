import { Charge, SelectedCharge } from "@/stores/charge-store";

export function areStreetCharges(
    charges: SelectedCharge[], chargesDetails: Charge[]
) {
    return getChargesAndDetailsMap(chargesDetails, charges).some((
        {chargeDetails, charge}: {chargeDetails: Charge, charge: SelectedCharge}
    ) => (
        isStreetCharge(chargeDetails) && hasEnoughCount(charge, chargeDetails) 
    ))
}

function isStreetCharge(charge: Charge) {
    return charge?.code_enhancement && charge.code_enhancement == "STREETS";
}

function hasEnoughCount(charge: SelectedCharge, chargeDetails: Charge) {
    return (!(chargeDetails?.code_enhancement_count)
        || (charge?.offense
            && Number(charge.offense) > chargeDetails.code_enhancement_count)
    )
}

function getChargesAndDetailsMap(
    chargesDetails: Charge[], charges: SelectedCharge[]
) {
    return chargesDetails.map((value: Charge, index: number) => (
        {chargeDetails: value, charge: charges[index]}
    ))
}