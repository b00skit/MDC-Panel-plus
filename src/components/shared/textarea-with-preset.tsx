
'use client';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBasicReportModifiersStore } from '@/stores/basic-report-modifiers-store';

interface TextareaWithPresetProps {
    label: string;
    placeholder?: string;
    description?: React.ReactNode;
    presetName: 'narrative';
    control: Control<any>;
    isInvalid: boolean;
}

export function TextareaWithPreset({
    label,
    placeholder,
    description,
    presetName,
    control,
    isInvalid
}: TextareaWithPresetProps) {
    const { watch, setValue } = useFormContext();
    const { setPreset, setUserModified, setNarrativeField } = useBasicReportModifiersStore();

    const isPresetEnabled = watch(`presets.${presetName}`);
    const isUserModified = watch(`userModified.${presetName}`);
    const narrativeValue = watch(`narrative.${presetName}`);

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
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={presetName}>{label}</Label>
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
                        value={narrativeValue || ''}
                    />
                )}
            />
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
    );
}
