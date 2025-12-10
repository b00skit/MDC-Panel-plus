
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
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useChargeStore } from '@/stores/charge-store';
import { Switch } from '../ui/switch';
import { type PenalCode } from '@/stores/charge-store';
import { useEffect, useState, useCallback, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { Combobox } from '../ui/combobox';
import { PaperworkChargeField } from './paperwork-generator-charge-field';
import { LocationDetails } from '../shared/location-details';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '../ui/multi-select';
import { TextareaWithPreset, ModifierInputGroup } from '../shared/textarea-with-preset';
import Handlebars from 'handlebars';
import { cn, registerHelpers } from '@/lib/utils';
import configData from '../../../data/config.json';
import { getGtawDataUrl } from '@/lib/gtaw-data';
import { FormField, type ValueGeneratorConfig } from './paperwork-generator-charge-field';
import { BetterSwitch } from '../ui/better-switch';
import { addDays, format } from 'date-fns';

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
    generatorId: string | null;
    generatorType: 'static' | 'user';
    groupId: string | null;
}

const splitFieldPath = (fieldName: string): string[] =>
    fieldName
        .split('.')
        .map(segment => segment.trim())
        .filter(Boolean);

const setValueAtPath = (target: Record<string, any>, path: string[], value: any) => {
    if (path.length === 0) return;
    let current = target;
    path.forEach((segment, index) => {
        if (index === path.length - 1) {
            current[segment] = value;
        } else {
            if (!current[segment] || typeof current[segment] !== 'object' || Array.isArray(current[segment])) {
                current[segment] = {};
            }
            current = current[segment];
        }
    });
};

const getValueAtPath = (target: any, path: string[]) => {
    let current = target;
    for (const segment of path) {
        if (current === undefined || current === null) return undefined;
        current = current[segment];
    }
    return current;
};

const mergeDeep = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
    Object.entries(source).forEach(([key, value]) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return;
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                target[key] = {};
            }
            mergeDeep(target[key] as Record<string, any>, value as Record<string, any>);
        } else {
            target[key] = value;
        }
    });
    return target;
};

const normalizeFieldPaths = (input: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {};

    Object.entries(input).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            const normalizedArray = value.map((item) =>
                item && typeof item === 'object' && !Array.isArray(item)
                    ? normalizeFieldPaths(item as Record<string, any>)
                    : item
            );

            if (key.includes('.')) {
                setValueAtPath(normalized, splitFieldPath(key), normalizedArray);
            } else {
                normalized[key] = normalizedArray;
            }
            return;
        }

        if (value && typeof value === 'object') {
            const nested = normalizeFieldPaths(value as Record<string, any>);
            if (key.includes('.')) {
                setValueAtPath(normalized, splitFieldPath(key), nested);
            } else {
                normalized[key] = nested;
            }
            return;
        }

        if (key.includes('.')) {
            setValueAtPath(normalized, splitFieldPath(key), value);
        } else {
            normalized[key] = value;
        }
    });

    return normalized;
};

const randomDigits = (length: number) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const defaultGeneratorConfigs: Record<string, ValueGeneratorConfig> = {
    trafficCitationNumber: { type: 'pattern', pattern: 'TC-{{date:MMM}}-{{digits:5}}', uppercase: true },
    infractionCitationNumber: { type: 'pattern', pattern: 'IC-{{date:MMM}}-{{digits:5}}', uppercase: true },
    parkingCitationNumber: { type: 'pattern', pattern: 'PT-{{date:MMM}}-{{digits:5}}', uppercase: true },
    insuranceProvider: { type: 'choice', options: ['Maze Bank Insurance', 'Fleeca Insurance'] },
    insurancePolicyNumber: { type: 'pattern', pattern: 'POL-{{digits:7}}' },
    unitSerialNumber: { type: 'pattern', pattern: 'US-{{digits:6}}' },
    propertyReceiptNumber: { type: 'pattern', pattern: 'PR-{{digits:5}}' },
    parkingInventoryNumber: { type: 'pattern', pattern: 'INV-{{digits:5}}' },
    parkingRespondByDate: { type: 'pattern', pattern: '{{date+14:dd/MMM/yyyy}}', uppercase: true },
};

const PATTERN_TOKEN_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;

