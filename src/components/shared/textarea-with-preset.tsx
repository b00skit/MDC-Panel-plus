
'use client';
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import Handlebars from 'handlebars';

export type Modifier = {
    name: string;
    label: string;
    generateText: string | (() => string);
};

interface TextareaWithPresetProps {
    label: string;
    placeholder?: string;
    description?: React.ReactNode;
    presetName: string;
    control: Control<any>;
    modifiers: Modifier[];
    isInvalid: boolean;
    noLocalStorage?: boolean;
}

export function TextareaWithPreset({
    label,
    placeholder,
    description,
    presetName,
    control,
    modifiers,
    isInvalid,
    noLocalStorage = false,
}: TextareaWithPresetProps) {
    const { watch, setValue, getValues } = useFormContext();
    const [localState, setLocalState] = useState(() => {
        if (noLocalStorage || typeof window === 'undefined') {
            const initialModifiersState = modifiers.reduce((acc, mod) => ({...acc, [mod.name]: true }), {});
            return {
                presets: { [presetName]: true },
                userModified: { [presetName]: false },
                modifiers: initialModifiersState,
                narrative: { [presetName]: '' }
            }
        }

        const saved = localStorage.getItem(`textarea-preset-${presetName}`);
        if(saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse textarea preset from localStorage", e);
            }
        }
         const initialModifiersState = modifiers.reduce((acc, mod) => ({...acc, [mod.name]: true }), {});
        return {
            presets: { [presetName]: true },
            userModified: { [presetName]: false },
            modifiers: initialModifiersState,
            narrative: { [presetName]: '' }
        };
    });

    const isPresetEnabled = watch(`presets.${presetName}`);
    const isUserModified = watch(`userModified.${presetName}`);
    const modifierValues = watch('modifiers');
    const formValues = watch();

    const generatePresetText = useCallback(() => {
        let text = '';
        const data = getValues();
        
        modifiers.forEach(mod => {
            if (getValues(`modifiers.${mod.name}`)) {
                try {
                    const textOrFn = mod.generateText;
                    const templateString = typeof textOrFn === 'function' ? textOrFn() : textOrFn;
                    
                    const template = Handlebars.compile(templateString, { noEscape: true });
                    text += template(data) + '\n\n';
                } catch (e) {
                    console.error(`Error compiling Handlebars template for modifier ${mod.name}`, e);
                    text += `[Error in modifier: ${mod.name}]\n\n`;
                }
            }
        });
        return text.trim();
    }, [modifiers, getValues]);

    useEffect(() => {
        const initialModifiersState = modifiers.reduce((acc, mod) => {
            const existingValue = localState.modifiers[mod.name];
            return {...acc, [mod.name]: existingValue !== false };
        }, {});

        setValue(`presets.${presetName}`, localState.presets[presetName] !== false);
        setValue(`userModified.${presetName}`, localState.userModified[presetName] === true);
        setValue(`modifiers`, initialModifiersState);
        if(!localState.userModified[presetName]){
            setValue(`narrative.${presetName}`, '');
        } else {
            setValue(`narrative.${presetName}`, localState.narrative[presetName] || '');
        }
    }, [presetName, setValue, modifiers, localState]);


    useEffect(() => {
        if (isPresetEnabled && !isUserModified) {
            setValue(`narrative.${presetName}`, generatePresetText());
        }
    }, [isPresetEnabled, isUserModified, modifierValues, presetName, setValue, generatePresetText, formValues]);

    const updateLocalState = (key: keyof typeof localState, field: string, value: any) => {
        if (noLocalStorage) return;
        
        setLocalState(prevState => {
            const newState = {
                ...prevState,
                [key]: {
                    ...prevState[key],
                    [field]: value
                }
            };
            localStorage.setItem(`textarea-preset-${presetName}`, JSON.stringify(newState));
            return newState;
        });
    }

    const handleTogglePreset = () => {
        const newValue = !isPresetEnabled;
        setValue(`presets.${presetName}`, newValue);
        updateLocalState('presets', presetName, newValue);

        if (!newValue && !isUserModified) {
            setValue(`narrative.${presetName}`, '');
            updateLocalState('narrative', presetName, '');
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValue(`narrative.${presetName}`, value);

        if (value) {
            setValue(`userModified.${presetName}`, true);
            updateLocalState('userModified', presetName, true);
        } else {
            setValue(`userModified.${presetName}`, false);
            updateLocalState('userModified', presetName, false);
        }
         updateLocalState('narrative', presetName, value);
    };
    
    const handleModifierChange = (modifierName: string, checked: boolean) => {
        setValue(`modifiers.${modifierName}`, checked);
        updateLocalState('modifiers', modifierName, checked);
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
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        handleModifierChange(mod.name, !!checked);
                                    }}
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
                        onChange={(e) => {
                            field.onChange(e);
                            handleTextareaChange(e);
                        }}
                    />
                )}
            />
            {description && <p className="text-xs text-muted-foreground pt-2">{description}</p>}
        </div>
    );
}
