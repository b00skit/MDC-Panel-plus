
'use client';

import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { OfficerSection } from '../arrest-report/officer-section';
import { GeneralSection } from '../arrest-report/general-section';
import { useOfficerStore } from '@/stores/officer-store';
import { useFormStore } from '@/stores/form-store';
import { Separator } from '../ui/separator';

type FormField = {
  type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden';
  name: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  title?: string;
  value?: string;
};

type GeneratorConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
  formAction: string;
  formMethod: 'POST' | 'GET';
  form: FormField[];
};

interface PaperworkGeneratorFormProps {
  generatorConfig: GeneratorConfig;
}

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const { officers } = useOfficerStore();
    const { general } = useFormStore().formData;

    // This component will now render a standard HTML form
    // The state from zustand will be used to set default/initial values
    // but the form submission will be handled by the browser natively.

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
      <form action={generatorConfig.formAction} method={generatorConfig.formMethod} className="space-y-6">
        {generatorConfig.form.map((field, index) => {
          switch (field.type) {
            case 'hidden':
                return <input key={`${field.name}-${index}`} type="hidden" name={field.name} defaultValue={field.value} />;

            case 'section':
                return (
                    <div key={`${field.title}-${index}`}>
                        <Separator className="my-4" />
                        <h4 className="mb-2 text-xl font-semibold tracking-tight">{field.title}</h4>
                    </div>
                );

            case 'general':
                return <GeneralSection key={`${field.name}-${index}`} isSubmitted={false} />;
            
            case 'officer':
                return <OfficerSection key={`${field.name}-${index}`} isSubmitted={false} />;

            case 'text':
              return (
                <div key={`${field.name}-${index}`}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input id={field.name} name={field.name} placeholder={field.placeholder} />
                </div>
              );

            case 'textarea':
                return (
                    <div key={`${field.name}-${index}`}>
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Textarea id={field.name} name={field.name} placeholder={field.placeholder} className="min-h-[120px]" />
                    </div>
                );

            case 'dropdown':
                return (
                    <div key={`${field.name}-${index}`}>
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Select name={field.name}>
                            <SelectTrigger id={field.name}>
                                <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            default:
              return null;
          }
        })}
        <div className="flex justify-end">
          <Button type="submit">Submit Paperwork</Button>
        </div>
      </form>
    </div>
  );
}
