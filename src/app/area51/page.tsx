
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

type ChangelogItem = {
    type: 'fix' | 'feature' | 'modification' | 'backend' | 'addition';
    description: string;
};

type ChangelogEntry = {
    version: string;
    type: 'Hotfix' | 'Minor Update' | 'Major Update';
    date: string;
    items: ChangelogItem[];
};

type FormValues = {
    changelogs: ChangelogEntry[];
};

export default function Area51Page() {
    const { register, control, handleSubmit, watch } = useForm<FormValues>({
        defaultValues: {
            changelogs: [{ version: '', type: 'Minor Update', date: '', items: [] }]
        }
    });

    const { fields: versionFields, append: appendVersion, remove: removeVersion } = useFieldArray({
        control,
        name: "changelogs"
    });
    
    const watchedChangelogs = watch();
    const [jsonOutput, setJsonOutput] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setJsonOutput(JSON.stringify(watchedChangelogs, null, 4));
    }, [watchedChangelogs]);

    const copyJson = () => {
        navigator.clipboard.writeText(jsonOutput);
        toast({
            title: "Copied!",
            description: "Changelog JSON copied to clipboard.",
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title="Changelog Generator" description="Create changelog entries with ease." />

            <form className="space-y-6">
                {versionFields.map((versionField, versionIndex) => (
                    <Card key={versionField.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Version Entry</CardTitle>
                            <Button variant="destructive" size="icon" onClick={() => removeVersion(versionIndex)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Version</Label>
                                    <Input {...register(`changelogs.${versionIndex}.version`)} placeholder="e.g., 3.0.5" />
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Controller
                                        name={`changelogs.${versionIndex}.type`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Hotfix">Hotfix</SelectItem>
                                                    <SelectItem value="Minor Update">Minor Update</SelectItem>
                                                    <SelectItem value="Major Update">Major Update</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" {...register(`changelogs.${versionIndex}.date`)} />
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Changelog Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChangelogItems control={control} versionIndex={versionIndex} register={register} />
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                ))}

                <Button type="button" variant="outline" onClick={() => appendVersion({ version: '', type: 'Minor Update', date: '', items: [] })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Version Entry
                </Button>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>JSON Output</CardTitle>
                        <Button type="button" size="sm" onClick={copyJson}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            readOnly
                            value={jsonOutput}
                            className="min-h-[400px] font-mono text-xs"
                        />
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}

function ChangelogItems({ control, versionIndex, register }: { control: any, versionIndex: number, register: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `changelogs.${versionIndex}.items`
    });

    return (
        <div className="space-y-4">
            {fields.map((itemField, itemIndex) => (
                <div key={itemField.id} className="flex items-start gap-2 p-3 border rounded-md">
                    <div className="flex-1 space-y-2">
                        <div>
                            <Label>Item Type</Label>
                            <Controller
                                name={`changelogs.${versionIndex}.items.${itemIndex}.type`}
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select item type..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="feature">Feature</SelectItem>
                                            <SelectItem value="addition">Addition</SelectItem>
                                            <SelectItem value="modification">Modification</SelectItem>
                                            <SelectItem value="backend">Backend</SelectItem>
                                            <SelectItem value="fix">Fix</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                {...register(`changelogs.${versionIndex}.items.${itemIndex}.description`)}
                                placeholder="e.g., Added a cool new feature."
                            />
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(itemIndex)} className="mt-6">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => append({ type: 'feature', description: '' })}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
        </div>
    );
}
