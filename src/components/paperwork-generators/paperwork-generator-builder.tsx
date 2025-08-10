
'use client';

import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePaperworkBuilderStore, Field } from '@/stores/paperwork-builder-store';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, PlusCircle } from 'lucide-react';

const ICONS = ['FileSearch', 'Puzzle'];

function SortableField({ field, index, onRemoveField, onUpdateField, control, register }: { field: Field; index: number; onRemoveField: (index: number) => void; onUpdateField: (index: number, field: Partial<Field>) => void; control: any, register: any }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-start p-4 border rounded-lg bg-card">
            <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab mt-8">
                <GripVertical />
            </Button>
            <div className="flex-grow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Controller
                            name={`form.${index}.type`}
                            control={control}
                            render={({ field: controllerField }) => (
                                <Select
                                    value={controllerField.value}
                                    onValueChange={(value) => {
                                        controllerField.onChange(value);
                                        onUpdateField(index, { type: value as Field['type'] });
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select field type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text Input</SelectItem>
                                        <SelectItem value="textarea">Text Area</SelectItem>
                                        <SelectItem value="dropdown">Dropdown</SelectItem>
                                        <SelectItem value="general">General Section</SelectItem>
                                        <SelectItem value="officer">Officer Section</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    {field.type !== 'general' && field.type !== 'officer' && (
                        <div className="space-y-2">
                            <Label>Field Name (Unique ID, no spaces)</Label>
                            <Input placeholder="e.g., suspect_name" {...register(`form.${index}.name`)} onBlur={(e) => onUpdateField(index, { name: e.target.value })} />
                        </div>
                    )}
                </div>
                {field.type !== 'general' && field.type !== 'officer' && (
                    <>
                         <div className="space-y-2">
                            <Label>Label</Label>
                            <Input placeholder="e.g., Suspect Name" {...register(`form.${index}.label`)} onBlur={(e) => onUpdateField(index, { label: e.target.value })}/>
                        </div>
                        <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input placeholder="e.g., Enter the suspect's full name" {...register(`form.${index}.placeholder`)} onBlur={(e) => onUpdateField(index, { placeholder: e.target.value })}/>
                        </div>
                    </>
                )}
                {field.type === 'dropdown' && (
                    <div className="space-y-2">
                        <Label>Dropdown Options (comma-separated)</Label>
                        <Input placeholder="Option 1, Option 2, Option 3" defaultValue={field.options?.join(', ')} onBlur={(e) => onUpdateField(index, { options: e.target.value.split(',').map(s => s.trim()) })}/>
                    </div>
                )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemoveField(index)} className="text-red-500 mt-6">
                <Trash2 />
            </Button>
        </div>
    );
}

export function PaperworkGeneratorBuilder() {
    const router = useRouter();
    const { toast } = useToast();
    const { formData, setField, addFormField, removeFormField, updateFormField, setFormFields, reset } = usePaperworkBuilderStore();

    const { control, register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: formData,
    });
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'form',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onSubmit = async (data: any) => {
        try {
            const response = await fetch('/api/paperwork-generators/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to save form.');
            }
            toast({
                title: 'Form Created!',
                description: `Your new paperwork generator "${data.title}" has been saved.`,
            });
            reset();
            router.push(`/paperwork-generators/form?s=${result.id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = fields.findIndex((field) => field.id === active.id);
            const newIndex = fields.findIndex((field) => field.id === over!.id);
            move(oldIndex, newIndex);
            // Also update the store
            const newFields = arrayMove(formData.form, oldIndex, newIndex);
            setFormFields(newFields);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title="Paperwork Generator Builder" description="Create your own dynamic paperwork templates." />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generator Details</CardTitle>
                        <CardDescription>Basic information about your new paperwork generator.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" placeholder="e.g., Seizure Warrant" {...register('title', { required: true })} onBlur={e => setField('title', e.target.value)} />
                            {errors.title && <p className="text-sm text-destructive">Title is required.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="A brief description of the form" {...register('description', { required: true })} onBlur={e => setField('description', e.target.value)} />
                            {errors.description && <p className="text-sm text-destructive">Description is required.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                             <Controller
                                name="icon"
                                control={control}
                                rules={{ required: true }}
                                render={({ field: controllerField }) => (
                                    <Select
                                        value={controllerField.value}
                                        onValueChange={(value) => {
                                            controllerField.onChange(value);
                                            setField('icon', value);
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                                        <SelectContent>
                                            {ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.icon && <p className="text-sm text-destructive">Icon is required.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Fields</CardTitle>
                        <CardDescription>Add and configure the fields for your form. Drag and drop to reorder.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                {fields.map((field, index) => (
                                    <SortableField 
                                        key={field.id} 
                                        field={field} 
                                        index={index} 
                                        onRemoveField={() => { remove(index); removeFormField(index); }} 
                                        onUpdateField={(idx, updated) => updateFormField(idx, updated)}
                                        control={control}
                                        register={register}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                        <Button type="button" variant="outline" className="w-full" onClick={() => { const newField = { id: Date.now().toString(), type: 'text', name: '', label: '', placeholder: '', options: [] }; append(newField); addFormField(newField); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Field
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Output Template</CardTitle>
                        <CardDescription>
                            Define the BBCode or HTML output format. Use `{{field_name}}` to insert form data. For example, `[b]Suspect Name:[/b] {{suspect_name}}`.
                            For officer details, use `{{officers.0.name}}`, `{{officers.0.rank}}`, etc. For general section use `{{general.date}}`.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="[b]Title:[/b] {{title}}\n[b]Date:[/b] {{general.date}}"
                            className="min-h-[200px] font-mono text-sm"
                            {...register('output', { required: true })}
                            onBlur={e => setField('output', e.target.value)}
                        />
                         {errors.output && <p className="text-sm text-destructive">Output template is required.</p>}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => { reset(); router.push('/paperwork-generators'); }}>Cancel</Button>
                    <Button type="submit">Create Generator</Button>
                </div>
            </form>
        </div>
    );
}
