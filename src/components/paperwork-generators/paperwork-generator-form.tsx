
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, FormProvider, useFieldArray, FieldErrors } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '../ui/select';
import { Button } from '../ui/button';
import { OfficerSection } from '../shared/officer-section';
import { GeneralSection } from '../shared/general-section';
import { Separator } from '../ui/separator';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useOfficerStore } from '@/stores/officer-store';
import { useFormStore as useBasicFormStore } from '@/stores/form-store';
import { Switch } from '../ui/switch';
import { type PenalCode } from '@/stores/charge-store';
import { useEffect, useState, useCallback, Suspense, useMemo } from 'react';
import { Combobox } from '../ui/combobox';
import { PaperworkChargeField } from './paperwork-generator-charge-field';
import { LocationDetails } from '../shared/location-details';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '../ui/multi-select';
import { TextareaWithPreset } from '../shared/textarea-with-preset';
import Handlebars from 'handlebars';
import { cn } from '@/lib/utils';
import configData from '../../../data/config.json';

type FormField = {
    type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group' | 'location' | 'input_group' | 'multi-select' | 'textarea-with-preset';
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
    multi?: boolean;
    stipulation?: {
        field: string;
        value: any;
    },
    stipulations?: {
        field: string;
        value: any;
    }[],
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
    // Textarea with preset
    modifiers?: any[];
    preset?: string;
    noLocalStorage?: boolean;
    refreshOn?: string[];
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

const buildDefaultValues = (fields: FormField[]): Record<string, any> => {
    const defaults: Record<string, any> = {};

    for (const field of fields) {
        if (field.type === 'group' && field.fields) {
            Object.assign(defaults, buildDefaultValues(field.fields));
        } else if (field.type === 'input_group' && field.name) {
            defaults[field.name] = field.defaultValue ?? [];
        } else if (field.type === 'charge' && field.name) {
            defaults[field.name] = field.defaultValue ?? [];
        } else if (field.type === 'textarea-with-preset' && field.name) {
             defaults[field.name] = {
                modifiers: (field.modifiers || []).reduce((acc, mod) => ({...acc, [mod.name]: true }), {}),
                narrative: '',
                isPreset: true,
                userModified: false
            };
        } else if (field.name) {
            if (field.type === 'toggle') {
                defaults[field.name] = field.defaultValue === true;
            } else if (field.type === 'multi-select') {
                defaults[field.name] = field.defaultValue || [];
            } else {
                defaults[field.name] = field.defaultValue ?? '';
            }
        }
    }
    return defaults;
};

function PaperworkGeneratorFormComponent({ generatorConfig }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultValues = useMemo(
        () => buildDefaultValues(generatorConfig.form),
        [generatorConfig.form]
    );

    const methods = useForm({
        criteriaMode: 'all',
        defaultValues
    });
    const { register, handleSubmit, control, watch, trigger, getValues } = methods;

    const officers = useOfficerStore(state => state.officers);
    const generalData = useBasicFormStore(state => state.formData.general);

    const setGeneratorData = usePaperworkStore(state => state.setGeneratorData);
    const setFormData = usePaperworkStore(state => state.setFormData);
    const resetPaperwork = usePaperworkStore(state => state.reset);
    const { toast } = useToast();
    
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [vehiclesFetched, setVehiclesFetched] = useState(false);
    const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);

    useEffect(() => {
        resetPaperwork();
    }, [generatorConfig.id, resetPaperwork]);

    useEffect(() => {
        const hasChargeField = generatorConfig.form.some(field => field.type === 'charge' || field.fields?.some(f => f.type === 'charge'));
        const hasLocationFields = generatorConfig.form.some(field => field.type === 'location' || field.optionsSource === 'districts' || field.optionsSource === 'streets');
        
        if (hasChargeField && !penalCode) {
            fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_penal_code.json')
                .then((res) => res.json())
                .then((data) => setPenalCode(data));
        }
        if (hasLocationFields && locations.districts.length === 0) {
            fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_locations.json')
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
        fetch(configData.CONTENT_DELIVERY_NETWORK+'?file=gtaw_vehicles.json')
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
        if (field.stipulations) {
            const allMet = field.stipulations.every(stip => {
                const watchedValue = watch(stip.field);
                return String(watchedValue) === String(stip.value);
            });
            if (!allMet) {
                return null;
            }
        } else if (field.stipulation) {
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
                return <GeneralSection key={fieldKey} />;
            
            case 'officer':
                return <OfficerSection key={fieldKey} isArrestReport={false} isMultiOfficer={field.multi} />;

            case 'location':
                return <LocationDetails
                            key={fieldKey}
                            districtFieldName={`${field.name}.district`}
                            streetFieldName={`${field.name}.street`}
                            showDistrict={field.showDistrict !== false}
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
                                        isInvalid={field.required && !value}
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

            case 'textarea-with-preset':
                const isPresetActive = watch(`${path}.isPreset`);
                const isUserModified = watch(`${path}.userModified`);

                const narrativeText = (() => {
                    if (!isPresetActive || isUserModified) {
                        return watch(`${path}.narrative`);
                    }

                    const allData = watch();
                    const externalData: any = {};

                    (field.refreshOn || []).forEach(dep => {
                        if (dep === 'officers') externalData.officers = officers;
                        else if (dep === 'general') externalData.general = generalData;
                    });

                    const dataForHandlebars: any = { ...allData, ...externalData, modifiers: {} };

                    (field.modifiers || []).forEach(mod => {
                        const isEnabled = watch(`${path}.modifiers.${mod.name}`);
                        const dependenciesMet = (mod.requires || []).every((dep: string) => watch(`${path}.modifiers.${dep}`));
                        if (isEnabled && dependenciesMet) {
                            try {
                                const templateSource = (mod as any).generateText || mod.text || '';
                                const template = Handlebars.compile(templateSource, { noEscape: true });
                                dataForHandlebars.modifiers[mod.name] = template(dataForHandlebars);
                            } catch (e) {
                                console.error(`Error compiling Handlebars template for modifier ${mod.name}:`, e);
                                dataForHandlebars.modifiers[mod.name] = `[Error in modifier: ${mod.name}]`;
                            }
                        } else {
                            dataForHandlebars.modifiers[mod.name] = '';
                        }
                    });

                    try {
                        const presetTemplate = Handlebars.compile(field.preset || '', { noEscape: true });
                        return presetTemplate(dataForHandlebars).trim();
                    } catch (e) {
                        console.error('Error compiling base preset:', e);
                        return '';
                    }
                })();

                return (
                    <TextareaWithPreset
                        key={fieldKey}
                        label={field.label || 'Narrative'}
                        placeholder={field.placeholder}
                        basePath={path}
                        control={control}
                        modifiers={field.modifiers || []}
                        isInvalid={!!(field.required && !watch(`${path}.narrative`))}
                        noLocalStorage={field.noLocalStorage}
                        presetValue={narrativeText}
                    />
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
                                    <SelectTrigger id={path} className={cn(field.required && !value && 'border-red-500 focus-visible:ring-red-500')}>
                                        <SelectValue placeholder={field.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((option) => {
                                            if (typeof option === 'string') {
                                                return <SelectItem key={option} value={option}>{option}</SelectItem>;
                                            }
                                            if (typeof option === 'object' && option.label && option.items) {
                                                return (
                                                    <SelectGroup key={option.label}>
                                                        <SelectLabel>{option.label}</SelectLabel>
                                                        {option.items.map((item: string) => (
                                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                );
                                            }
                                            return null;
                                        })}
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
                             rules={{ required: field.required }}
                             defaultValue={field.defaultValue || []}
                             render={({ field: { onChange, value } }) => (
                                 <MultiSelect
                                     options={field.options || []}
                                     onValueChange={onChange}
                                     defaultValue={value}
                                     placeholder={field.placeholder}
                                     className={cn(field.required && (!value || value.length === 0) && 'border-red-500 focus-visible:ring-red-500')}
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
                                    onCheckedChange={value => {
                                        onChange(value);
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
                            const subFieldPath = subField.name;
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
                else if (typeof childNode === 'object' && !Array.isArray(childNode)) {
                    processErrors(childNode, newPath);
                }
                 else if (Array.isArray(childNode)) {
                    childNode.forEach((item, index) => {
                        if (item) { 
                            processErrors(item, `${newPath}.${index}`);
                        }
                    });
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

        const type = searchParams.get('type') as 'static' | 'user';
        const groupId = searchParams.get('group_id');
        
        setGeneratorData({
            generatorId: generatorConfig.id,
            generatorType: type,
            groupId: groupId
        });

        setFormData(fullData);
        router.push('/paperwork-submit');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title={generatorConfig.title} description={generatorConfig.description} />
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    {generatorConfig.form.map((field, index) => {
                        const path = field.name || `${field.type}-${index}`;
                        return <div key={path}>{renderField(field, path, index)}</div>;
                    })}
                    <div className="flex justify-end mt-6">
                        <Button type="submit">Generate Paperwork</Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}

export function PaperworkGeneratorForm(props: PaperworkGeneratorFormProps) {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <PaperworkGeneratorFormComponent {...props} />
        </Suspense>
    )
}
