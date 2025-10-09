
'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Info, ExternalLink, Car, ImageDown } from 'lucide-react';
import { useEffect, useState, useRef, Suspense, useMemo } from 'react';
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
import { ArchivedReport, useArchiveStore } from '@/stores/archive-store';
import configData from '../../../data/config.json';
import { useI18n, useScopedI18n } from '@/lib/i18n/client';
import { useReportType } from '@/stores/report-store';
import { FormState as AdvancedFormState } from '@/stores/advanced-report-store';
import { FormState as BasicFormState } from '@/stores/form-store';

function ArrestSubmitContent() {
    const { report, penalCode, additions, reportInitialized } = useChargeStore();
    const { formData: basicFormData } = useFormStore();
    const { formData: advancedFormData } = useAdvancedReportStore();
    const { archiveReport } = useArchiveStore();

    const reportType = useReportType();
    
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLTableElement>(null);
    const [isDownloadingImage, setIsDownloadingImage] = useState(false);

    const { t } = useI18n();
    const tPage = useScopedI18n('arrestSubmit');
  
    useEffect(() => {
      setIsClient(true);
      document.title = t('arrestSubmit.documentTitle');
    }, [t]);

    const isBasicReport = reportType === 'basic';
    const isAdvancedReport = reportType === 'advanced';

    const formData = isBasicReport ? basicFormData : advancedFormData;

    const impoundDurationDays = useMemo(() => {
        if (!penalCode) return 0;
        const total = report.reduce((acc, row) => {
            if (!row.chargeId) {
                return acc;
            }

            const chargeDetails = penalCode[row.chargeId];
            if (!chargeDetails || !chargeDetails.impound) {
                return acc;
            }

            const offenseKey = (row.offense || '1') as keyof typeof chargeDetails.impound;
            const baseImpound = chargeDetails.impound[offenseKey] ?? 0;
            if (!baseImpound) {
                return acc;
            }

            const additionDetails = (additions || []).find(add => add.name === row.addition);
            const multiplier = additionDetails?.sentence_multiplier ?? 1;

            return acc + baseImpound * multiplier;
        }, 0);

        return Math.min(total, configData.MAX_IMPOUND_DAYS);
    }, [report, penalCode, additions]);

    const hasReport = isClient && reportInitialized && (report.length > 0 ? !!penalCode : true);
    const showQuickCreateImpound = hasReport && Math.round(impoundDurationDays) > 0;

    // Effect to archive the report once data is available
    useEffect(() => {
        if (hasReport && formData) {
            const archiveData : Omit<ArchivedReport, 'id'> = {
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
            title: tPage('toasts.success.title'),
            description: tPage('toasts.success.description'),
            variant: "default",
          });
        }
      };

    const handleDownloadImage = async () => {
        if (!reportRef.current || isDownloadingImage) {
            return;
        }

        try {
            setIsDownloadingImage(true);
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
            });

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filenameBase = isAdvancedReport ? 'advanced-arrest-report' : 'basic-arrest-report';
            link.download = `${filenameBase}-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast({
                title: tPage('toasts.downloadStart.title'),
                description: tPage('toasts.downloadStart.description'),
            });
        } catch (error) {
            console.error('Failed to download report image:', error);
            toast({
                title: tPage('toasts.downloadFailed.title'),
                description: tPage('toasts.downloadFailed.description'),
                variant: 'destructive',
            });
        } finally {
            setIsDownloadingImage(false);
        }
    };

    const suspectName = isBasicReport ? (formData as BasicFormState)?.arrest?.suspectName : (formData as AdvancedFormState)?.arrestee?.name;
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
          title={tPage('header.title')}
          description={tPage('header.description')}
        />
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{tPage('alert.title')}</AlertTitle>
            <AlertDescription>
                {tPage('alert.description')}
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
            <h3 className="text-2xl font-semibold tracking-tight mb-4">{tPage('formattedReport')}</h3>
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
                          {tPage('buttons.mdcRecord')}
                      </a>
                  </Button>
                )}
              {showQuickCreateImpound && (
                  <Button variant="secondary" asChild>
                      <a
                          href={`/paperwork-generators/form?type=static&id=impound-report&prefill=${isAdvancedReport ? 'advanced-arrest-report' : 'basic-arrest-report'}`}
                      >
                          <Car className="mr-2 h-4 w-4" />
                          {tPage('buttons.impound')}
                      </a>
                  </Button>
              )}
              <Button variant="outline" onClick={handleDownloadImage} disabled={!reportRef.current || isDownloadingImage}>
                  <ImageDown className="mr-2 h-4 w-4" />
                  {isDownloadingImage ? tPage('buttons.downloading') : tPage('buttons.download')}
              </Button>
              <Button onClick={handleCopy} disabled={isClient && !formData}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  {tPage('buttons.copy')}
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
