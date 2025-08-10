
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePaperworkBuilderStore, Field, ConditionalVariable } from '@/stores/paperwork-builder-store';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

const fieldTypes: { type: Field['type']; label: string; default: Partial<Field> }[] = [
    { type: 'section', label: 'Section Header', default: { type: 'section', title: 'New Section' } },
    { type: 'text', label: 'Text Input', default: { type: 'text', name: 'new_text', label: 'New Text Input', placeholder: 'Enter value' } },
    { type: 'textarea', label: 'Text Area', default: { type: 'textarea', name: 'new_textarea', label: 'New Text Area', placeholder: 'Enter long text' } },
    { type: 'dropdown', label: 'Dropdown', default: { type: 'dropdown', name: 'new_dropdown', label: 'New Dropdown', options: ['Option 1', 'Option 2'] } },
    { type: 'datalist', label: 'Datalist Input', default: { type: 'datalist', name: 'new_datalist', label: 'New Datalist', options: ['Suggestion 1', 'Suggestion 2'] } },
    { type: 'toggle', label: 'Toggle Switch', default: { type: 'toggle', name: 'new_toggle', label: 'New Toggle', dataOn: 'On', dataOff: 'Off', defaultValue: false } },
    { type: 'group', label: 'Field Group (Inline)', default: { type: 'group', fields: [] } },
    { type: 'charge', label: 'Charge Selector', default: { type: 'charge', name: 'charges', showClass: true, customFields: [] } },
    { type: 'general', label: 'General Section', default: { type: 'general', name: 'general' } },
    { type: 'officer', label: 'Officer Section', default: { type: 'officer', name: 'officers' } },
];

const subFieldTypes: { type: Field['type']; label: string; default: Partial<Field> }[] = [
    { type: 'text', label: 'Text Input', default: { type: 'text', name: 'new_text', label: 'New Text Input', placeholder: 'Enter value' } },
    { type: 'toggle', label: 'Toggle Switch', default: { type: 'toggle', name: 'new_toggle', label: 'New Toggle', dataOn: 'On', dataOff: 'Off' } },
    { type: 'dropdown', label: 'Dropdown', default: { type: 'dropdown', name: 'new_dropdown', label: 'New Dropdown', options: ['Option 1', 'Option 2'] } },
];


function SubFieldEditor({ field, fieldPath, onRemove, register }: { field: Field; fieldPath: string; onRemove: () => void; register: any }) {
    return (
        <div className="flex-1 p-2 border rounded-md bg-muted/50 space-y-2">
            <div className="flex justify-between items-center">
                <p className="text-xs font-semibold uppercase">{field.type} FIELD</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
            {field.type === 'text' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input {...register(`${fieldPath}.name`)} placeholder="Field Name" />
                    <Input {...register(`${fieldPath}.label`)} placeholder="Label" />
                    <Input {...register(`${fieldPath}.placeholder`)} placeholder="Placeholder" />
                </div>
            )}
             {field.type === 'toggle' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Input {...register(`${fieldPath}.name`)} placeholder="Field Name" />
                    <Input {...register(`${fieldPath}.label`)} placeholder="Label" />
                    <Input {...register(`${fieldPath}.dataOn`)} placeholder="Text for ON" />
                    <Input {...register(`${fieldPath}.dataOff`)} placeholder="Text for OFF" />
                </div>
            )}
        </div>
    );
}

