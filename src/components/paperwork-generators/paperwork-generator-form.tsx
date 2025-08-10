
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { OfficerSection } from '../arrest-report/officer-section';
import { GeneralSection } from '../arrest-report/general-section';
import { Separator } from '../ui/separator';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useOfficerStore } from '@/stores/officer-store';
import { useFormStore as useBasicFormStore } from '@/stores/form-store';

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
  output: string;
  form: FormField[];
};

interface PaperworkGeneratorFormProps {
  generatorConfig: GeneratorConfig;
}

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const { register, handleSubmit, getValues } = useForm();
    const { setGeneratorId, setFormData } = usePaperworkStore();
    const { officers } = useOfficerStore.getState();
    const { general } = useBasicFormStore.getState().formData;
    
    const onSubmit = (data: any) => {
        const fullData = {
            ...data,
            officers,
            general,
        };
        setGeneratorId(generatorConfig.id);
        setFormData(fullData);
        router.push('/arrest-submit?type=generator');
    };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {generatorConfig.form.map((field, index) => {
          switch (field.type) {
            case 'hidden':
                return <input key={`${field.name}-${index}`} type="hidden" {...register(field.name)} defaultValue={field.value} />;

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
                  <Input id={field.name} {...register(field.name)} placeholder={field.placeholder} />
                </div>
              );

            case 'textarea':
                return (
                    <div key={`${field.name}-${index}`}>
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Textarea id={field.name} {...register(field.name)} placeholder={field.placeholder} className="min-h-[120px]" />
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
          <Button type="submit">Generate Paperwork</Button>
        </div>
      </form>
    </div>
  );
}
