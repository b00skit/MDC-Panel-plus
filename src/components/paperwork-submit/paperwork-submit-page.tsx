
'use client';
import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Info, ExternalLink, ImageDown } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useArchiveStore } from '@/stores/archive-store';
import Handlebars from 'handlebars';
import { ConditionalVariable } from '@/stores/paperwork-builder-store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { registerHelpers } from '@/lib/utils'
import { useScopedI18n, useI18n } from '@/lib/i18n/client';

const GeneratedFormattedReport = ({
    innerRef,
    setReportTitle,
    setCustomButton,
    onGeneratorLoaded,
}: {
    innerRef: React.RefObject<HTMLDivElement | null>,
    setReportTitle: (title: string) => void,
    setCustomButton: (button: { text: string; link: string } | null) => void,
    onGeneratorLoaded?: (details: { title?: string; description?: string; icon?: string }) => void,
}) => {
    const { formData, generatorId, generatorType, groupId } = usePaperworkStore();
    const [template, setTemplate] = useState('');
    const [generatorConfig, setGeneratorConfig] = useState<{
        output: string;
        output_title?: string;
        conditionals?: ConditionalVariable[],
        countyCityStipulation?: boolean,
        is_html_output?: boolean,
        custom_button_text?: string;
        custom_button_link?: string;
        custom_button_replace_spaces?: boolean;
        title?: string;
        description?: string;
        icon?: string;
    } | null>(null);
  
    useEffect(() => {
        if (generatorId && generatorType) {
            let url = `/api/paperwork-generators/${generatorId}?type=${generatorType}&id=${generatorId}`;
            if (groupId) {
                url += `&group_id=${groupId}`;
            }

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setGeneratorConfig(data);
                })
                .catch(err => console.error("Failed to load generator template", err));
        }
    }, [generatorId, generatorType, groupId]);

    useEffect(() => {
        if (generatorConfig) {
            onGeneratorLoaded?.({
                title: generatorConfig.title,
                description: generatorConfig.description,
                icon: generatorConfig.icon,
            });
        }
    }, [generatorConfig, onGeneratorLoaded]);
    
    useEffect(() => {
        if(generatorConfig && formData) {
            registerHelpers();

            const processedData = { ...formData };
            if (generatorConfig.conditionals) {
                generatorConfig.conditionals.forEach(cond => {
                    const fieldValue = processedData[cond.conditionField];
                    let conditionMet = false;
                    switch(cond.operator) {
                        case 'is_checked':
                            conditionMet = fieldValue === true;
                            break;
                        case 'is_not_checked':
                            conditionMet = fieldValue === false || fieldValue === undefined;
                            break;
                        case 'equals':
                             conditionMet = fieldValue == cond.conditionValue;
                             break;
                        case 'not_equals':
                            conditionMet = fieldValue != cond.conditionValue;
                            break;
                    }
                    if(conditionMet) {
                        processedData[cond.variableName] = cond.outputText;
                    }
                });
            }

            // Compile main output
            const outputTemplateString = generatorConfig.output
            const compiledOutputTemplate = Handlebars.compile(outputTemplateString, { noEscape: true });
            let parsedOutput = compiledOutputTemplate(processedData);
            
            // Compile title if it exists
            if (generatorConfig.output_title) {
                const compiledTitleTemplate = Handlebars.compile(generatorConfig.output_title, { noEscape: true });
                setReportTitle(compiledTitleTemplate(processedData));
            }

            // Compile custom button if it exists
            if (generatorConfig.custom_button_text && generatorConfig.custom_button_link) {
                let buttonData = { ...processedData };
                if (generatorConfig.custom_button_replace_spaces) {
                    const deepReplace = (obj: any): any => {
                        if (typeof obj === 'string') {
                            return obj.replace(/ /g, '_');
                        }
                        if (Array.isArray(obj)) {
                            return obj.map(deepReplace);
                        }
                        if (obj !== null && typeof obj === 'object') {
                            return Object.fromEntries(
                                Object.entries(obj).map(([key, value]) => [key, deepReplace(value)])
                            );
                        }
                        return obj;
                    };
                    buttonData = deepReplace(buttonData);
                }

                const compiledButtonTextTemplate = Handlebars.compile(generatorConfig.custom_button_text, { noEscape: true });
                const compiledButtonLinkTemplate = Handlebars.compile(generatorConfig.custom_button_link, { noEscape: true });
                setCustomButton({
                    text: compiledButtonTextTemplate(processedData),
                    link: compiledButtonLinkTemplate(buttonData)
                });
            }


            if (generatorConfig.countyCityStipulation && formData.officers?.[0]?.department) {
                const cityFactions = ["Los Santos Police Department", "Los Santos Parking Enforcement"];
                if (cityFactions.includes(formData.officers[0].department)) {
                    parsedOutput = parsedOutput.replace(/COUNTY OF LOS SANTOS/g, 'CITY OF LOS SANTOS');
                }
            }

            setTemplate(parsedOutput);
        }
    }, [generatorConfig, formData, setReportTitle, setCustomButton]);
  
    return (
        <div ref={innerRef} className="p-4 border rounded-lg bg-card text-card-foreground">
             {generatorConfig?.is_html_output ? (
                <div dangerouslySetInnerHTML={{ __html: template || "Generating..." }} />
             ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{template || "Generating..."}</div>
             )}
        </div>
    );
};
  