function FieldEditor({ field, index, onRemove, register, control, watch }: any) {
    const { fields: subFields, append: appendSubField, remove: removeSubField } = useFieldArray({
        control,
        name: `form.${index}.fields`
    });

    const renderFieldInputs = () => {
        const canBeRequired = ['text', 'textarea', 'dropdown', 'datalist'].includes(field.type);
        return (
            <>
                <div className="space-y-2">
                    {field.type === 'section' && <Input {...register(`form.${index}.title`)} placeholder="Section Title" />}
                    
                    {['text', 'textarea'].includes(field.type) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input {...register(`form.${index}.name`)} placeholder="Field Name (e.g. suspect_name)" />
                            <Input {...register(`form.${index}.label`)} placeholder="Label (e.g. Suspect Name)" />
                            <Input {...register(`form.${index}.placeholder`)} placeholder="Placeholder Text" />
                        </div>
                    )}
                    
                    {['dropdown', 'datalist'].includes(field.type) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input {...register(`form.${index}.name`)} placeholder="Field Name" />
                            <Input {...register(`form.${index}.label`)} placeholder="Label" />
                            <Controller
                                name={`form.${index}.options`}
                                control={control}
                                render={({ field }) => (
                                    <Input 
                                        {...field}
                                        placeholder="Options (comma-separated)"
                                        value={Array.isArray(field.value) ? field.value.join(',') : field.value || ''}
                                        onChange={e => field.onChange(e.target.value.split(','))}
                                    />
                                )}
                            />
                        </div>
                    )}
                    
                    {field.type === 'toggle' && (
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <Input {...register(`form.${index}.name`)} placeholder="Field Name" />
                            <Input {...register(`form.${index}.label`)} placeholder="Label" />
                            <Input {...register(`form.${index}.dataOn`)} placeholder="Text for ON state" />
                            <Input {...register(`form.${index}.dataOff`)} placeholder="Text for OFF state" />
                        </div>
                    )}

                     {field.type === 'charge' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                             <Input {...register(`form.${index}.name`)} placeholder="Field Name (e.g. citations)" />
                             <div className="flex items-center space-x-2">
                                <Checkbox id={`show-class-${index}`} {...register(`form.${index}.showClass`)} />
                                <Label htmlFor={`show-class-${index}`}>Show Class</Label>
                             </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`show-offense-${index}`} {...register(`form.${index}.showOffense`)} />
                                <Label htmlFor={`show-offense-${index}`}>Show Offense</Label>
                             </div>
                        </div>
                    )}

                     {field.type === 'group' && (
                        <div className="space-y-2 p-2 border-l-2">
                             {subFields.map((subField, subIndex) => (
                                 <SubFieldEditor
                                     key={subField.id}
                                     field={subField}
                                     fieldPath={`form.${index}.fields.${subIndex}`}
                                     onRemove={() => removeSubField(subIndex)}
                                     register={register}
                                 />
                             ))}
                             <div className="flex flex-wrap gap-2 pt-2">
                                {subFieldTypes.map(sft => (
                                    <Button key={sft.type} type="button" variant="outline" size="sm" onClick={() => appendSubField(sft.default)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add {sft.label}
                                    </Button>
                                ))}
                             </div>
                        </div>
                     )}

                    {(field.type === 'general' || field.type === 'officer') && <p className="text-muted-foreground text-sm">This field has no configuration.</p>}
                </div>
                <div className="flex items-center gap-4 pt-2">
                     {canBeRequired && (
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`required-${index}`} {...register(`form.${index}.required`)} />
                            <Label htmlFor={`required-${index}`}>Required?</Label>
                        </div>
                     )}
                     {field.type === 'toggle' && (
                        <div className="flex items-center space-x-2">
                            <Checkbox id={`default-on-${index}`} {...register(`form.${index}.defaultValue`)} />
                            <Label htmlFor={`default-on-${index}`}>Default On?</Label>
                        </div>
                     )}
                </div>
            </>
        )
    }

    return (
        <div className="flex items-start gap-2 p-4 border rounded-lg bg-card">
            <div className="flex-1 space-y-2">
                <p className="font-medium capitalize">{field.type} Field</p>
                {renderFieldInputs()}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t mt-2">
                    <Input {...register(`form.${index}.stipulation.field`)} placeholder="Conditional Field Name (e.g. some_toggle)" />
                    <Input {...register(`form.${index}.stipulation.value`)} placeholder="Conditional Field Value (e.g. true)" />
                 </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
        </div>
    );
}

