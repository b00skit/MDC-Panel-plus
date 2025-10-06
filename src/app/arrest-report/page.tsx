
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
import { useI18n, useScopedI18n } from '@/lib/i18n/client';

export default function ArrestReportPage() {
  const { report, penalCode, reportInitialized } = useChargeStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isAdvanced, toggleAdvanced } = useAdvancedReportStore();

  const { t: tCommon } = useI18n();
  const t = useScopedI18n('arrestReport.page');

  // Create refs for form components to call their save methods
  const basicFormRef = useRef<{ saveDraft: () => void }>(null);
  const advancedFormRef = useRef<{ saveForm: () => void }>(null);

  useEffect(() => {
    setIsClient(true);
    document.title = tCommon('arrestReport.page.documentTitle');
  }, [tCommon]);
  
  const hasReport = isClient && reportInitialized && (report.length > 0 ? !!penalCode : true);

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
        title={t('header.title')}
        description={hasReport ? t('header.descriptionWithReport') : t('header.descriptionNew')}
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
                    <AlertTitle>{t('disclaimer.title')}</AlertTitle>
                    <AlertDescription>
                        {t('disclaimer.description')}
                    </AlertDescription>
                </Alert>
                <div className="flex items-center space-x-2">
                    <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={toggleAdvanced} />
                    <Label htmlFor="advanced-mode">{t('enableAdvanced')}</Label>
                </div>
            </>
        )}
        
        {isClient && !hasReport && (
            <Alert variant="secondary" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('noCharges.title')}</AlertTitle>
                <AlertDescription className="space-y-4">
                   <p>{t('noCharges.description')}</p>
                   <Button onClick={() => router.push('/arrest-calculator')}>
                        {t('noCharges.button')}
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
