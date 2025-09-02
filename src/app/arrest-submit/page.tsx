
'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Info, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { ArrestCalculatorResults } from '@/components/arrest-calculator/arrest-calculator-results';
import { BasicFormattedReport } from '@/components/arrest-report/basic-formatted-report';
import { AdvancedFormattedReport } from '@/components/arrest-report/advanced-formatted-report';
import { useArchiveStore } from '@/stores/archive-store';


function ArrestSubmitContent() {
    const { report, penalCode } = useChargeStore();
    const { formData: basicFormData } = useFormStore();
    const { formData: advancedFormData } = useAdvancedReportStore();
    const { archiveReport } = useArchiveStore();

    const searchParams = useSearchParams();
    const reportType = searchParams.get('type') || 'basic';
    
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLTableElement>(null);
  
    useEffect(() => {
      setIsClient(true);
    }, []);

    const isBasicReport = reportType === 'basic';
    const isAdvancedReport = reportType === 'advanced';
    
    const formData = isBasicReport ? basicFormData : advancedFormData;
    
    const hasReport = isClient && report.length > 0 && !!penalCode;

    // Effect to archive the report once data is available
    useEffect(() => {
        if (hasReport && formData) {
            const archiveData = {
                paperworkType: 'arrest-report',
                type: reportType,
                fields: formData,
                charges: report,
            };
            archiveReport(archiveData);
        }
    }, [hasReport, formData, report, reportType, archiveReport]);
    
    const handleCopy = () => {
        if (reportRef.current) {
          navigator.clipboard.writeText(reportRef.current.outerHTML);
          toast({
            title: "Success",
            description: "Paperwork HTML copied to clipboard.",
            variant: "default",
          });
        }
      };

    const suspectName = isBasicReport ? formData?.arrest?.suspectName : formData?.arrestee?.name;
    const mdcRecordUrl = suspectName ? `https://mdc.gta.world/record/${suspectName.replace(/ /g, '_')}` : null;
  
    if (!isClient) {
      return (
          <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
              </div>
        </div>
      );
    }
  
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Arrest Report Submission"
          description="Review the calculated charges and the formatted arrest report below."
        />
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                The preview on this page may not look 100% accurate, but the generated HTML is designed to work perfectly on the actual MDC. This report has also been archived.
            </AlertDescription>
        </Alert>
          
        {hasReport && (
             <ArrestCalculatorResults
                report={report}
                showCharges={true}
                showSummary={true}
                clickToCopy={true}
             />
        )}

        <div className="mt-6">
            <h3 className="text-2xl font-semibold tracking-tight mb-4">Formatted Report</h3>
            <div className="p-4 border rounded-lg bg-card">
            {isBasicReport && hasReport && penalCode && (
                <BasicFormattedReport innerRef={reportRef} formData={formData} report={report} penalCode={penalCode} />
            )}
            {isAdvancedReport && hasReport && (
                <AdvancedFormattedReport innerRef={reportRef} formData={formData} />
            )}
            </div>
        </div>
  
         <div className="space-y-4 mt-6">
          <div className="flex justify-end gap-2">
               {mdcRecordUrl && (
                  <Button variant="outline" asChild>
                      <a href={mdcRecordUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open MDC Record
                      </a>
                  </Button>
                )}
              <Button onClick={handleCopy} disabled={isClient && !formData}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy Paperwork
              </Button>
          </div>
        </div>
  
      </div>
    );
  }

export default function ArrestSubmitPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArrestSubmitContent />
        </Suspense>
    )
}
