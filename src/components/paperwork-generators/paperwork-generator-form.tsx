
'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Switch } from '../ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { Charge, PenalCode } from '@/stores/charge-store';
import { useEffect, useState } from 'react';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


type FormField = {
  type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group';
  name?: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  optionsSource?: string; // URL to fetch options from
  title?: string;
  value?: string;
  dataOn?: string;
  dataOff?: string;
  charges?: Charge[];
  stipulation?: {
    field: string;
    value: any;
  },
  fields?: FormField[]; // For group type
};

type GeneratorConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
  output: string;
  formAction?: string;
  formMethod?: string;
  form: FormField[];
};

interface PaperworkGeneratorFormProps {
  generatorConfig: GeneratorConfig;
}

const getTypeClasses = (type: Charge['type']) => {
    switch (type) {
      case 'F':
        return 'bg-red-500 hover:bg-red-500/80 text-white';
      case 'M':
        return 'bg-yellow-500 hover:bg-yellow-500/80 text-white';
      case 'I':
        return 'bg-green-500 hover:bg-green-500/80 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-500/80 text-white';
    }
  };

const renderField = (field: FormField, index: number, control: any, register: any, watch: any, fields?: any, append?: any, remove?: any, penalCode?: PenalCode | null) => {
    if (field.stipulation) {
        const watchedValue = watch(field.stipulation.field);
        if (watchedValue !== field.stipulation.value) {
            return null;
        }
    }
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
          <div key={`${field.name}-${index}`} className="w-full">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input id={field.name} {...register(field.name)} placeholder={field.placeholder} />
          </div>
        );
      case 'datalist':
          const dataListId = `${field.name}-list`;
          return (
              <div key={`${field.name}-${index}`} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input id={field.name} {...register(field.name)} placeholder={field.placeholder} list={dataListId} />
                  <datalist id={dataListId}>
                      {field.options?.map((option) => (
                          <option key={option} value={option} />
                      ))}
                  </datalist>
              </div>
          );

      case 'textarea':
          return (
              <div key={`${field.name}-${index}`} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Textarea id={field.name} {...register(field.name)} placeholder={field.placeholder} className="min-h-[120px]" />
              </div>
          );

      case 'dropdown':
          return (
              <div key={`${field.name}-${index}`} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Controller
                      control={control}
                      name={field.name!}
                      render={({ field: { onChange, value } }) => (
                          <Select onValueChange={onChange} value={value}>
                              <SelectTrigger id={field.name}>
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
              </div>
          );
      case 'toggle':
          return (
              <div key={`${field.name}-${index}`} className="flex items-center space-x-2 pt-6">
                   <Controller
                      name={field.name!}
                      control={control}
                      defaultValue={false}
                      render={({ field: { onChange, value } }) => (
                          <Switch
                              id={field.name}
                              checked={value}
                              onCheckedChange={onChange}
                          />
                      )}
                  />
                  <Label htmlFor={field.name}>
                      {watch(field.name!) ? field.dataOn : field.dataOff}
                  </Label>
              </div>
          );
      case 'charge':
          return (
              <div key={field.name + '-' + index} className="space-y-4">
                  {fields.map((chargeItem: any, chargeIndex: number) => (
                      <div key={chargeItem.id} className="flex items-end gap-2 p-4 border rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          <Controller
                              name={`charges.${chargeIndex}.id`}
                              control={control}
                              render={({ field: { onChange, value } }) => (
                                  <Combobox
                                      value={value}
                                      onChange={onChange}
                                      placeholder="Select Charge"
                                      options={penalCode ? Object.keys(penalCode).map(k => `${penalCode[k].id} - ${penalCode[k].charge}`) : []}
                                  />
                              )}
                          />
                              <Input {...register(`charges.${chargeIndex}.class`)} placeholder="Class (e.g., A, B, C)" />
                              <Input {...register(`charges.${chargeIndex}.fine`)} placeholder="Fine Amount" type="number" />
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(chargeIndex)}>
                              <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                      </div>
                  ))}
                   <Button type="button" variant="outline" onClick={() => append({ id: '', class: '', fine: '' })}>
                      <Plus className="mr-2 h-4 w-4" /> Add Charge/Citation
                  </Button>
              </div>
          )
      case 'group':
          return (
              <div key={`group-${index}`} className="flex flex-col md:flex-row items-end gap-4">
                  {field.fields?.map((subField, subIndex) => renderField(subField, subIndex, control, register, watch))}
              </div>
          );

      default:
        return null;
    }
  };

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const { register, handleSubmit, control, watch, setValue } = useForm();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "charges"
    });

    const { setGeneratorId, setFormData } = usePaperworkStore();
    const { officers } = useOfficerStore.getState();
    const { general } = useBasicFormStore.getState().formData;
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);

    useEffect(() => {
        fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
          .then((res) => res.json())
          .then((data) => setPenalCode(data));
    }, []);

    const onSubmit = (data: any) => {
        const fullData = {
            ...data,
            officers,
            general,
        };
        setGeneratorId(generatorConfig.id);
        setFormData(fullData);
        router.push('/paperwork-submit?type=generator');
    };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
      <form onSubmit={handleSubmit(onSubmit)} action={generatorConfig.formAction} method={generatorConfig.formMethod} className="space-y-6">
        {generatorConfig.form.map((field, index) => renderField(field, index, control, register, watch, fields, append, remove, penalCode))}
        <div className="flex justify-end mt-6">
          <Button type="submit">Generate Paperwork</Button>
        </div>
      </form>
    </div>
  );
}
