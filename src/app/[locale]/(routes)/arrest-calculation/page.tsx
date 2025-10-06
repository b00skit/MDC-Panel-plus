
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useChargeStore, PenalCode, SelectedCharge } from '@/stores/charge-store';
import { ArrestCalculatorResults } from '@/components/arrest-calculator/arrest-calculator-results';
import { PageHeader } from '@/components/dashboard/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import configData from '../../../data/config.json';

const additionMapping: { [key: string]: string } = {
  '1': 'Offender',
  '2': 'Accomplice',
  '3': 'Accessory',
  '4': 'Conspiracy',
  '5': 'Attempt',
  '6': 'Solicitation',
  '7': 'Parole Violation',
};

const classMapping: { [key: string]: string } = {
    'a': 'A',
    'b': 'B',
    'c': 'C',
};

function ArrestCalculationContent() {
  const searchParams = useSearchParams();
  const { penalCode, setPenalCode, setParoleViolator, setReportParoleViolator } = useChargeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'MDC Panel – Arrest Calculation';
  }, []);

  const parsedData = useMemo(() => {
    if (!penalCode) return { charges: [] as SelectedCharge[], paroleFromAdditions: false };

    const chargeStrings = searchParams.getAll('c');
    if (chargeStrings.length === 0) {
        setError("No charges provided in the URL.");
        return { charges: [] as SelectedCharge[], paroleFromAdditions: false };
    }

    const charges: SelectedCharge[] = [];
    let parsingError = false;
    let paroleFromAdditions = false;

    chargeStrings.forEach((chargeStr, index) => {
        if (parsingError) return;

        const parts = chargeStr.split('-');
        if (parts.length < 3) {
            setError(`Invalid charge format for parameter #${index + 1}. Expected at least 3 parts, received ${parts.length}.`);
            parsingError = true;
            return;
        }

        const chargeIdWithClass = parts[0];
        const offense = parts[1];
        const additionIndex = parts[2];
        const categoryIndex = parts.length > 3 ? parts[3] : undefined;

        const classChar = chargeIdWithClass.charAt(0).toLowerCase();
        const chargeId = chargeIdWithClass.substring(1);

        const chargeDetails = Object.values(penalCode).find(c => c.id === chargeId);

        if (!chargeDetails) {
            setError(`Charge with ID "${chargeId}" not found.`);
            parsingError = true;
            return;
        }

        let additionName = additionMapping[additionIndex] || 'Offender';
        if (additionName === configData.PAROLE_VIOLATION_DEFINITION) {
            paroleFromAdditions = true;
            additionName = 'Offender';
        }

        const selectedCharge: SelectedCharge = {
            uniqueId: Date.now() + index,
            chargeId: chargeDetails.id,
            class: classMapping[classChar] || null,
            offense: offense,
            addition: additionName,
            category: null,
        };

        if (categoryIndex && chargeDetails.drugs) {
            selectedCharge.category = chargeDetails.drugs[categoryIndex] || null;
             if (!selectedCharge.category) {
                setError(`Invalid category index "${categoryIndex}" for drug charge "${chargeId}".`);
                parsingError = true;
                return;
            }
        }
        charges.push(selectedCharge);
    });

    if (parsingError) return { charges: [] as SelectedCharge[], paroleFromAdditions: false };
    return { charges, paroleFromAdditions };

  }, [searchParams, penalCode, setError]);

  const parsedCharges = parsedData.charges;
  const paroleFromAdditions = parsedData.paroleFromAdditions;

  const paroleQueryParam = searchParams.get('pv');
  const paroleFromQuery = paroleQueryParam !== null ? (paroleQueryParam === '1' || paroleQueryParam.toLowerCase() === 'true') : undefined;
  const paroleViolatorOverride = paroleFromQuery ?? paroleFromAdditions;

  useEffect(() => {
    if (!penalCode) {
      fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_penal_code.json')
        .then((res) => res.json())
        .then((data: PenalCode) => {
          setPenalCode(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch penal code:', err);
          setError('Could not load penal code data.');
          setLoading(false);
        });
    } else {
        setLoading(false);
    }
  }, [penalCode, setPenalCode]);

  useEffect(() => {
    const paroleValue = paroleViolatorOverride || false;
    setParoleViolator(paroleValue);
    setReportParoleViolator(paroleValue);
  }, [paroleViolatorOverride, setParoleViolator, setReportParoleViolator]);

  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <PageHeader title="Arrest Calculation" description="Loading calculation details..." />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (error) {
    return (
         <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <PageHeader title="Arrest Calculation Error" description="Could not process the request." />
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader title="Arrest Calculation" description="Displaying calculation based on the provided link." />
        {penalCode && parsedCharges.length > 0 ? (
            <ArrestCalculatorResults
                report={parsedCharges}
                showCharges={true}
                showStipulations={true}
                showSummary={true}
                clickToCopy={true}
                showCopyables={true}
                paroleViolatorOverride={paroleViolatorOverride}
            />
        ) : (
            <Alert variant="secondary">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Charges to Display</AlertTitle>
                <AlertDescription>
                   There are no charges to display. This might be due to an error in the link or missing data.
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}


export default function ArrestCalculationPage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <ArrestCalculationContent />
        </Suspense>
    )
}
