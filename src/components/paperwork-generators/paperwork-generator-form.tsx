
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { OfficerSection } from '../arrest-report/officer-section';
import { GeneralSection } from '../arrest-report/general-section';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useOfficerStore } from '@/stores/officer-store';

type FormField = {
  type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general';
  name: string;
  label?: string;
  placeholder?: string;
  options?: string[];
};

type GeneratorConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
  form: FormField[];
  output: string;
};

interface PaperworkGeneratorFormProps {
  generatorConfig: GeneratorConfig;
}

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
  const router = useRouter();
  const { control, handleSubmit } = useForm();
  const setFormData = usePaperworkStore(state => state.setFormData);
  const setGeneratorId = usePaperworkStore(state => state.setGeneratorId);
  const { officers } = useOfficerStore.getState();
  const { general } = useFormStore.getState().formData;


  const onSubmit = (data: any) => {
    const { officers } = useOfficerStore.getState();
    const { general } = useFormStore.getState().formData;

    const fullData = {
        ...data,
        officers: officers,
        general: general,
    };
    setFormData(fullData);
    setGeneratorId(generatorConfig.id);
    router.push(`/form-submit`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {generatorConfig.form.map((field) => {
          switch (field.type) {
            case 'general':
              return <GeneralSection key={field.name} isSubmitted={false} />;
            case 'officer':
              return <OfficerSection key={field.name} isSubmitted={false} />;
            case 'text':
              return (
                <Card key={field.name}>
                  <CardHeader><CardTitle>{field.label}</CardTitle></CardHeader>
                  <CardContent>
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Input {...controllerField} placeholder={field.placeholder} />
                      )}
                    />
                  </CardContent>
                </Card>
              );
            case 'textarea':
                return (
                    <Card key={field.name}>
                        <CardHeader><CardTitle>{field.label}</CardTitle></CardHeader>
                        <CardContent>
                            <Controller
                            name={field.name}
                            control={control}
                            render={({ field: controllerField }) => (
                                <Textarea {...controllerField} placeholder={field.placeholder} className="min-h-[120px]" />
                            )}
                            />
                        </CardContent>
                    </Card>
                );
            case 'dropdown':
                return (
                    <Card key={field.name}>
                        <CardHeader><CardTitle>{field.label}</CardTitle></CardHeader>
                        <CardContent>
                            <Controller
                                name={field.name}
                                control={control}
                                render={({ field: controllerField }) => (
                                <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={field.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {field.options?.map((option) => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                )}
                            />
                        </CardContent>
                    </Card>
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