const resolvePatternToken = (rawToken: string): string => {
    const token = rawToken.trim();
    if (!token) return '';

    const [directive, ...rest] = token.split(':');
    const normalizedDirective = directive.trim();

    if (/^digits\d*$/i.test(normalizedDirective) || normalizedDirective.toLowerCase() === 'digits') {
        const lengthPart = rest[0]?.trim() ?? normalizedDirective.replace(/^[^\d]*/, '');
        const length = Number.parseInt(lengthPart || '0', 10);
        return randomDigits(Number.isFinite(length) ? length : 0);
    }

    if (normalizedDirective.toLowerCase().startsWith('date')) {
        const offsetMatch = normalizedDirective.match(/^date([+-]\d+)?$/i);
        const offset = offsetMatch?.[1] ? Number.parseInt(offsetMatch[1], 10) : 0;
        const formatString = rest.join(':').trim() || 'yyyy-MM-dd';
        const targetDate = addDays(new Date(), Number.isFinite(offset) ? offset : 0);
        return format(targetDate, formatString);
    }

    if (normalizedDirective.toLowerCase() === 'choice') {
        const options = rest.join(':')
            .split('|')
            .map(option => option.trim())
            .filter(Boolean);
        if (options.length === 0) {
            return '';
        }
        return options[Math.floor(Math.random() * options.length)];
    }

    return '';
};

const generateFromPattern = ({ pattern, uppercase }: Extract<ValueGeneratorConfig, { type: 'pattern' }>): string => {
    const resolved = pattern.replace(PATTERN_TOKEN_REGEX, (_, token) => resolvePatternToken(token));
    return uppercase ? resolved.toUpperCase() : resolved;
};

const generateFromChoice = ({ options, uppercase }: Extract<ValueGeneratorConfig, { type: 'choice' }>): string => {
    if (!options || options.length === 0) {
        return '';
    }
    const choice = options[Math.floor(Math.random() * options.length)];
    return uppercase ? choice.toUpperCase() : choice;
};

const resolveGeneratorConfig = (generator: FormField['generateValue']): ValueGeneratorConfig | null => {
    if (!generator) {
        return null;
    }

    if (typeof generator === 'string') {
        return defaultGeneratorConfigs[generator] ?? null;
    }

    return generator;
};

const generateFieldValue = (generator: FormField['generateValue']): string => {
    const config = resolveGeneratorConfig(generator);
    if (!config) {
        return '';
    }

    if (config.type === 'pattern') {
        return generateFromPattern(config);
    }

    if (config.type === 'choice') {
        return generateFromChoice(config);
    }

    return '';
};

const buildDefaultValues = (
    fields: FormField[],
    parentPath: string[] = [],
    generatedValues: Record<string, any>
): Record<string, any> => {
    const defaults: Record<string, any> = {};

    for (const field of fields) {
        if (field.type === 'group' && field.fields) {
            const nextParentPath = field.name
                ? [...parentPath, ...splitFieldPath(field.name)]
                : parentPath;
            mergeDeep(defaults, buildDefaultValues(field.fields, nextParentPath, generatedValues));
            continue;
        }

        if (!field.name) {
            continue;
        }

        const currentPath = [...parentPath, ...splitFieldPath(field.name)];
        const pathKey = currentPath.join('.');

        if (field.type === 'input_group') {
            setValueAtPath(defaults, currentPath, field.defaultValue ?? []);
            continue;
        }

        if (field.type === 'textarea-with-preset') {
            const modifierInputs: Record<string, any[]> = {};
            (field.modifiers || []).forEach((mod: any) => {
                if (mod.inputGroup) {
                    modifierInputs[mod.name] = [];
                }
            });

            setValueAtPath(defaults, currentPath, {
                modifiers: (field.modifiers || []).reduce((acc, mod) => ({ ...acc, [mod.name]: true }), {}),
                modifierInputs,
                narrative: '',
                isPreset: true,
                userModified: false
            });
            continue;
        }

        if (field.type === 'modifier_itemgroup') {
            continue;
        }

        if (field.type === 'toggle' || field.type === 'better-switch') {
            let value = field.defaultValue === true;
            if (field.generateValue) {
                if (!generatedValues[pathKey]) {
                    generatedValues[pathKey] = generateFieldValue(field.generateValue);
                }
                value = generatedValues[pathKey];
            }
            setValueAtPath(defaults, currentPath, value);
        } else if (field.type === 'multi-select') {
            let value = field.defaultValue || [];
            if (field.generateValue) {
                if (!generatedValues[pathKey]) {
                    generatedValues[pathKey] = generateFieldValue(field.generateValue);
                }
                value = generatedValues[pathKey];
            }
            setValueAtPath(defaults, currentPath, value);
        } else {
            let value = field.defaultValue ?? '';
            if (field.generateValue) {
                if (!generatedValues[pathKey]) {
                    generatedValues[pathKey] = generateFieldValue(field.generateValue);
                }
                value = generatedValues[pathKey];
            }
            setValueAtPath(defaults, currentPath, value);
        }
    }

    return defaults;
};