export function PaperworkGeneratorBuilder() {
    const { formData, reset } = usePaperworkBuilderStore();
    const { control, register, handleSubmit, watch } = useForm({
        defaultValues: formData,
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "form"
    });

    const { fields: conditionalFields, append: appendConditional, remove: removeConditional } = useFieldArray({
        control,
        name: "conditionals"
    });

    const { toast } = useToast();
    const router = useRouter();
    const watchedForm = watch("form");
    const watchedConditionals = watch("conditionals");
    const [wildcards, setWildcards] = useState<string[]>([]);
    
    useEffect(() => {
        reset();
    }, [reset])

    useEffect(() => {
        const generatedWildcards: string[] = [];
        
        const processFields = (fields: Field[], prefix = '') => {
            fields.forEach(field => {
                if (field.name) {
                    generatedWildcards.push(`{{${prefix}${field.name}}}`);
                }
                if (field.type === 'group' && field.fields) {
                    processFields(field.fields, prefix);
                }
                if(field.type === 'officer'){
                    ['name', 'rank', 'badgeNumber'].forEach(p => generatedWildcards.push(`{{officers.0.${p}}}`))
                }
                if(field.type === 'general'){
                    ['date', 'time', 'callSign'].forEach(p => generatedWildcards.push(`{{general.${p}}}`))
                }
            });
        };
        processFields(watchedForm);

        watchedConditionals?.forEach(cond => {
            if(cond.variableName) {
                generatedWildcards.push(`{{${cond.variableName}}}`);
            }
        });

        setWildcards([...new Set(generatedWildcards)]);
    }, [watchedForm, watchedConditionals]);


    const onSubmit = async (data: any) => {
        const response = await fetch('/api/paperwork-generators/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(response.ok) {
            const result = await response.json();
            toast({ title: "Success!", description: "Form created successfully." });
            router.push(`/paperwork-generators/form?s=${result.id}`);
        } else {
            const error = await response.json();
            toast({ title: "Error", description: error.error || "Failed to create form.", variant: "destructive" });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: `"${text}" copied to clipboard.`,
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title="Paperwork Generator Builder" description="Create your own dynamic paperwork templates." />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Generator Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...register("title")} placeholder="e.g., Seizure Warrant"/>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" {...register("description")} placeholder="e.g., Generate a seizure warrant affidavit."/>
                            </div>
                            <div>
                                <Label htmlFor="icon">Icon</Label>
                                 <Controller
                                    name="icon"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select an icon..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FileSearch">FileSearch</SelectItem>
                                                <SelectItem value="Puzzle">Puzzle</SelectItem>
                                                <SelectItem value="Car">Car</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Add Form Fields</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {fieldTypes.map(ft => (
                             <Button key={ft.type} type="button" variant="outline" size="sm" onClick={() => append(ft.default)}>
                                <Plus className="mr-2 h-4 w-4" /> {ft.label}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <FieldEditor 
                                key={field.id} 
                                field={field} 
                                index={index} 
                                onRemove={remove}
                                register={register}
                                control={control}
                                watch={watch}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Conditional Variables</CardTitle>
                        <CardDescription>Define variables that can be used in the output template based on form input.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {conditionalFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-2 bg-card relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-red-500"
                                    onClick={() => removeConditional(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <Label>If field...</Label>
                                        <Input {...register(`conditionals.${index}.conditionField`)} placeholder="e.g., was_mirandized"/>
                                    </div>
                                    <div>
                                        <Label>Is...</Label>
                                        <Controller
                                            name={`conditionals.${index}.operator`}
                                            control={control}
                                            defaultValue="is_checked"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="is_checked">Checked</SelectItem>
                                                        <SelectItem value="is_not_checked">Not Checked</SelectItem>
                                                        <SelectItem value="equals">Equal to</SelectItem>
                                                        <SelectItem value="not_equals">Not Equal to</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <Label>Value</Label>
                                        <Input {...register(`conditionals.${index}.conditionValue`)} placeholder="e.g., true (leave empty if checked/not checked)"/>
                                    </div>
                                </div>
                                <div>
                                    <Label>Then create variable...</Label>
                                    <Input {...register(`conditionals.${index}.variableName`)} placeholder="e.g., miranda_statement" />
                                </div>
                                <div>
                                    <Label>With text content...</Label>
                                    <Textarea {...register(`conditionals.${index}.outputText`)} placeholder="The full Miranda rights text..."/>
                                </div>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendConditional({ conditionField: '', operator: 'is_checked', conditionValue: '', variableName: '', outputText: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Conditional Variable
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Output Format</CardTitle>
                        <CardContent className="p-0 pt-4 space-y-2">
                            <div>
                                <Label>Available Wildcards</Label>
                                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px] bg-muted/50">
                                    {wildcards.length > 0 ? wildcards.map(wc => (
                                        <Badge 
                                            key={wc} 
                                            variant="secondary" 
                                            className="cursor-pointer"
                                            onClick={() => copyToClipboard(wc)}
                                        >
                                            {wc} <Copy className="ml-2 h-3 w-3" />
                                        </Badge>
                                    )) : <p className="text-sm text-muted-foreground">Add fields to see available wildcards.</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="output">Template</Label>
                                <Textarea id="output" {...register("output")} rows={15} placeholder="Use {{fieldName}} for wildcards. Example: [b]Suspect:[/b] {{suspect_name}}" />
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
                <div className="flex justify-end">
                    <Button type="submit">Save Generator</Button>
                </div>
            </form>
        </div>
    );
}
