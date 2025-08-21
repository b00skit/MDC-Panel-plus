
'use client';
import React, { useEffect } from 'react';
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
    value: string;
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
    value,
}: TextareaWithPresetProps) {
    const { watch, setValue } = useFormContext();

    const isPresetEnabled = watch(`${basePath}.isPreset`);
    const isUserModified = watch(`${basePath}.userModified`);

    useEffect(() => {
        if (isPresetEnabled && !isUserModified) {
            setValue(`${basePath}.narrative`, value);
        }
    }, [value, isPresetEnabled, isUserModified, basePath, setValue]);
    
    const handleTogglePreset = () => {
        const newValue = !isPresetEnabled;
        setValue(`${basePath}.isPreset`, newValue);
        if (!newValue && !isUserModified) {
            setValue(`${basePath}.narrative`, '');
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(`${basePath}.narrative`, newValue);

        if (newValue) {
            setValue(`${basePath}.userModified`, true);
        } else {
            setValue(`${basePath}.userModified`, false);
        }
    };
    
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
                value={value}
                id={`${basePath}.narrative`}
                placeholder={placeholder}
                className={cn('min-h-[150px]', isInvalid && 'border-red-500 focus-visible:ring-red-500')}
                onChange={handleTextareaChange}
                onBlur={(e) => setValue(`${basePath}.narrative`, e.target.value)}
            />
            {description && <p className="text-xs text-muted-foreground pt-2">{description}</p>}
        </div>
    );
}
