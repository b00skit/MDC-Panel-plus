
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller, FormProvider, useFieldArray, FieldErrors } from 'react-hook-form';
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
import { useEffect, useState, useCallback } from 'react';
import { Combobox } from '../ui/combobox';
import { PaperworkChargeField } from './paperwork-generator-charge-field';
import { LocationDetails } from '../shared/location-details';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '../ui/multi-select';

type FormField = {
    type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group' | 'location' | 'input_group' | 'multi-select';
    name: string;
    label?: string;
    placeholder?: string;
    options?: any[];
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
    fields?: FormField[]; // For group and input_group types
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

export function PaperworkGeneratorForm({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const methods = useForm({
        // Set validation criteria mode to 'all' to report all errors, not just the first.
        criteriaMode: 'all',
        // Set default values to prevent "uncontrolled to controlled" input errors.
        defaultValues: generatorConfig.form.reduce((acc, field) => {
            if (field.type === 'input_group' && field.name) {
                acc[field.name] = [];
            } else if (field.name) {
                acc[field.name] = field.defaultValue ?? '';
            }
            return acc;
        }, {} as Record<string, any>)
    });
    const { register, handleSubmit, control, watch, trigger } = methods;

    const { setGeneratorId, setFormData } = usePaperworkStore();
    const { toast } = useToast();
    
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [vehiclesFetched, setVehiclesFetched] = useState(false);
    const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);

    useEffect(() => {
        const hasChargeField = generatorConfig.form.some(field => field.type === 'charge' || field.fields?.some(f => f.type === 'charge'));
        const hasLocationFields = generatorConfig.form.some(field => field.type === 'location' || field.optionsSource === 'districts' || field.optionsSource === 'streets');
        
        if (hasChargeField && !penalCode) {
            fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_penal_code.json')
                .then((res) => res.json())
                .then((data) => setPenalCode(data));
        }
        if (hasLocationFields && locations.districts.length === 0) {
            fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_locations.json')
                .then(res => res.json())
                .then(data => {
                    const uniqueDistricts = [...new Set<string>(data.districts || [])];
                    const uniqueStreets = [...new Set<string>(data.streets || [])];
                    setLocations({ districts: uniqueDistricts, streets: uniqueStreets });
                })
                .catch(err => console.error("Failed to fetch locations:", err));
        }

    }, [generatorConfig, penalCode, locations.districts.length]);

    const handleVehicleFetch = useCallback(() => {
        if (vehiclesFetched || isFetchingVehicles) {
            return;
        }
        setIsFetchingVehicles(true);
        fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_vehicles.json')
            .then(res => res.json())
            .then(data => {
                const vehicleNames = Object.values(data).map((vehicle: any) => vehicle.name);
                setVehicles(vehicleNames);
                setVehiclesFetched(true);
            })
            .catch(err => console.error("Failed to fetch vehicles:", err))
            .finally(() => {
                setIsFetchingVehicles(false);
            });
    }, [vehiclesFetched, isFetchingVehicles]);

    const renderField = (
        field: FormField, 
        path: string,
        index?: number,
    ) => {
        const fieldKey = `${path}-${index}`;

        if (field.stipulation) {
            const watchedValue = watch(field.stipulation.field);
            if (String(watchedValue) !== String(field.stipulation.value)) {
                return null;
            }
        }
        switch (field.type) {
            case 'hidden':
                return <input key={fieldKey} type="hidden" {...register(path)} defaultValue={field.value} />;

            case 'section':
                return (
                    <div key={fieldKey}>
                        <Separator className="my-4" />
                        <h4 className="mb-2 text-xl font-semibold tracking-tight">{field.title}</h4>
                    </div>
                );

            case 'general':
                return <GeneralSection key={fieldKey} isSubmitted={false} />;
            
            case 'officer':
                return <OfficerSection key={fieldKey} isSubmitted={false} isArrestReport={false} />;

            case 'location':
                return <LocationDetails 
                            key={fieldKey}
                            districtFieldName={`${field.name}.district`}
                            streetFieldName={`${field.name}.street`}
                            showDistrict={field.showDistrict !== false}
                            isSubmitted={false}
                        />;
            case 'text':
                return (
                    <div key={fieldKey} className="w-full">
                        <Label htmlFor={path}>{field.label}</Label>
                        <Input id={path} {...register(path, { required: field.required })} placeholder={field.placeholder} defaultValue={field.defaultValue} />
                    </div>
                );
            case 'datalist':
                return (
                    <div key={fieldKey} className="w-full">
                        <Label htmlFor={path}>{field.label}</Label>
                        <Controller
                            control={control}
                            name={path}
                            defaultValue={field.defaultValue}
                            rules={{ required: field.required }}
                            render={({ field: { onChange, value } }) => {
                                let options: string[] = [];
                                let onOpen: (() => void) | undefined = undefined;
                                let isLoading = false;

                                if (field.optionsSource === 'districts') {
                                    options = locations.districts;
                                } else if (field.optionsSource === 'streets') {
                                    options = locations.streets;
                                } else if (field.optionsSource === 'vehicles') {
                                    options = vehicles;
                                    onOpen = handleVehicleFetch;
                                    isLoading = isFetchingVehicles;
                                }

                                return (
                                    <Combobox
                                        options={options}
                                        value={value}
                                        onChange={onChange}
                                        onOpen={onOpen}
                                        isLoading={isLoading}
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
                    <div key={fieldKey} className="w-full">
                        <Label htmlFor={path}>{field.label}</Label>
                        <Textarea id={path} {...register(path, { required: field.required })} placeholder={field.placeholder} className="min-h-[120px]" />
                    </div>
                );

            case 'dropdown':
                return (
                    <div key={fieldKey} className="w-full">
                        <Label htmlFor={path}>{field.label}</Label>
                        <Controller
                            control={control}
                            name={path}
                            rules={{ required: field.required }}
                            defaultValue={field.defaultValue}
                            render={({ field: { onChange, value } }) => (
                                <Select onValueChange={onChange} value={value} defaultValue={field.defaultValue}>
                                    <SelectTrigger id={path}>
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
            
             case 'multi-select':
                return (
                    <div key={fieldKey} className="w-full">
                        <Label htmlFor={path}>{field.label}</Label>
                        <Controller
                            name={path}
                            control={control}
                            defaultValue={field.defaultValue || []}
                            render={({ field: { onChange, value } }) => (
                                <MultiSelect
                                    options={field.options || []}
                                    onValueChange={onChange}
                                    defaultValue={value}
                                    placeholder={field.placeholder}
                                />
                            )}
                         />
                    </div>
                );

            case 'toggle':
                return (
                    <div key={fieldKey} className="flex items-center space-x-2 pt-6">
                        <Controller
                            name={path}
                            control={control}
                            defaultValue={field.defaultValue === true}
                            render={({ field: { onChange, value } }) => (
                                <Switch
                                    id={path}
                                    checked={value}
                                    onCheckedChange={(checked) => {
                                        onChange(checked);
                                        trigger(); 
                                    }}
                                />
                            )}
                        />
                        <Label htmlFor={path}>
                            {watch(path) ? field.dataOn : field.dataOff}
                        </Label>
                    </div>
                );
            case 'charge':
                return (
                    <PaperworkChargeField 
                        key={fieldKey}
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
                    <div key={fieldKey} className="flex flex-col md:flex-row items-end gap-4 w-full">
                        {field.fields?.map((subField, subIndex) => {
                            const subFieldPath = `${path}.${subField.name}`;
                            return <div key={`${subField.name}-${subIndex}`} className="w-full">{renderField(subField, subFieldPath, subIndex)}</div>;
                        })}
                    </div>
                );

            case 'input_group':
                return <MultiInputGroup key={fieldKey} fieldConfig={field} renderField={renderField} />;

            default:
                return null;
        }
    };

    const MultiInputGroup = ({ fieldConfig, renderField }: { fieldConfig: FormField, renderField: Function }) => {
        const { fields, append, remove } = useFieldArray({
            control,
            name: fieldConfig.name
        });

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{fieldConfig.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 p-4 border rounded-lg">
                            <div className="flex-1 space-y-4">
                                {fieldConfig.fields?.map((subField) => (
                                    renderField(subField, `${fieldConfig.name}.${index}.${subField.name}`)
                                ))}
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append(fieldConfig.fields?.reduce((acc, f) => ({...acc, [f.name]: f.defaultValue || ''}), {}) || {})}>
                        <Plus className="mr-2 h-4 w-4" /> Add {fieldConfig.label}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const onError = (errors: FieldErrors) => {
        const errorMessages: string[] = [];
    
        const findFieldLabel = (fieldName: string, fields: FormField[]): string | undefined => {
            for (const field of fields) {
                if (field.name === fieldName) return field.label;
                if (field.fields) {
                    const foundLabel = findFieldLabel(fieldName, field.fields);
                    if (foundLabel) return foundLabel;
                }
            }
        };

        const processErrors = (errorNode: any, path: string = '') => {
            for (const key in errorNode) {
                const newPath = path ? `${path}.${key}` : key;
                const childNode = errorNode[key];
                if (!childNode) continue;
    
                if (childNode.type && childNode.message) {
                    const label = findFieldLabel(newPath, generatorConfig.form) || newPath.replace(/_/g, ' ');
                    errorMessages.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${childNode.message || 'This field is required.'}`);
                } 
                else if (typeof childNode === 'object') {
                    processErrors(childNode, newPath);
                }
            }
        };
    
        processErrors(errors);
    
        if (errorMessages.length === 0 && Object.keys(errors).length > 0) {
            errorMessages.push("Please review the form and fill out all required fields.");
        }
    
        const uniqueMessages = [...new Set(errorMessages)];
        
        uniqueMessages.forEach(msg => {
            toast({
                title: 'Validation Error',
                description: msg,
                variant: 'destructive',
            });
        });
    };

    const onSubmit = (data: any) => {
        const { officers } = useOfficerStore.getState();
        const { general } = useBasicFormStore.getState().formData;
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
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    {generatorConfig.form.map((field, index) => {
                        const fieldKey = `${field.name || field.type}-${index}`;
                        return <div key={fieldKey}>{renderField(field, field.name || fieldKey, index)}</div>;
                    })}
                    <div className="flex justify-end mt-6">
                        <Button type="submit">Generate Paperwork</Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