function PaperworkSubmitContent() {
    const { formData, generatorId, generatorType, groupId, lastFormValues } = usePaperworkStore();
    const { archiveReport } = useArchiveStore();
    const { t } = useI18n();
    const tPage = useScopedI18n('paperworkSubmit');

    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
    const [reportTitle, setReportTitle] = useState('');
    const [customButton, setCustomButton] = useState<{ text: string, link: string } | null>(null);
    const [isDownloadingImage, setIsDownloadingImage] = useState(false);
    const [generatorDetails, setGeneratorDetails] = useState<{ title?: string; description?: string; icon?: string } | null>(null);
    const [hasArchived, setHasArchived] = useState(false);

    useEffect(() => {
      setIsClient(true);
      document.title = t('paperworkSubmit.documentTitle');
    }, [t]);

    useEffect(() => {
        setHasArchived(false);
    }, [generatorId, lastFormValues]);

    useEffect(() => {
        if (
            hasArchived ||
            !generatorId ||
            !generatorType ||
            !lastFormValues ||
            !generatorDetails
        ) {
            return;
        }

        archiveReport({
            paperworkType: 'paperwork-generator',
            fields: lastFormValues,
            generator: {
                id: generatorId,
                type: generatorType,
                groupId: groupId || null,
                title: generatorDetails.title,
                description: generatorDetails.description,
                icon: generatorDetails.icon,
            },
        });
        setHasArchived(true);
    }, [
        archiveReport,
        generatorId,
        generatorType,
        groupId,
        lastFormValues,
        generatorDetails,
        hasArchived,
    ]);

    const handleCopy = () => {
        if (reportRef.current?.firstChild) {
          navigator.clipboard.writeText((reportRef.current.firstChild as HTMLElement).innerHTML);
          toast({
            title: tPage('toasts.copySuccess.title'),
            description: tPage('toasts.copySuccess.description'),
            variant: "default",
          })
        }
    };

    const handleCopyTitle = () => {
        navigator.clipboard.writeText(reportTitle);
        toast({
            title: tPage('toasts.copySuccess.title'),
            description: tPage('toasts.copyTitleSuccess.description'),
        })
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
            const sanitizedTitle = reportTitle ? reportTitle.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase() : 'paperwork';
            link.download = `${sanitizedTitle}-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast({
                title: tPage('toasts.downloadStart.title'),
                description: tPage('toasts.downloadStart.description'),
            });
        } catch (error) {
            console.error('Failed to download paperwork image:', error);
            toast({
                title: tPage('toasts.downloadFailed.title'),
                description: tPage('toasts.downloadFailed.description'),
                variant: 'destructive',
            });
        } finally {
            setIsDownloadingImage(false);
        }
    };
  
    if (!isClient) {
      return (
          <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
              </div>
        </div>
      );
    }

    if (!generatorId || !formData) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                 <PageHeader
                    title={tPage('error.header.title')}
                    description={tPage('error.header.description')}
                />
                <Alert variant="destructive">
                    <AlertTitle>{tPage('error.alert.title')}</AlertTitle>
                    <AlertDescription>{tPage('error.alert.description')}</AlertDescription>
                </Alert>
            </div>
        )
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
            <AlertDescription>{tPage('alert.description')}</AlertDescription>
        </Alert>
          
        {reportTitle && (
            <div className="space-y-2">
                <Label htmlFor="report-title">{tPage('reportTitleLabel')}</Label>
                <div className="flex items-center gap-2">
                    <Input id="report-title" value={reportTitle} readOnly />
                    <Button type="button" variant="outline" onClick={handleCopyTitle}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        {tPage('buttons.copyTitle')}
                    </Button>
                </div>
            </div>
        )}
        <GeneratedFormattedReport
            innerRef={reportRef}
            setReportTitle={setReportTitle}
            setCustomButton={setCustomButton}
            onGeneratorLoaded={setGeneratorDetails}
        />

        <div className="flex justify-end mt-6 gap-2">
            {customButton && (
                <Button asChild variant="secondary">
                    <a href={customButton.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {customButton.text}
                    </a>
                </Button>
            )}
            <Button variant="outline" onClick={handleDownloadImage} disabled={!reportRef.current || isDownloadingImage}>
                <ImageDown className="mr-2 h-4 w-4" />
                {isDownloadingImage ? tPage('buttons.downloading') : tPage('buttons.download')}
            </Button>
            <Button onClick={handleCopy} disabled={!isClient}>
                <Clipboard className="mr-2 h-4 w-4" />
                {tPage('buttons.copyPaperwork')}
            </Button>
        </div>
      </div>
    );
  }

export function PaperworkSubmitPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaperworkSubmitContent />
        </Suspense>
    )
}