const collectPrefillValuesFromFields = (
    fields: FormField[],
    data: Record<string, any>,
    parentPath: string[] = []
): Record<string, any> => {
    return fields.reduce((acc, field) => {
        const currentPath = field.name
            ? [...parentPath, ...splitFieldPath(field.name)]
            : parentPath;

        if (field.prefillKey && field.name) {
            const value = data[field.prefillKey];
            if (value !== undefined) {
                setValueAtPath(acc, currentPath, value);
            }
        }

        if (field.fields) {
            const nestedValues = collectPrefillValuesFromFields(field.fields, data, currentPath);
            mergeDeep(acc, nestedValues);
        }

        return acc;
    }, {} as Record<string, any>);
};

function PaperworkGeneratorFormComponent({ generatorConfig, generatorId, generatorType, groupId }: PaperworkGeneratorFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const generatedValuesRef = useRef<Record<string, any>>({});

    const defaultValues = useMemo(() => {
        generatedValuesRef.current = {};
        return buildDefaultValues(generatorConfig.form, [], generatedValuesRef.current);
    }, [generatorConfig.form]);

    const methods = useForm({
        criteriaMode: 'all',
        defaultValues
    });
    const { register, handleSubmit, control, watch, trigger, getValues, formState: { errors } } = methods;

    const isInvalid = useCallback((fieldName: string, required?: boolean) => {
        const fields = fieldName.split('.');
        let error: any = errors;
        for (const field of fields) {
            if (error && field in error) {
                error = (error as any)[field];
            } else {
                error = null;
                break;
            }
        }
        if (error) return true;
        if (required) {
            const value = getValues(fieldName);
            return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        }
        return false;
    }, [errors, getValues]);

    const officers = useOfficerStore(state => state.officers);
    const basicFormData = useBasicFormStore(state => state.formData);
    const advancedFormData = useAdvancedReportStore(state => state.formData);
    const generalData = basicFormData.general;

    const { report: arrestReport, penalCode: storedPenalCode, additions } = useChargeStore(state => ({
        report: state.report,
        penalCode: state.penalCode,
        additions: state.additions,
    }));

    const {
        setGeneratorData,
        setFormData,
        setLastFormValues,
        pendingRestore,
        clearPendingRestore,
        reset: resetPaperworkStore,
    } = usePaperworkStore();
    const { toast } = useToast();
    
    const [penalCode, setPenalCode] = useState<PenalCode | null>(null);
    const [locations, setLocations] = useState<{ districts: string[], streets: string[] }>({ districts: [], streets: [] });
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [vehiclesFetched, setVehiclesFetched] = useState(false);
    const [isFetchingVehicles, setIsFetchingVehicles] = useState(false);
    const [prefillApplied, setPrefillApplied] = useState(false);

    const prefillSource = searchParams.get('prefill');

    const totalImpoundDays = useMemo(() => {
        if (!storedPenalCode) return 0;
        return (arrestReport || []).reduce((total, row) => {
            if (!row.chargeId) return total;
            const chargeDetails = storedPenalCode[row.chargeId];
            if (!chargeDetails || !chargeDetails.impound) return total;
            const offenseKey = (row.offense || '1') as keyof typeof chargeDetails.impound;
            const baseImpound = chargeDetails.impound[offenseKey] ?? 0;
            if (!baseImpound) return total;
            const additionDetails = (additions || []).find(add => add.name === row.addition);
            const multiplier = additionDetails?.sentence_multiplier ?? 1;
            return total + baseImpound * multiplier;
        }, 0);
    }, [arrestReport, storedPenalCode, additions]);

    const cappedImpoundDays = useMemo(() => Math.min(totalImpoundDays, configData.MAX_IMPOUND_DAYS), [totalImpoundDays]);

    const chargeDescriptions = useMemo(() => {
        if (!storedPenalCode) return [] as string[];
        return (arrestReport || [])
            .map(row => {
                if (!row.chargeId) return null;
                const charge = storedPenalCode[row.chargeId];
                if (!charge) return null;
                let description = `${charge.id}. ${charge.charge}`;
                if (row.offense && row.offense !== '1') {
                    description += ` (Offense #${row.offense})`;
                }
                if (charge.drugs && row.category) {
                    description += ` (Category ${row.category})`;
                }
                return description;
            })
            .filter((value): value is string => Boolean(value));
    }, [arrestReport, storedPenalCode]);

    const computedPrefillData = useMemo(() => {
        if (prefillSource !== 'basic-arrest-report' && prefillSource !== 'advanced-arrest-report') {
            return null;
        }

        const suspectName = prefillSource === 'basic-arrest-report'
            ? basicFormData?.arrest?.suspectName?.trim() || ''
            : advancedFormData?.arrestee?.name?.trim() || '';

        const location = prefillSource === 'basic-arrest-report'
            ? basicFormData?.location || { district: '', street: '' }
            : {
                district: advancedFormData?.incident?.locationDistrict || '',
                street: advancedFormData?.incident?.locationStreet || '',
            };

        const durationValue = cappedImpoundDays > 0 ? Math.round(cappedImpoundDays).toString() : '';
        const chargesText = chargeDescriptions.length > 0
            ? chargeDescriptions.map(charge => `- ${charge}`).join('\n')
            : '';
        const driverName = suspectName || 'the suspect';
        const reasonText = chargesText
            ? `Vehicle was driven by ${driverName} and used in the commission of the following crimes: \n${chargesText}`
            : '';

        const payload: Record<string, any> = {
            vehicle_owner: suspectName,
            location: {
                district: location?.district || '',
                street: location?.street || '',
            },
        };

        if (durationValue) {
            payload.impound_duration = durationValue;
        }

        if (reasonText) {
            payload.impound_reason = reasonText;
        }

        return payload;
    }, [prefillSource, basicFormData, advancedFormData, cappedImpoundDays, chargeDescriptions]);

    const prefillValues = useMemo(() => {
        if (!computedPrefillData) return null;
        return collectPrefillValuesFromFields(generatorConfig.form, computedPrefillData);
    }, [computedPrefillData, generatorConfig.form]);

    useEffect(() => {
        setPrefillApplied(false);
    }, [generatorConfig.id, prefillSource]);

    useEffect(() => {
        if (prefillValues && Object.keys(prefillValues).length > 0 && !prefillApplied) {
            const mergedValues = JSON.parse(JSON.stringify(defaultValues));
            mergeDeep(mergedValues, normalizeFieldPaths(prefillValues));
            methods.reset(mergedValues, { keepDefaultValues: true });
            setPrefillApplied(true);
        }
    }, [prefillValues, defaultValues, methods, prefillApplied]);

    const modifierInputGroupLookup = useMemo(() => {
        const map: Record<string, { textareaName: string; groupConfig: any }> = {};
        generatorConfig.form.forEach(f => {
            if (f.type === 'textarea-with-preset' && f.name) {
                (f.modifiers || []).forEach(mod => {
                    if (mod.inputGroup) {
                        map[mod.name] = { textareaName: f.name, groupConfig: mod.inputGroup };
                    }
                });
            }
        });
        return map;
    }, [generatorConfig.form]);

    const externalModifierGroupNames = useMemo(() => {
        return generatorConfig.form
            .filter(f => f.type === 'modifier_itemgroup')
            .map(f => f.name);
    }, [generatorConfig.form]);

    useEffect(() => {
        resetPaperworkStore();
    }, [generatorConfig.id, resetPaperworkStore]);

    useEffect(() => {
        setGeneratorData({
            generatorId,
            generatorType,
            groupId: groupId || null,
        });
    }, [setGeneratorData, generatorId, generatorType, groupId]);

    useEffect(() => {
        if (!pendingRestore) {
            return;
        }

        const matchesGenerator =
            pendingRestore.generatorId === generatorId &&
            pendingRestore.generatorType === generatorType &&
            (pendingRestore.groupId || null) === (groupId || null);

        if (!matchesGenerator) {
            return;
        }

        const mergedValues = JSON.parse(JSON.stringify(defaultValues));
        mergeDeep(mergedValues, normalizeFieldPaths(pendingRestore.fields));
        methods.reset(mergedValues, { keepDefaultValues: true });
        setPrefillApplied(true);
        clearPendingRestore();
    }, [pendingRestore, generatorId, generatorType, groupId, defaultValues, methods, clearPendingRestore, setPrefillApplied]);

    useEffect(() => {
        const hasChargeField = generatorConfig.form.some(field => field.type === 'charge' || field.fields?.some(f => f.type === 'charge'));
        const hasLocationFields = generatorConfig.form.some(field => field.type === 'location' || field.optionsSource === 'districts' || field.optionsSource === 'streets');
        
        if (hasChargeField && !penalCode) {
            fetch(getGtawDataUrl('gtaw_penal_code.json'))
                .then((res) => res.json())
                .then((data) => setPenalCode(data));
        }
        if (hasLocationFields && locations.districts.length === 0) {
            fetch(getGtawDataUrl('gtaw_locations.json'))
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
        fetch(getGtawDataUrl('gtaw_vehicles.json'))
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


    type RenderFieldOptions = {
        parentType?: 'group' | 'input_group';
    };
    type RenderFieldFn = (
        field: FormField,
        path: string,
        index?: number,
        options?: RenderFieldOptions
    ) => ReactNode;

    const renderField: RenderFieldFn = (
        field,
        path,
        index,
        options = {},
    ) => {
        const { parentType } = options;
        const fieldKey = `${path}-${index}`;
        if (field.stipulations && field.stipulations.length > 0) {
            const results = field.stipulations.map(stip => {
                const watchedValue = watch(stip.field);
                return String(watchedValue) === String(stip.value);
            });
            const mode = field.stipulationMode ?? 'all';
            const shouldRender = mode === 'any' ? results.some(Boolean) : results.every(Boolean);
            if (!shouldRender) {
                return null;
            }
        } else if (field.stipulation) {
            const watchedValue = watch(field.stipulation.field);
            if (String(watchedValue) !== String(field.stipulation.value)) {
                return null;
            }
        }
        switch (field.type) {
            case 'hidden': {
                const pathSegments = splitFieldPath(path);
                const pathKey = pathSegments.join('.');
                let hiddenValue = field.value ?? '';
                if (field.generateValue) {
                    if (!generatedValuesRef.current[pathKey]) {
                        generatedValuesRef.current[pathKey] = generateFieldValue(field.generateValue);
                    }
                    hiddenValue = generatedValuesRef.current[pathKey];
                }
                return <input key={fieldKey} type="hidden" {...register(path)} defaultValue={hiddenValue} />;
            }

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
                return <OfficerSection key={fieldKey} isArrestReport={false} isMultiOfficer={field.multi} showDivDetail={field.showDivDetail} showBadgeNumber={field.showBadgeNumber} />;

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
                        <Input
                            id={path}
                            {...register(path, {
                                required: field.required,
                                onBlur: () => field.required && trigger(path)
                            })}
                            placeholder={field.placeholder}
                            defaultValue={field.defaultValue}
                            className={cn(
                                isInvalid(path, field.required) &&
                                'border-red-500 focus-visible:ring-red-500'
                            )}
                        />
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
                                        isInvalid={isInvalid(path, field.required)}
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
                        <Textarea
                            id={path}
                            {...register(path, {
                                required: field.required,
                                onBlur: () => field.required && trigger(path)
                            })}
                            placeholder={field.placeholder}
                            className={cn(
                                'min-h-[120px]',
                                isInvalid(path, field.required) &&
                                    'border-red-500 focus-visible:ring-red-500'
                            )}
                        />
                    </div>
                );

            case 'textarea-with-preset':
                const isPresetActive = watch(`${path}.isPreset`);
                const isUserModified = watch(`${path}.userModified`);

                register(`${path}.narrative`, {
                    required: field.required,
                    onBlur: () => field.required && trigger(`${path}.narrative`)
                });

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

                    registerHelpers();

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

                const externalGroupsForField = externalModifierGroupNames.filter(name =>
                    modifierInputGroupLookup[name]?.textareaName === field.name
                );

                return (
                    <TextareaWithPreset
                        key={fieldKey}
                        label={field.label || 'Narrative'}
                        placeholder={field.placeholder}
                        basePath={path}
                        control={control}
                        modifiers={field.modifiers || []}
                        isInvalid={isInvalid(`${path}.narrative`, field.required)}
                        noLocalStorage={field.noLocalStorage}
                        presetValue={narrativeText}
                        externalInputGroupNames={externalGroupsForField}
                    />
                );

            case 'modifier_itemgroup':
                const lookup = modifierInputGroupLookup[field.name];
                if (!lookup) return null;
                const enabled = watch(`${lookup.textareaName}.modifiers.${field.name}`);
                if (!enabled) return null;
                return (
                    <ModifierInputGroup
                        key={fieldKey}
                        basePath={`${lookup.textareaName}.modifierInputs.${field.name}`}
                        groupConfig={lookup.groupConfig}
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
                                    <SelectTrigger id={path} className={cn(isInvalid(path, field.required) && 'border-red-500 focus-visible:ring-red-500')}>
                                        <SelectValue placeholder={field.placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((option) => {
                                            if (typeof option === 'string') {
                                                return <SelectItem key={option} value={option}>{option}</SelectItem>;
                                            }
                                            if (typeof option === 'object' && option.label && option.value) {
                                                return <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>;
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
                                    className={cn(isInvalid(path, field.required) && 'border-red-500 focus-visible:ring-red-500')}
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
                            render={({ field: controllerField }) => (
                                <>
                                    <Switch
                                        id={path}
                                        checked={controllerField.value}
                                        onCheckedChange={value => {
                                            controllerField.onChange(value);
                                            trigger();
                                        }}
                                    />
                                    <Label htmlFor={path}>
                                        {controllerField.value
                                            ? (field.dataOn ?? field.label)
                                            : (field.dataOff ?? field.label)}
                                    </Label>
                                </>
                            )}
                        />
                    </div>
                );

            case 'better-switch': {
                const limitToOneColumn = !parentType;
                return (
                    <div
                        key={fieldKey}
                        className={cn(
                            'flex flex-col space-y-2 pt-2',
                            limitToOneColumn && 'md:max-w-[calc(100%/3)]'
                        )}
                    >
                        <Label>{field.label}</Label>
                        <Controller
                            name={path}
                            control={control}
                            defaultValue={field.defaultValue === true}
                            render={({ field: { onChange, value } }) => (
                                <BetterSwitch
                                    checked={value}
                                    onCheckedChange={onChange}
                                    textOn={field.dataOn ?? field.label}
                                    textOff={field.dataOff ?? field.label}
                                    className={cn(
                                        limitToOneColumn && 'md:max-w-[calc(100%/3)] md:w-full'
                                    )}
                                />
                            )}
                        />
                    </div>
                );
            }

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
                            copyCharge: field.copyable_charge,
                        }}
                    />
                )
            case 'group':
                return (
                    <div key={fieldKey} className="flex flex-col md:flex-row items-end gap-4 w-full">
                        {field.fields?.map((subField, subIndex) => {
                            const subFieldPath = subField.name;
                            return (
                                <div key={`${subField.name}-${subIndex}`} className="w-full">
                                    {renderField(subField, subFieldPath, subIndex, { parentType: 'group' })}
                                </div>
                            );
                        })}
                    </div>
                );

            case 'input_group':
                return <MultiInputGroup key={fieldKey} fieldConfig={field} renderField={renderField} />;

            default:
                return null;
        }
    };

    const MultiInputGroup = ({ fieldConfig, renderField }: { fieldConfig: FormField, renderField: RenderFieldFn }) => {
        const { fields, append, remove } = useFieldArray({
            control,
            name: fieldConfig.name
        });

        useEffect(() => {
            if (fieldConfig.required) {
                register(fieldConfig.name as any, {
                    validate: (value) => (value && value.length > 0) || 'At least one entry is required'
                });
                trigger(fieldConfig.name as any);
            }
        }, [fieldConfig.name, fieldConfig.required, register, trigger]);

        useEffect(() => {
            if (fieldConfig.required) {
                trigger(fieldConfig.name as any);
            }
        }, [fields, fieldConfig.name, fieldConfig.required, trigger]);

        const groupInvalid = isInvalid(fieldConfig.name, fieldConfig.required);

        if (fieldConfig.fields?.some(f => f.type === 'textarea-with-preset')) {
            console.error('textarea-with-preset is not supported inside input_group');
            return (
                <Card className={cn(groupInvalid && 'border-red-500')}>
                    <CardHeader>
                        <CardTitle>{fieldConfig.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">textarea-with-preset cannot be used inside an input group.</p>
                    </CardContent>
                </Card>
            );
        }

        const buildDefaults = (fields: FormField[]): Record<string, any> => {
            return buildDefaultValues(fields, [], generatedValuesRef.current);
        };

        return (
            <Card className={cn(groupInvalid && 'border-red-500')}>
                <CardHeader>
                    <CardTitle>{fieldConfig.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-2 p-4 border rounded-lg">
                            <div className="flex-1 space-y-4">
                                {fieldConfig.fields?.map((subField, subIndex) => {
                                    if (subField.type === 'group') {
                                        return (
                                            <div key={`${subField.name}-${subIndex}`} className="flex flex-col md:flex-row items-end gap-4 w-full">
                                                {subField.fields?.map((innerField, innerIndex) => (
                                                    <div key={`${innerField.name}-${innerIndex}`} className="w-full">
                                                        {renderField(
                                                            innerField,
                                                            `${fieldConfig.name}.${index}.${innerField.name}`,
                                                            innerIndex,
                                                            { parentType: 'group' }
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return renderField(
                                        subField,
                                        `${fieldConfig.name}.${index}.${subField.name}`,
                                        subIndex,
                                        { parentType: 'input_group' }
                                    );
                                })}
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append(buildDefaults(fieldConfig.fields || []))}>
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

        const processErrors = (errorNode: any, path: string = '', visited: WeakSet<object> = new WeakSet()) => {
            if (!errorNode || typeof errorNode !== 'object' || visited.has(errorNode)) return;
            if (errorNode instanceof Element) return;
            visited.add(errorNode);

            for (const key in errorNode) {
                if (key === 'ref') continue;
                const newPath = path ? `${path}.${key}` : key;
                const childNode = (errorNode as any)[key];
                if (!childNode) continue;

                if ((childNode as any).type && (childNode as any).message) {
                    const label = findFieldLabel(newPath, generatorConfig.form) || newPath.replace(/_/g, ' ');
                    errorMessages.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${(childNode as any).message || 'This field is required.'}`);
                } else if (Array.isArray(childNode)) {
                    childNode.forEach((item, index) => {
                        processErrors(item, `${newPath}.${index}`, visited);
                    });
                } else if (typeof childNode === 'object') {
                    processErrors(childNode, newPath, visited);
                }
            }
        };

        processErrors(errors as any);
    
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
        
        // Deep clone to ensure we don't mutate state refs unexpectedly
        const processedData = JSON.parse(JSON.stringify(data));

        // Recursive function to process fields, including nested groups
        const processFields = (fields: FormField[]) => {
            fields.forEach(field => {
                // 1. Recurse if the field acts as a container (groups, input_groups, etc.)
                if (field.fields) {
                    processFields(field.fields);
                }

                // 2. Process Separator Logic
                if (field.type === 'textarea' && (field as any).separator && field.name) {
                    const pathSegments = splitFieldPath(field.name);
                    const rawValue = getValueAtPath(processedData, pathSegments);

                    if (typeof rawValue === 'string') {
                        // Split by newline and filter out empty lines
                        const splitArray = rawValue
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line !== '');

                        // If the list is empty (user typed nothing or just enters), 
                        // you might want to leave it as null/undefined or an empty array 
                        // depending on how your Handlebars template handles {{#if}} vs {{#each}}
                        const finalValue = splitArray.length > 0 ? splitArray : null;

                        setValueAtPath(processedData, pathSegments, finalValue);
                    }
                }
            });
        };

        // Trigger the recursive processing
        processFields(generatorConfig.form);

        const fullData = {
            ...processedData,
            officers,
            general,
            penalCode,
        };

        const type = searchParams.get('type') as 'static' | 'user';
        const groupIdFromParams = searchParams.get('group_id');

        setGeneratorData({
            generatorId: generatorConfig.id,
            generatorType: type,
            groupId: groupIdFromParams
        });

        setLastFormValues(data); // Save the original raw input for restoring the form later
        setFormData(fullData);   // Save the processed array data for the generator
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
