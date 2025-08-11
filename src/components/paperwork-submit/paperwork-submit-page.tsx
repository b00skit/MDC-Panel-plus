
'use client';
import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Info } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePaperworkStore } from '@/stores/paperwork-store';
import Handlebars from 'handlebars';
import { ConditionalVariable } from '@/stores/paperwork-builder-store';

const GeneratedFormattedReport = ({ innerRef }: { innerRef: React.RefObject<HTMLDivElement> }) => {
    const { formData, generatorId } = usePaperworkStore();
    const [template, setTemplate] = useState('');
    const [generatorConfig, setGeneratorConfig] = useState<{ output: string; conditionals?: ConditionalVariable[] } | null>(null);
  
    useEffect(() => {
        if (generatorId) {
            // This logic assumes user-created forms are not in the main generator directory.
            const isUserForm = !['impound-report', 'traffic-report', 'trespass-notice', 'test-generator'].includes(generatorId);
            const url = isUserForm 
                ? `/api/paperwork-generators/${generatorId}?f=${generatorId}`
                : `/api/paperwork-generators/${generatorId}?s=${generatorId}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setGeneratorConfig(data);
                })
                .catch(err => console.error("Failed to load generator template", err));
        }
    }, [generatorId]);

    useEffect(() => {
        if(generatorConfig && formData) {
            Handlebars.registerHelper('lookup', (obj, key) => obj && obj[key]);
            Handlebars.registerHelper('with', function(context, options) {
                return options.fn(context);
            });
            Handlebars.registerHelper('if', function(this: any, conditional, options) {
                if (conditional) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            });
            Handlebars.registerHelper('start_loop', function(context, options) {
                let ret = "";
                if (Array.isArray(context)) {
                    for(let i = 0; i < context.length; i++) {
                        ret = ret + options.fn(context[i]);
                    }
                }
                return ret;
            });
            
            const templateString = generatorConfig.output
                                    .replace(/\{@start_(\w+)\}/g, '{{#start_loop $1}}')
                                    .replace(/\{@end_(\w+)\}/g, '{{/start_loop}}');

            const compiledTemplate = Handlebars.compile(templateString, { noEscape: true });

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
            
            const parsed = compiledTemplate(processedData);
            setTemplate(parsed);
        }
    }, [generatorConfig, formData]);
  
    return (
        <div ref={innerRef} className="p-4 border rounded-lg bg-card text-card-foreground">
            <div dangerouslySetInnerHTML={{ __html: template || "Generating..." }} />
        </div>
    );
};
  

function PaperworkSubmitContent() {
    const { formData } = usePaperworkStore();
    const searchParams = useSearchParams();
    const reportType = searchParams.get('type');
    
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleCopy = () => {
        if (reportRef.current) {
          navigator.clipboard.writeText(reportRef.current.innerHTML);
          toast({
            title: "Success",
            description: "Paperwork content copied to clipboard.",
            variant: "default",
          })
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

    if (reportType !== 'generator' || !formData) {
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
          
        <GeneratedFormattedReport innerRef={reportRef} />

        <div className="flex justify-end mt-6">
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
