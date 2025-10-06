'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import changelogData from '../../../data/changelog.json';

// Types
export type ChangelogItem = {
  type: 'fix' | 'feature' | 'modification' | 'backend' | 'addition';
  description: string;
};

export type ExperimentalFeature = {
  title: string;
  variable: string;
  description: string;
  defaultEnabled?: boolean;
};

export type ChangelogEntry = {
  version: string;
  type: 'Release' | 'Major Update' | 'Minor Update' | 'Hotfix';
  date: string; // yyyy-mm-dd
  items: ChangelogItem[];
  cacheVersion?: string;
  localStorageVersion?: string;
  experimentalFeatures?: ExperimentalFeature[];
};

const emptyChangelog: ChangelogEntry = {
  version: '',
  type: 'Minor Update',
  date: '',
  items: [],
  cacheVersion: '',
  localStorageVersion: '',
  experimentalFeatures: [],
};

export default function Area51Page() {
  const [allChangelogs, setAllChangelogs] = useState<ChangelogEntry[]>(
    ((changelogData as { changelogs: ChangelogEntry[] }).changelogs || []).map((entry) => ({
      ...entry,
      experimentalFeatures: entry.experimentalFeatures || [],
    }))
  );
  const [selectedChangelogIndex, setSelectedChangelogIndex] = useState<number | 'new'>(0);
  const [showCacheVersion, setShowCacheVersion] = useState(false);
  const [showLocalStorageVersion, setShowLocalStorageVersion] = useState(false);

  const { register, control, handleSubmit, getValues, reset, watch } = useForm<ChangelogEntry>({
    defaultValues: allChangelogs[0] || emptyChangelog,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const {
    fields: experimentalFeatureFields,
    append: appendExperimentalFeature,
    remove: removeExperimentalFeature,
  } = useFieldArray({ control, name: 'experimentalFeatures' });

  const { toast } = useToast();
  const [jsonOutput, setJsonOutput] = useState('');

  useEffect(() => {
    document.title = 'MDC Panel – Changelog Generator';
  }, []);

  // Keep toggles in sync with selected entry (or reset for new)
  useEffect(() => {
    const selectedData = selectedChangelogIndex === 'new' ? null : allChangelogs[selectedChangelogIndex as number];

    if (selectedData) {
      setShowCacheVersion(!!selectedData.cacheVersion);
      setShowLocalStorageVersion(!!selectedData.localStorageVersion);
    } else {
      setShowCacheVersion(false);
      setShowLocalStorageVersion(false);
    }
  }, [selectedChangelogIndex, allChangelogs]);

  // When switching the select, load values into the form
  const handleSelectChangelog = (indexStr: string) => {
    if (indexStr === 'new') {
      setSelectedChangelogIndex('new');
      reset(emptyChangelog);
    } else {
      const index = parseInt(indexStr, 10);
      setSelectedChangelogIndex(index);
      reset({
        ...allChangelogs[index],
        experimentalFeatures: allChangelogs[index].experimentalFeatures || [],
      });
    }
  };

  const generateJson = () => {
    // Clone FIRST to avoid mutating RHF's internal state
    const currentData = JSON.parse(JSON.stringify(getValues())) as ChangelogEntry;

    if (!showCacheVersion) delete (currentData as Partial<ChangelogEntry>).cacheVersion;
    if (!showLocalStorageVersion) delete (currentData as Partial<ChangelogEntry>).localStorageVersion;

    const sanitizedItems = currentData.items.map((item) => ({
      ...item,
      description: item.description?.trim() || '',
    }));

    const sanitizedExperimentalFeatures = (currentData.experimentalFeatures || [])
      .map((feature) => ({
        title: feature.title?.trim() || '',
        variable: feature.variable?.trim() || '',
        description: feature.description?.trim() || '',
        defaultEnabled: Boolean(feature.defaultEnabled),
      }))
      .filter((feature) => feature.title || feature.variable || feature.description);

    const entryForState: ChangelogEntry = {
      ...currentData,
      items: sanitizedItems,
      experimentalFeatures: sanitizedExperimentalFeatures,
    };

    if (!showCacheVersion) delete (entryForState as Partial<ChangelogEntry>).cacheVersion;
    if (!showLocalStorageVersion) delete (entryForState as Partial<ChangelogEntry>).localStorageVersion;

    let updatedChangelogs: ChangelogEntry[];
    if (selectedChangelogIndex === 'new') {
      // Prepend the new entry to the list
      updatedChangelogs = [entryForState, ...allChangelogs];
      setSelectedChangelogIndex(0); // newly added is now index 0
    } else {
      updatedChangelogs = [...allChangelogs];
      updatedChangelogs[selectedChangelogIndex as number] = entryForState;
    }

    setAllChangelogs(updatedChangelogs);
    reset({
      ...entryForState,
      experimentalFeatures: entryForState.experimentalFeatures || [],
    }); // reflect saved values in the form

    const jsonReadyChangelogs = updatedChangelogs.map((entry) => {
      const clonedEntry: ChangelogEntry = {
        ...entry,
        experimentalFeatures: entry.experimentalFeatures
          ? entry.experimentalFeatures.map((feature) => ({ ...feature }))
          : [],
      };

      if (!clonedEntry.experimentalFeatures?.length) {
        delete (clonedEntry as Partial<ChangelogEntry>).experimentalFeatures;
      }

      return clonedEntry;
    });

    setJsonOutput(JSON.stringify({ changelogs: jsonReadyChangelogs }, null, 4));
    toast({
      title: 'JSON Generated',
      description: 'The JSON output has been updated with the current form data.',
    });
  };

  const copyJson = () => {
    if (!jsonOutput) {
      toast({
        title: 'Nothing to copy',
        description: 'Please generate the JSON output first.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(jsonOutput);
    toast({ title: 'Copied!', description: 'Changelog JSON copied to clipboard.' });
  };

  const versionWatch = watch('version');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader title="Changelog Generator" description="Create or edit changelog entries." />

      <form onSubmit={handleSubmit(generateJson)} className="space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Select Changelog to Edit</Label>
            <Select value={String(selectedChangelogIndex)} onValueChange={handleSelectChangelog}>
              <SelectTrigger>
                <SelectValue placeholder="Select a version..." />
              </SelectTrigger>
              <SelectContent>
                {/* Allow 'new' sentinel as a legit selectable option */}
                <SelectItem value="new">➕ New version</SelectItem>
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
              {selectedChangelogIndex === 'new' ? 'New Version Entry' : `Editing Version ${versionWatch || ''}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Version</Label>
                <Input {...register('version')} placeholder="e.g., 3.0.5" />
              </div>
              <div>
                <Label>Type</Label>
                <Controller
                  name={'type'}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
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
                <Input type="date" {...register('date')} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showCacheVersion"
                  checked={showCacheVersion}
                  onCheckedChange={(checked) => setShowCacheVersion(Boolean(checked))}
                />
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
                <Checkbox
                  id="showLocalStorageVersion"
                  checked={showLocalStorageVersion}
                  onCheckedChange={(checked) => setShowLocalStorageVersion(Boolean(checked))}
                />
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
                            name={`items.${itemIndex}.type` as const}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select item type..." />
                                </SelectTrigger>
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
                            {...register(`items.${itemIndex}.description` as const)}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Experimental Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experimentalFeatureFields.map((featureField, featureIndex) => (
                    <div key={featureField.id} className="space-y-3 rounded-md border p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label>Feature Title</Label>
                          <Input
                            {...register(`experimentalFeatures.${featureIndex}.title` as const)}
                            placeholder="e.g., Interactive Map Overlay"
                          />
                        </div>
                        <div>
                          <Label>Variable Name</Label>
                          <Input
                            {...register(`experimentalFeatures.${featureIndex}.variable` as const)}
                            placeholder="e.g., map_overlay_experiment"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          {...register(`experimentalFeatures.${featureIndex}.description` as const)}
                          placeholder="Describe what the experimental feature does and any caveats."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Controller
                            control={control}
                            name={`experimentalFeatures.${featureIndex}.defaultEnabled` as const}
                            render={({ field }) => (
                              <Checkbox
                                id={`experimentalFeatures.${featureIndex}.defaultEnabled`}
                                checked={Boolean(field.value)}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                              />
                            )}
                          />
                          <Label htmlFor={`experimentalFeatures.${featureIndex}.defaultEnabled`}>
                            Enabled by default
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExperimentalFeature(featureIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      appendExperimentalFeature({
                        title: '',
                        variable: '',
                        description: '',
                        defaultEnabled: false,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Experimental Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Generate JSON</Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>JSON Output</CardTitle>
            <Button type="button" size="sm" onClick={copyJson}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
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
