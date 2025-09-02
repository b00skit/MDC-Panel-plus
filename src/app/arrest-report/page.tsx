
'use client';

import { useChargeStore } from '@/stores/charge-store';
import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrestReportForm } from '@/components/arrest-report/arrest-report-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { AdvancedArrestReportForm } from '@/components/arrest-report/advanced-arrest-report-form';
import { ArrestCalculatorResults } from '@/components/arrest-calculator/arrest-calculator-results';


export default function ArrestReportPage() {
  const { report, penalCode } = useChargeStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isAdvanced, toggleAdvanced } = useAdvancedReportStore();

  // Create refs for form components to call their save methods
  const basicFormRef = useRef<{ saveDraft: () => void }>(null);
  const advancedFormRef = useRef<{ saveForm: () => void }>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const hasReport = isClient && report.length > 0 && !!penalCode;

  const handleSaveDraft = () => {
    if (isAdvanced) {
      advancedFormRef.current?.saveForm();
    } else {
      basicFormRef.current?.saveDraft();
    }
  };

  const renderSkeleton = () => (
     <div className="space-y-6">
         <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
     </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Arrest Report"
        description={hasReport ? "A summary of the calculated charges and report form." : "Create a new arrest report."}
      />
        {!isClient && renderSkeleton()}
        {hasReport && (
            <ArrestCalculatorResults
                report={report}
                showCharges={true}
                showStipulations={true}
                showSummary={true}
                showCopyables={true}
                clickToCopy={true}
                showModifyChargesButton={true}
                onModifyCharges={handleSaveDraft}
            />
        )}

        {hasReport && (
            <>
                <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>
                        This tool is to provide you assistance with your paperwork, the quality of your writing is your responsibility. You are still expected to provide truthful and detailed information. 
                    </AlertDescription>
                </Alert>
                <div className="flex items-center space-x-2">
                    <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={toggleAdvanced} />
                    <Label htmlFor="advanced-mode">Enable Advanced Report</Label>
                </div>
            </>
        )}
        
        {isClient && !hasReport && (
            <Alert variant="secondary" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Charges Selected</AlertTitle>
                <AlertDescription className="space-y-4">
                   <p>You must first select charges from the Arrest Calculator before you can create a report.</p>
                   <Button onClick={() => router.push('/arrest-calculator')}>
                        Go to Arrest Calculator
                   </Button>
                </AlertDescription>
            </Alert>
        )}
        
        {isClient && hasReport && (
            isAdvanced 
                ? <AdvancedArrestReportForm ref={advancedFormRef} /> 
                : <ArrestReportForm ref={basicFormRef} />
        )}
    </div>
  );
}
