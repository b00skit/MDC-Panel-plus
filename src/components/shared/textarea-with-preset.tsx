
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export type Modifier = {
    name: string;
    label: string;
    text?: string;
    requires?: string[];
};

interface TextareaWithPresetProps {
    label: string;
    placeholder?: string;
    description?: React.ReactNode;
    basePath: string;
    control: Control<any>;
    modifiers: Modifier[];
    isInvalid: boolean;
    noLocalStorage?: boolean;
    presetValue: string;
    onTextChange?: (value: string) => void;
    onUserModifiedChange?: (value: boolean) => void;
    onModifierChange?: (name: string, value: boolean) => void;
    onPresetChange?: (value: boolean) => void;
}

export function TextareaWithPreset({
    label,
    placeholder,
    description,
    basePath,
    control,
    modifiers,
    isInvalid,
    noLocalStorage = false,
    presetValue,
    onTextChange,
    onUserModifiedChange,
    onModifierChange,
    onPresetChange,
}: TextareaWithPresetProps) {
    const { watch, setValue, getValues, trigger } = useFormContext();
    const [localValue, setLocalValue] = useState(getValues(`${basePath}.narrative`) || '');
    const isInitialMount = useRef(true);
    const previousPreset = useRef(presetValue);

    const isPresetEnabled = watch(`${basePath}.isPreset`);
    const isUserModified = watch(`${basePath}.userModified`);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            previousPreset.current = presetValue;
            return;
        }
        if (isPresetEnabled && !isUserModified && presetValue !== previousPreset.current) {
            setLocalValue(presetValue);
            setValue(`${basePath}.narrative`, presetValue, { shouldDirty: true });
            onTextChange?.(presetValue);
            previousPreset.current = presetValue;
        }
    }, [presetValue, isPresetEnabled, isUserModified, setValue, onTextChange]);


    const handleTogglePreset = (checked: boolean) => {
        const newValue = Boolean(checked);
        setValue(`${basePath}.isPreset`, newValue, { shouldDirty: true });
        onPresetChange?.(newValue);
        if (!newValue && !isUserModified) {
            setLocalValue('');
            setValue(`${basePath}.narrative`, '', { shouldDirty: true });
            onTextChange?.('');
        }
    };
    
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (newValue && !isUserModified) {
            setValue(`${basePath}.userModified`, true, { shouldDirty: true });
            onUserModifiedChange?.(true);
        } else if (!newValue && isUserModified) {
            setValue(`${basePath}.userModified`, false, { shouldDirty: true });
            onUserModifiedChange?.(false);
        }

        onTextChange?.(newValue);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setValue(`${basePath}.narrative`, e.target.value, { shouldDirty: true });
        trigger(`${basePath}.narrative`);
    }

    
    const CheckboxWithLabel = (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`preset-${basePath}`}
                checked={isPresetEnabled}
                onCheckedChange={handleTogglePreset}
                disabled={isUserModified}
            />
            <Label htmlFor={`preset-${basePath}`} className="text-sm font-medium">Enable Preset?</Label>
        </div>
    );

    return (
        <div className="space-y-2 border rounded-md p-4">
             <div className="flex justify-between items-center mb-2">
                <Label htmlFor={basePath} className="text-base font-semibold">{label}</Label>
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
                            name={`${basePath}.modifiers.${mod.name}`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id={`${basePath}-${mod.name}`}
                                    checked={field.value}
                                    onCheckedChange={(value) => {
                                        field.onChange(value);
                                        onModifierChange?.(mod.name, Boolean(value));
                                    }}
                                    disabled={isUserModified}
                                />
                            )}
                        />
                         <Label htmlFor={`${basePath}-${mod.name}`}>{mod.label}</Label>
                     </div>
                ))}
            </div>
            <Textarea
                value={localValue}
                id={`${basePath}.narrative`}
                placeholder={placeholder}
                className={cn('min-h-[150px]', isInvalid && 'border-red-500 focus-visible:ring-red-500')}
                onChange={handleTextareaChange}
                onBlur={handleBlur}
            />
            {description && <p className="text-xs text-muted-foreground pt-2">{description}</p>}
        </div>
    );
}
