
'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Button } from '../ui/button';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useOfficerStore } from '@/stores/officer-store';
import { useFormStore as useBasicFormStore } from '@/stores/form-store';
import { type PenalCode } from '@/stores/charge-store';
import { useEffect, useState } from 'react';
import { renderField } from './paperwork-generator-field-renderer';

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

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const methods = useForm();
    const { control, register, handleSubmit, watch } = methods;

    const { setGeneratorId, setFormData } = usePaperworkStore();
    const { officers } = useOfficerStore.getState();
    const { general } = useBasicFormStore.getState().formData;

    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const needsPenalCode = generatorConfig.form.some(f => f.type === 'charge');
            const needsLocations = generatorConfig.form.some(f => f.type === 'location' || (f.type === 'datalist' && (f.optionsSource === 'districts' || f.optionsSource === 'streets')));
            const needsVehicles = generatorConfig.form.some(f => f.type === 'datalist' && f.optionsSource === 'vehicles');

            const promises = [];
            if (needsPenalCode) {
                promises.push(
                    fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
                    .then(res => res.json())
                    .then(data => setPenalCode(data))
                    .catch(err => console.error("Failed to fetch penal code:", err))
                );
            }
             if (needsLocations) {
                promises.push(
                    fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_locations.json')
                    .then(res => res.json())
                    .then(data => {
                        const uniqueDistricts = [...new Set<string>(data.districts || [])];
                        const uniqueStreets = [...new Set<string>(data.streets || [])];
                        setLocations({ districts: uniqueDistricts, streets: uniqueStreets });
                    })
                    .catch(err => console.error("Failed to fetch locations:", err))
                );
            }
            if (needsVehicles) {
                promises.push(
                    fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_vehicles.json')
                    .then(res => res.json())
                    .then(data => {
                        const vehicleNames = Object.values(data).map((vehicle: any) => vehicle.name);
                        setVehicles(vehicleNames);
                    })
                    .catch(err => console.error("Failed to fetch vehicles:", err))
                );
            }

            await Promise.all(promises);
            setIsLoading(false);
        };

        fetchData();
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
            {isLoading ? (
                <p>Loading form...</p>
            ) : (
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {generatorConfig.form.map((field, index) => renderField(
                            field,
                            index,
                            control,
                            register,
                            watch,
                            penalCode,
                            locations,
                            vehicles
                        ))}
                        <div className="flex justify-end mt-6">
                            <Button type="submit">Generate Paperwork</Button>
                        </div>
                    </form>
                </FormProvider>
            )}
        </div>
    );
}
