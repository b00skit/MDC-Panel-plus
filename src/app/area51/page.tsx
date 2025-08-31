
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import changelogData from '../../../data/changelog.json';
import { Checkbox } from '@/components/ui/checkbox';

type ChangelogItem = {
    type: 'fix' | 'feature' | 'modification' | 'backend' | 'addition';
    description: string;
};

type ChangelogEntry = {
    version: string;
    type: 'Release' | 'Major Update' | 'Minor Update' | 'Hotfix';
    date: string;
    items: ChangelogItem[];
    cacheVersion?: string;
    localStorageVersion?: string;
};

const emptyChangelog: ChangelogEntry = {
    version: '',
    type: 'Minor Update',
    date: '',
    items: [],
    cacheVersion: '',
    localStorageVersion: '',
};

export default function Area51Page() {
    const [allChangelogs, setAllChangelogs] = useState<ChangelogEntry[]>(changelogData.changelogs);
    const [selectedChangelogIndex, setSelectedChangelogIndex] = useState<number | 'new'>(0);
    const [showCacheVersion, setShowCacheVersion] = useState(false);
    const [showLocalStorageVersion, setShowLocalStorageVersion] = useState(false);

    const { register, control, handleSubmit, getValues, reset, watch } = useForm<ChangelogEntry>({
        defaultValues: allChangelogs[0] || emptyChangelog,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });
    
    const { toast } = useToast();
    const [jsonOutput, setJsonOutput] = useState('');

    useEffect(() => {
        const selectedData = selectedChangelogIndex === 'new' ? emptyChangelog : allChangelogs[selectedChangelogIndex];
        setShowCacheVersion(!!selectedData.cacheVersion);
        setShowLocalStorageVersion(!!selectedData.localStorageVersion);
    }, [selectedChangelogIndex, allChangelogs]);
    
    const handleSelectChangelog = (indexStr: string) => {
        if (indexStr === 'new') {
            setSelectedChangelogIndex('new');
            reset(emptyChangelog);
        } else {
            const index = parseInt(indexStr, 10);
            setSelectedChangelogIndex(index);
            reset(allChangelogs[index]);
        }
    };
    
    const generateJson = () => {
        const currentData = getValues();
        if (!showCacheVersion) delete currentData.cacheVersion;
        if (!showLocalStorageVersion) delete currentData.localStorageVersion;

        let updatedChangelogs = [...allChangelogs];
        if (selectedChangelogIndex === 'new') {
            updatedChangelogs.unshift(currentData);
        } else {
            updatedChangelogs[selectedChangelogIndex] = currentData;
        }

        setJsonOutput(JSON.stringify({ changelogs: updatedChangelogs }, null, 4));
         toast({
            title: "JSON Generated",
            description: "The JSON output has been updated with the current form data.",
        });
    }

    const copyJson = () => {
        if (!jsonOutput) {
            toast({
                title: "Nothing to copy",
                description: "Please generate the JSON output first.",
                variant: "destructive"
            });
            return;
        }
        navigator.clipboard.writeText(jsonOutput);
        toast({
            title: "Copied!",
            description: "Changelog JSON copied to clipboard.",
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <PageHeader title="Changelog Generator" description="Create or edit changelog entries." />

            <form onSubmit={handleSubmit(generateJson)} className="space-y-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Label>Select Changelog to Edit</Label>
                        <Select
                            value={String(selectedChangelogIndex)}
                            onValueChange={handleSelectChangelog}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a version..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allChangelogs.map((log, index) => (
                                    <SelectItem key={index} value={String(index)}>
                                        {log.version} - {log.date}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleSelectChangelog('new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Version
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedChangelogIndex === 'new' ? 'New Version Entry' : `Editing Version ${getValues('version')}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Version</Label>
                                <Input {...register(`version`)} placeholder="e.g., 3.0.5" />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Controller
                                    name={`type`}
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Release">Release</SelectItem>
                                                <SelectItem value="Major Update">Major Update</SelectItem>
                                                <SelectItem value="Minor Update">Minor Update</SelectItem>
                                                <SelectItem value="Hotfix">Hotfix</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input type="date" {...register(`date`)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <div className="flex items-center space-x-2">
                                <Checkbox id="showCacheVersion" checked={showCacheVersion} onCheckedChange={() => setShowCacheVersion(!showCacheVersion)} />
                                <Label htmlFor="showCacheVersion">Add Cache Version</Label>
                             </div>
                             {showCacheVersion && (
                                <div>
                                    <Label>Cache Version</Label>
                                    <Input {...register('cacheVersion')} placeholder="e.g., v1" />
                                </div>
                             )}
                        </div>
                         <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="showLocalStorageVersion" checked={showLocalStorageVersion} onCheckedChange={() => setShowLocalStorageVersion(!showLocalStorageVersion)} />
                                <Label htmlFor="showLocalStorageVersion">Add Local Storage Version</Label>
                             </div>
                             {showLocalStorageVersion && (
                                <div>
                                    <Label>Local Storage Version</Label>
                                    <Input {...register('localStorageVersion')} placeholder="e.g., v1" />
                                </div>
                             )}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Changelog Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {fields.map((itemField, itemIndex) => (
                                        <div key={itemField.id} className="flex items-start gap-2 p-3 border rounded-md">
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <Label>Item Type</Label>
                                                    <Controller
                                                        name={`items.${itemIndex}.type`}
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
                                                        {...register(`items.${itemIndex}.description`)}
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
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
                
                 <div className="flex justify-end">
                    <Button type="button" onClick={generateJson}>Generate JSON</Button>
                </div>
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
                            placeholder="Click 'Generate JSON' to see the output here."
                        />
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
