
'use client';
import React, { useEffect } from 'react';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBasicReportModifiersStore, Modifier } from '@/stores/basic-report-modifiers-store';
import { Separator } from '../ui/separator';

interface TextareaWithPresetProps {
    label: string;
    placeholder?: string;
    description?: React.ReactNode;
    presetName: string;
    control: Control<any>;
    modifiers: Modifier[];
    isInvalid: boolean;
}

export function TextareaWithPreset({
    label,
    placeholder,
    description,
    presetName,
    control,
    modifiers,
    isInvalid
}: TextareaWithPresetProps) {
    const { watch, setValue, getValues } = useFormContext();
    const { setPreset, setUserModified, setNarrativeField, setModifier } = useBasicReportModifiersStore();

    const isPresetEnabled = watch(`presets.${presetName}`);
    const isUserModified = watch(`userModified.${presetName}`);
    const modifierValues = watch('modifiers');

    useEffect(() => {
        if (isPresetEnabled && !isUserModified) {
            let text = '';
            modifiers.forEach(mod => {
                if (modifierValues[mod.name]) {
                    text += mod.generateText();
                }
            });
            setValue(`narrative.${presetName}`, text);
        }
    }, [modifierValues, isPresetEnabled, isUserModified, modifiers, presetName, setValue]);


    const handleTogglePreset = () => {
        const newValue = !isPresetEnabled;
        setValue(`presets.${presetName}`, newValue);
        setPreset(presetName, newValue);

        if (!newValue && !isUserModified) {
            setValue(`narrative.${presetName}`, '');
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValue(`narrative.${presetName}`, value);

        if (value) {
            setValue(`userModified.${presetName}`, true);
            setUserModified(presetName, true);
            setNarrativeField(presetName, value);
        } else {
            setValue(`userModified.${presetName}`, false);
            setUserModified(presetName, false);
            setNarrativeField(presetName, '');
        }
    };
    
    const handleModifierChange = (modifierName: string, checked: boolean) => {
        setValue(`modifiers.${modifierName}`, checked);
        setModifier(modifierName, checked);
    };

    const CheckboxWithLabel = (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`preset-${presetName}`}
                checked={isPresetEnabled}
                onCheckedChange={handleTogglePreset}
                disabled={isUserModified}
            />
            <Label htmlFor={`preset-${presetName}`} className="text-sm font-medium">Enable Preset?</Label>
        </div>
    );

    return (
        <div className="space-y-2 border rounded-md p-4">
             <div className="flex justify-between items-center mb-2">
                <Label htmlFor={presetName} className="text-base font-semibold">{label}</Label>
                {isUserModified ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>{CheckboxWithLabel}</TooltipTrigger>
                            <TooltipContent>
                                <p>Clear the textarea to re-enable presets.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    CheckboxWithLabel
                )}
            </div>

            <Separator />
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 py-2">
                {modifiers.map(mod => (
                     <div key={mod.name} className="flex items-center space-x-2">
                        <Controller
                            name={`modifiers.${mod.name}`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id={mod.name}
                                    checked={field.value}
                                    onCheckedChange={(checked) => handleModifierChange(mod.name, !!checked)}
                                />
                            )}
                        />
                         <Label htmlFor={mod.name}>{mod.label}</Label>
                     </div>
                ))}
            </div>

            <Controller
                name={`narrative.${presetName}`}
                control={control}
                render={({ field }) => (
                    <Textarea
                        {...field}
                        id={presetName}
                        placeholder={placeholder}
                        className={cn('min-h-[150px]', isInvalid && 'border-red-500 focus-visible:ring-red-500')}
                        onChange={handleTextareaChange}
                    />
                )}
            />
            {description && <p className="text-xs text-muted-foreground pt-2">{description}</p>}
        </div>
    );
}
