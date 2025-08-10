
'use client';
import { PageHeader } from '@/components/dashboard/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Info } from 'lucide-react';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePaperworkStore } from '@/stores/paperwork-store';


const GeneratedFormattedReport = ({ innerRef }: { innerRef: React.RefObject<HTMLDivElement> }) => {
    const { formData, generatorId } = usePaperworkStore();
    const [template, setTemplate] = useState('');
    const [generatorConfig, setGeneratorConfig] = useState<any>(null);

    useEffect(() => {
        if (generatorId) {
            fetch(`/data/paperwork-generators/${generatorId}.json`)
            .then(res => res.json())
            .then(config => {
                setGeneratorConfig(config);
            })
        }
    }, [generatorId]);
  
    useEffect(() => {
      if (generatorConfig) {
            let output = generatorConfig.output;
            
            // Replace simple wildcards
            for (const key in formData) {
                if (typeof formData[key] === 'string' || typeof formData[key] === 'number' ) {
                    output = output.replace(new RegExp(`{{${key}}}`, 'g'), formData[key]);
                }
            }
            
            // Replace officer wildcards (e.g., {{officers.0.name}})
            if(formData.officers) {
                formData.officers.forEach((officer: any, index: number) => {
                    for(const key in officer) {
                        output = output.replace(new RegExp(`{{officers.${index}.${key}}}`, 'g'), officer[key]);
                    }
                });
            }

            if(formData.general) {
                for(const key in formData.general) {
                    output = output.replace(new RegExp(`{{general.${key}}}`, 'g'), formData.general[key]);
                }
            }
            
            setTemplate(output);
      }
    }, [generatorConfig, formData]);
  
    return (
      <div ref={innerRef} className="prose dark:prose-invert max-w-none p-4 border rounded-lg bg-card">
         <pre className="whitespace-pre-wrap font-sans">{template}</pre>
      </div>
    );
  };

function FormSubmitContent() {
    const { formData } = usePaperworkStore();
    
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);
    const [reportHtml, setReportHtml] = useState('');
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    useEffect(() => {
        if (reportRef.current) {
            setReportHtml(reportRef.current.innerText); 
        }
    }, [formData, isClient, reportRef.current]);
  
    const handleCopy = () => {
        if (reportRef.current) {
          navigator.clipboard.writeText(reportRef.current.innerText); // Copying as plain text
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
                  <Skeleton className="h-48 w-full" />
              </div>
        </div>
      );
    }
  
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Paperwork Submission"
          description="Review the generated paperwork below."
        />
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                The preview on this page may not look 100% accurate, but the generated BBCode is designed to work perfectly on the forums.
            </AlertDescription>
        </Alert>
          
        <GeneratedFormattedReport innerRef={reportRef} />
  
         <div className="space-y-4 mt-6">
          <div className="flex justify-end">
              <Button onClick={handleCopy} disabled={!isClient || !formData}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy Paperwork
              </Button>
          </div>
          <div className="space-y-2">
              <label htmlFor="final-submission" className="font-medium">Final Submission Area (BBCode)</label>
              <Textarea 
                  id="final-submission"
                  placeholder="The BBCode for the report will be generated here."
                  className="min-h-[200px] font-mono text-xs"
                  value={reportHtml}
                  readOnly
              />
          </div>
        </div>
  
      </div>
    );
  }

export function FormSubmitPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FormSubmitContent />
        </Suspense>
    )
}
