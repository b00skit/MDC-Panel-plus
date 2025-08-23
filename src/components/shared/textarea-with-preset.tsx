
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
    onTextChange: (newValue: string) => void;
    onUserModifiedChange?: (newValue: boolean) => void;
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
}: TextareaWithPresetProps) {
    const { watch, setValue, getValues } = useFormContext();
    const [localValue, setLocalValue] = useState('');
    const isInitialMount = useRef(true);

    const isPresetEnabled = watch(`${basePath}.isPreset`);
    const isUserModified = watch(`${basePath}.userModified`);
    
    useEffect(() => {
        // On initial mount, set the value from the form store.
        if (isInitialMount.current) {
            setLocalValue(getValues('arrest.narrative') || '');
            isInitialMount.current = false;
        }
    }, [getValues]);


    useEffect(() => {
        // This effect runs ONLY when the preset-related props change.
        // It updates the local state if presets are active and not user-modified.
        if (isPresetEnabled && !isUserModified) {
            setLocalValue(presetValue);
        }
    }, [presetValue, isPresetEnabled, isUserModified]);
    
    const handleTogglePreset = () => {
        const newValue = !isPresetEnabled;
        setValue(`${basePath}.isPreset`, newValue);
        if (!newValue && !isUserModified) {
            setLocalValue('');
            onTextChange('');
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue); // Update local state immediately for responsiveness.

        if (newValue && !isUserModified) {
            setValue(`${basePath}.userModified`, true);
            onUserModifiedChange?.(true);
        } else if (!newValue && isUserModified) {
            setValue(`${basePath}.userModified`, false);
            onUserModifiedChange?.(false);
        }
    };

    const handleBlur = () => {
        // Update the central store only when the user is done editing.
        onTextChange(localValue);
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
                                    onCheckedChange={field.onChange}
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
