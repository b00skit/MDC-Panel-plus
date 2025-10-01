
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

const GeneratedFormattedReport = ({
    innerRef,
    setReportTitle,
    setCustomButton,
    onGeneratorLoaded,
}: {
    innerRef: React.RefObject<HTMLDivElement>,
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
            Handlebars.registerHelper('lookup', (obj, key) => obj && obj[key]);
            Handlebars.registerHelper('with', function(this: any, context, options) {
                return options.fn(context);
            });
            Handlebars.registerHelper('if', function(this: any, conditional, options) {
                if (conditional) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            });
            Handlebars.registerHelper('eq', (a, b) => a === b);
            Handlebars.registerHelper('each', function(context, options) {
                let ret = "";
                if (Array.isArray(context)) {
                    for(let i = 0; i < context.length; i++) {
                        // Pass index and other helpful properties to the template
                        const data = options.data ? Handlebars.createFrame(options.data) : {};
                        data.index = i;
                        data.index_1 = i + 1;
                        data.first = (i === 0);
                        data.last = (i === context.length - 1);
                        ret = ret + options.fn(context[i], { data: data });
                    }
                }
                return ret;
            });
            Handlebars.registerHelper('is_in', (array, value) => array?.includes(value));
            
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
    }, []);

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
            title: "Success",
            description: "Paperwork content copied to clipboard.",
            variant: "default",
          })
        }
    };

    const handleCopyTitle = () => {
        navigator.clipboard.writeText(reportTitle);
        toast({
          title: "Success",
          description: "Report title copied to clipboard.",
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
                title: 'Download started',
                description: 'Your paperwork image is being downloaded.',
            });
        } catch (error) {
            console.error('Failed to download paperwork image:', error);
            toast({
                title: 'Download failed',
                description: 'Could not create an image from the paperwork preview. Please try again.',
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
                    title="Submission Error"
                    description="Could not find the necessary data to generate this paperwork."
                />
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load report data. Please go back to the generators page and try again.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
  
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Paperwork Submission"
          description="Review the formatted paperwork below."
        />
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                The preview on this page may not look 100% accurate, but the generated content is designed to work perfectly where you paste it.
            </AlertDescription>
        </Alert>
          
        {reportTitle && (
            <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <div className="flex items-center gap-2">
                    <Input id="report-title" value={reportTitle} readOnly />
                    <Button type="button" variant="outline" onClick={handleCopyTitle}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Title
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
                {isDownloadingImage ? 'Preparing Image...' : 'Download Report'}
            </Button>
            <Button onClick={handleCopy} disabled={!isClient}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Paperwork
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

    