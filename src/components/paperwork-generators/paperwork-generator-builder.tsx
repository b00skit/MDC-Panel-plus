'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PageHeader } from '../dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PaperworkGeneratorBuilder() {
    const { register, control, handleSubmit } = useForm();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "form"
    });

    const router = useRouter();

    const onSubmit = (data: any) => {
        // In a real application, you would save this data to a file or a database.
        console.log(data);
        alert("Check the console for the form data. In a real app, this would be saved.");
        router.push('/paperwork-generators');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title="Paperwork Generator Builder" description="Create your own dynamic paperwork templates." />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generator Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                            <Input id="title" {...register("title")} placeholder="e.g., Seizure Warrant"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <Input id="description" {...register("description")} placeholder="e.g., Generate a seizure warrant affidavit for property."/>
                        </div>
                        <div>
                            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
                            <Input id="icon" {...register("icon")} placeholder="e.g., FileSearch"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Form Fields</CardTitle>
                        <Button type="button" size="sm" onClick={() => append({ type: 'text', name: '', label: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Field
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                    <Controller
                                        name={`form.${index}.type`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Field Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text Input</SelectItem>
                                                    <SelectItem value="textarea">Text Area</SelectItem>
                                                    <SelectItem value="dropdown">Dropdown</SelectItem>
                                                    <SelectItem value="officer">Officer Section</SelectItem>
                                                    <SelectItem value="general">General Section</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Input {...register(`form.${index}.name`)} placeholder="Field Name (e.g., suspect_name)" />
                                    <Input {...register(`form.${index}.label`)} placeholder="Field Label (e.g., Suspect Name)" />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-5 w-5 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Output Format</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea {...register("output")} rows={10} placeholder="Use {{fieldName}} for wildcards. For example: [b]Suspect:[/b] {{suspect_name}}" />
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button type="submit">Save Generator</Button>
                </div>
            </form>
        </div>
    );
}