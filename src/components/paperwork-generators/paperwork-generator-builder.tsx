
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePaperworkBuilderStore, Field } from '@/stores/paperwork-builder-store';
import { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';

const fieldTypes: { type: Field['type']; label: string; default: Partial<Field> }[] = [
    { type: 'section', label: 'Section Header', default: { type: 'section', title: 'New Section' } },
    { type: 'text', label: 'Text Input', default: { type: 'text', name: 'new_text', label: 'New Text Input', placeholder: 'Enter value' } },
    { type: 'textarea', label: 'Text Area', default: { type: 'textarea', name: 'new_textarea', label: 'New Text Area', placeholder: 'Enter long text' } },
    { type: 'dropdown', label: 'Dropdown', default: { type: 'dropdown', name: 'new_dropdown', label: 'New Dropdown', options: ['Option 1', 'Option 2'] } },
    { type: 'datalist', label: 'Datalist Input', default: { type: 'datalist', name: 'new_datalist', label: 'New Datalist', options: ['Suggestion 1', 'Suggestion 2'] } },
    { type: 'toggle', label: 'Toggle Switch', default: { type: 'toggle', name: 'new_toggle', label: 'New Toggle', dataOn: 'On', dataOff: 'Off' } },
    { type: 'group', label: 'Field Group (Inline)', default: { type: 'group', fields: [] } },
    { type: 'charge', label: 'Charge Selector', default: { type: 'charge', name: 'charges', showClass: true, customFields: [] } },
    { type: 'general', label: 'General Section', default: { type: 'general', name: 'general' } },
    { type: 'officer', label: 'Officer Section', default: { type: 'officer', name: 'officers' } },
];


function SortableField({ field, index, onRemove, onUpdate, control, register, errors }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const renderFieldInputs = () => {
        switch (field.type) {
            case 'section':
                return <Input {...register(`form.${index}.title`)} placeholder="Section Title" />;
            case 'text':
            case 'textarea':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input {...register(`form.${index}.name`)} placeholder="Field Name (e.g. suspect_name)" />
                        <Input {...register(`form.${index}.label`)} placeholder="Label (e.g. Suspect Name)" />
                        <Input {...register(`form.${index}.placeholder`)} placeholder="Placeholder Text" />
                    </div>
                );
            case 'dropdown':
            case 'datalist':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input {...register(`form.${index}.name`)} placeholder="Field Name" />
                        <Input {...register(`form.${index}.label`)} placeholder="Label" />
                        <Input {...register(`form.${index}.options`, { setValueAs: v => v.split(',') })} placeholder="Options (comma-separated)" />
                    </div>
                );
            case 'toggle':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input {...register(`form.${index}.name`)} placeholder="Field Name" />
                        <Input {...register(`form.${index}.label`)} placeholder="Label" />
                        <Input {...register(`form.${index}.dataOn`)} placeholder="Text for ON state" />
                        <Input {...register(`form.${index}.dataOff`)} placeholder="Text for OFF state" />
                    </div>
                );
            case 'charge':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         <Input {...register(`form.${index}.name`)} placeholder="Field Name (e.g. citations)" />
                         <label className="flex items-center space-x-2">
                            <input type="checkbox" {...register(`form.${index}.showClass`)} />
                            <span>Show Class</span>
                         </label>
                         <label className="flex items-center space-x-2">
                            <input type="checkbox" {...register(`form.${index}.showOffense`)} />
                            <span>Show Offense</span>
                         </label>
                    </div>
                )
            default:
                return <p className="text-muted-foreground text-sm">This field has no configuration.</p>;
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 p-4 border rounded-lg bg-card">
            <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5" />
            </Button>
            <div className="flex-1 space-y-2">
                <p className="font-medium capitalize">{field.type} Field</p>
                {renderFieldInputs()}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
    const { formData, setField, setFormFields, reset } = usePaperworkBuilderStore();
    const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: formData,
    });
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "form"
    });
    const { toast } = useToast();
    const router = useRouter();
    const watchedForm = watch("form");
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
        setWildcards([...new Set(generatedWildcards)]); // Remove duplicates
    }, [watchedForm]);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((item) => item.id === active.id);
            const newIndex = fields.findIndex((item) => item.id === over.id);
            move(oldIndex, newIndex);
        }
    };
    
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
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                                {fields.map((field, index) => (
                                    <SortableField 
                                        key={field.id} 
                                        field={field} 
                                        index={index} 
                                        onRemove={remove}
                                        control={control}
                                        register={register}
                                        errors={errors}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
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

