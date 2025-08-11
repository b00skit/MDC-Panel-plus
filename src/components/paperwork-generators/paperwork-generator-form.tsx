
'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, FormProvider } from 'react-hook-form';
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
import { type PenalCode } from '@/stores/charge-store';
import { useEffect, useState } from 'react';
import { Combobox } from '../ui/combobox';
import { PaperworkChargeField } from './paperwork-generator-charge-field';
import { LocationDetails } from '../shared/location-details';

type FormField = {
  type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group' | 'location';
  name: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  optionsSource?: 'districts' | 'streets' | 'vehicles';
  title?: string;
  value?: string;
  dataOn?: string;
  dataOff?: string;
  defaultValue?: any;
  required?: boolean;
  stipulation?: {
    field: string;
    value: any;
  },
  fields?: FormField[]; // For group type
  // Charge field specific config
  showClass?: boolean;
  showOffense?: boolean;
  showAddition?: boolean;
  showCategory?: boolean;
  allowedTypes?: { F?: boolean, M?: boolean, I?: boolean };
  allowedIds?: string;
  customFields?: FormField[];
  previewFields?: {
    sentence?: boolean;
    fine?: boolean;
    impound?: boolean;
    suspension?: boolean;
  }
  // Location field specific config
  showDistrict?: boolean;
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

const renderField = (
    field: FormField, 
    index: number, 
    control: any, 
    register: any, 
    watch: any, 
    penalCode: PenalCode | null,
    locations: { districts: string[], streets: string[] },
    vehicles: string[]
) => {
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
          return <OfficerSection key={`${field.name}-${index}`} isSubmitted={false} isArrestReport={false} />;

        case 'location':
            return <LocationDetails 
                        key={`${field.name}-${index}`} 
                        districtFieldName={`${field.name}.district`}
                        streetFieldName={`${field.name}.street`}
                        showDistrict={field.showDistrict !== false}
                        isSubmitted={false}
                    />;
      case 'text':
        return (
          <div key={`${field.name}-${index}`} className="w-full">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input id={field.name} {...register(field.name, { required: field.required })} placeholder={field.placeholder} />
          </div>
        );
      case 'datalist': // Datalist now uses Combobox
          return (
            <div key={`${field.name}-${index}`} className="w-full">
                <Label htmlFor={field.name}>{field.label}</Label>
                 <Controller
                    control={control}
                    name={field.name!}
                    rules={{ required: field.required }}
                    render={({ field: { onChange, value } }) => {
                         let options: string[] = [];
                         if (field.optionsSource === 'districts') {
                            options = locations.districts;
                         } else if (field.optionsSource === 'streets') {
                             options = locations.streets;
                         } else if (field.optionsSource === 'vehicles') {
                             options = vehicles;
                         }

                        return (
                            <Combobox
                                options={options}
                                value={value}
                                onChange={onChange}
                                placeholder={field.placeholder}
                                searchPlaceholder='Search...'
                                emptyPlaceholder='No results.'
                            />
                        )
                    }}
                />
            </div>
        );

      case 'textarea':
          return (
              <div key={`${field.name}-${index}`} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Textarea id={field.name} {...register(field.name, { required: field.required })} placeholder={field.placeholder} className="min-h-[120px]" />
              </div>
          );

      case 'dropdown':
          return (
              <div key={`${field.name}-${index}`} className="w-full">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Controller
                      control={control}
                      name={field.name!}
                      rules={{ required: field.required }}
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
                      defaultValue={field.defaultValue === true}
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
              <PaperworkChargeField 
                key={`${field.name}-${index}`}
                control={control}
                register={register}
                watch={watch}
                penalCode={penalCode}
                config={{
                    name: field.name,
                    showClass: field.showClass,
                    showOffense: field.showOffense,
                    showAddition: field.showAddition,
                    showCategory: field.showCategory,
                    allowedTypes: field.allowedTypes,
                    allowedIds: field.allowedIds,
                    customFields: field.customFields,
                    previewFields: field.previewFields,
                }}
              />
          )
      case 'group':
          return (
              <div key={`group-${index}`} className="flex flex-col md:flex-row items-end gap-4 w-full">
                  {field.fields?.map((subField, subIndex) => renderField(subField, subIndex, control, register, watch, penalCode, locations, vehicles))}
              </div>
          );

      default:
        return null;
    }
  };

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const methods = useForm();
    const { register, handleSubmit, control, watch } = methods;

    const { setGeneratorId, setFormData } = usePaperworkStore();
    const { officers } = useOfficerStore.getState();
    const { general } = useBasicFormStore.getState().formData;
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const [vehicles, setVehicles] = useState<string[]>([]);

    useEffect(() => {
        fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
          .then((res) => res.json())
          .then((data) => setPenalCode(data));
        
        const hasDataListFields = generatorConfig.form.some(field => field.type === 'datalist');
        if (hasDataListFields) {
            const hasLocationFields = generatorConfig.form.some(field => field.optionsSource === 'districts' || field.optionsSource === 'streets');
            const hasVehicleField = generatorConfig.form.some(field => field.optionsSource === 'vehicles');

            if (hasLocationFields) {
                fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_locations.json')
                    .then(res => res.json())
                    .then(data => {
                        const uniqueDistricts = [...new Set<string>(data.districts || [])];
                        const uniqueStreets = [...new Set<string>(data.streets || [])];
                        setLocations({ districts: uniqueDistricts, streets: uniqueStreets });
                    })
                    .catch(err => console.error("Failed to fetch locations:", err));
            }
            
            if (hasVehicleField) {
                fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_vehicles.json')
                    .then(res => res.json())
                    .then(data => {
                        const vehicleNames = Object.values(data).map((vehicle: any) => vehicle.model);
                        setVehicles(vehicleNames);
                    })
                    .catch(err => console.error("Failed to fetch vehicles:", err));
            }
        }
    }, [generatorConfig]);

    const onSubmit = (data: any) => {
        const fullData = {
            ...data,
            officers,
            general,
            penalCode,
        };
        setGeneratorId(generatorConfig.id);
        setFormData(fullData);
        router.push('/paperwork-submit?type=generator');
    };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {generatorConfig.form.map((field, index) => renderField(field, index, control, register, watch, penalCode, locations, vehicles))}
                <div className="flex justify-end mt-6">
                <Button type="submit">Generate Paperwork</Button>
                </div>
            </form>
        </FormProvider>
    </div>
  );
}
