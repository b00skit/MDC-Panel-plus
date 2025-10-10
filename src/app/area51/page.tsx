
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useState, useEffect, useRef, useCallback } from 'react';

import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { produce } from 'immer';
import { Rnd } from 'react-rnd';

import changelogData from '../../../data/changelog.json';

// Types for Changelog Generator
type ChangelogItem = {
  type: 'fix' | 'feature' | 'modification' | 'backend' | 'addition';
  description: string;
};

type ExperimentalFeature = {
  title: string;
  variable: string;
  description: string;
  defaultEnabled?: boolean;
};

type ChangelogEntry = {
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


// Types for Form Stamp Editor
type FontSetting = {
  family: string;
  file?: string;
};

type TextField = {
  name: string;
  label: string;
  type?: 'textfield' | 'textarea';
  placeholder?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  font?: FontSetting;
};

type FormStampConfig = {
  id: string;
  title: string;
  description: string;
  image: string;
  font?: FontSetting;
  fields: TextField[];
};

type RawFontSetting = string | FontSetting | undefined;

const normalizeFontSetting = (font?: RawFontSetting): FontSetting | undefined => {
  if (!font) return undefined;
  if (typeof font === 'string') {
    const trimmed = font.trim();
    if (!trimmed) return undefined;
    return { family: trimmed };
  }
  if (!font.family) return undefined;
  return font;
};

const normalizeFormStampConfig = (data: any): FormStampConfig => ({
  ...data,
  font: normalizeFontSetting(data?.font),
  fields: Array.isArray(data?.fields)
    ? data.fields.map((field: any) => ({
        ...field,
        font: normalizeFontSetting(field?.font),
      }))
    : [],
});

// Component for Changelog Generator
function ChangelogGenerator() {
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
        const selectedData = selectedChangelogIndex === 'new' ? null : allChangelogs[selectedChangelogIndex as number];
    
        if (selectedData) {
          setShowCacheVersion(!!selectedData.cacheVersion);
          setShowLocalStorageVersion(!!selectedData.localStorageVersion);
        } else {
          setShowCacheVersion(false);
          setShowLocalStorageVersion(false);
        }
      }, [selectedChangelogIndex, allChangelogs]);
    
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
        const currentData = produce(getValues(), (draft: any) => {
            if (!showCacheVersion) delete draft.cacheVersion;
            if (!showLocalStorageVersion) delete draft.localStorageVersion;
            
            draft.items = draft.items.map((item: ChangelogItem) => ({ ...item, description: item.description?.trim() || '' }));

            draft.experimentalFeatures = (draft.experimentalFeatures || [])
                .map((feature: ExperimentalFeature) => ({
                    title: feature.title?.trim() || '',
                    variable: feature.variable?.trim() || '',
                    description: feature.description?.trim() || '',
                    defaultEnabled: Boolean(feature.defaultEnabled),
                }))
                .filter((feature: ExperimentalFeature) => feature.title || feature.variable || feature.description);
        });

        let updatedChangelogs: ChangelogEntry[];
        if (selectedChangelogIndex === 'new') {
          updatedChangelogs = [currentData, ...allChangelogs];
          setSelectedChangelogIndex(0); 
        } else {
          updatedChangelogs = [...allChangelogs];
          updatedChangelogs[selectedChangelogIndex as number] = currentData;
        }
    
        setAllChangelogs(updatedChangelogs);
        reset({ ...currentData, experimentalFeatures: currentData.experimentalFeatures || [] });
    
        const jsonReadyChangelogs = updatedChangelogs.map((entry) => {
          const clonedEntry: any = { ...entry };
          if (!clonedEntry.experimentalFeatures?.length) delete clonedEntry.experimentalFeatures;
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
        <form onSubmit={handleSubmit(generateJson)} className="space-y-6">
            <div className="flex gap-4 items-end">
            <div className="flex-1">
                <Label>Select Changelog to Edit</Label>
                <Select value={String(selectedChangelogIndex)} onValueChange={handleSelectChangelog}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a version..." />
                </SelectTrigger>
                <SelectContent>
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
      );
}


function FormStampsEditor() {
    const [stampFiles, setStampFiles] = useState<{ id: string; title: string }[]>([]);
    const [selectedStamp, setSelectedStamp] = useState<string>('');
    const { toast } = useToast();
    const { register, control, handleSubmit, watch, reset, setValue } = useForm<FormStampConfig>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'fields',
    });

    const formData = watch();
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState({ width: 500, height: 500 });
    const [snapGuides, setSnapGuides] = useState<{ vertical: number | null; horizontal: number | null }>({
        vertical: null,
        horizontal: null,
    });
    const SNAP_THRESHOLD = 8;

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const fontsToLoad = new Map<string, string>();
        const addFont = (font?: FontSetting) => {
            if (!font?.family || !font.file) return;
            fontsToLoad.set(font.family, font.file);
        };

        addFont(formData.font);
        (formData.fields ?? []).forEach((field) => addFont(field?.font));

        if (!fontsToLoad.size) return;

        let cancelled = false;

        const loadFonts = async () => {
            for (const [family, file] of fontsToLoad) {
                try {
                    const fontCheck = `1em "${family.replace(/"/g, '\"')}"`;
                    if (document.fonts?.check?.(fontCheck)) {
                        continue;
                    }
                    const fontFace = new FontFace(family, `url(/data/form-stamps/fonts/${file})`);
                    const loadedFont = await fontFace.load();
                    if (!cancelled) {
                        document.fonts.add(loadedFont);
                    }
                } catch (error) {
                    console.error(`Failed to load font "${family}" from file "${file}"`, error);
                }
            }
        };

        loadFonts();

        return () => {
            cancelled = true;
        };
    }, [formData]);

    useEffect(() => {
        const updateSize = () => {
            if (!previewContainerRef.current) return;
            const { width, height } = previewContainerRef.current.getBoundingClientRect();
            setPreviewSize({ width, height });
        };

        updateSize();

        const element = previewContainerRef.current;
        if (!element) return;

        const cleanupFns: (() => void)[] = [];

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(updateSize);
            resizeObserver.observe(element);
            cleanupFns.push(() => resizeObserver.disconnect());
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateSize);
            cleanupFns.push(() => window.removeEventListener('resize', updateSize));
        }

        return () => {
            cleanupFns.forEach((fn) => fn());
        };
    }, []);

    useEffect(() => {
        // In a real app, this would be an API call
        const fetchStampFiles = async () => {
             // Mocking the API response for now, replace with actual fetch
            const mockFiles = [
                {id: 'property-tag', title: 'Property Tag'}
            ];
            setStampFiles(mockFiles);
        }
        fetchStampFiles();
    }, []);

    const handleStampSelection = async (stampId: string) => {
        if (!stampId || stampId === 'new') {
            reset({ id: '', title: '', description: '', image: '', font: undefined, fields: [] });
            setSelectedStamp(stampId || '');
            return;
        }
        setSelectedStamp(stampId);
        try {
            const res = await fetch(`/api/form-stamps/form?type=static&id=${stampId}`);
            if(!res.ok) throw new Error('Failed to load stamp');
            const data = await res.json();
            reset(normalizeFormStampConfig(data));
        } catch (error) {
            toast({ title: 'Error loading stamp', description: (error as Error).message, variant: 'destructive' });
        }
    };

    const sanitizeFont = (font?: FontSetting) => {
        const normalized = normalizeFontSetting(font);
        if (!normalized) return undefined;
        const result: FontSetting = { family: normalized.family };
        if (normalized.file) {
            result.file = normalized.file;
        }
        return result;
    };

    const generateJson = (data: FormStampConfig) => {
        const sanitized: FormStampConfig = {
            ...data,
            font: sanitizeFont(data.font),
            fields: (data.fields || []).map((field) => {
                const sanitizedFont = sanitizeFont(field.font);
                const { font: _font, ...rest } = field;
                return sanitizedFont ? { ...rest, font: sanitizedFont } : rest;
            }),
        };

        console.log(JSON.stringify(sanitized, null, 2));
        toast({ title: 'JSON Generated', description: 'Check console for output.' });
    }

    const setFieldValue = useCallback(
        (path: `fields.${number}.${'x' | 'y' | 'width' | 'height'}`, value: number) => {
            const rounded = Math.round(value * 1000) / 1000;
            setValue(path, rounded, {
                shouldDirty: true,
                shouldTouch: true,
            });
        },
        [setValue]
    );

    const clampPercent = useCallback((value: number) => Math.min(100, Math.max(0, value)), []);

    const updateFieldRect = useCallback(
        (index: number, rect: { x?: number; y?: number; width?: number; height?: number }) => {
            if (typeof rect.x === 'number') setFieldValue(`fields.${index}.x`, clampPercent(rect.x));
            if (typeof rect.y === 'number') setFieldValue(`fields.${index}.y`, clampPercent(rect.y));
            if (typeof rect.width === 'number') setFieldValue(`fields.${index}.width`, clampPercent(rect.width));
            if (typeof rect.height === 'number') setFieldValue(`fields.${index}.height`, clampPercent(rect.height));
        },
        [clampPercent, setFieldValue]
    );

    const toPercent = (value: number, total: number) => (total ? (value / total) * 100 : 0);

    const getFieldRectPx = (field?: TextField) => {
        if (!previewSize.width || !previewSize.height || !field) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        return {
            x: ((field.x ?? 0) / 100) * previewSize.width,
            y: ((field.y ?? 0) / 100) * previewSize.height,
            width: ((field.width ?? 0) / 100) * previewSize.width,
            height: ((field.height ?? 0) / 100) * previewSize.height,
        };
    };

    const computeSnappedRect = (
        index: number,
        rect: { x?: number; y?: number; width?: number; height?: number },
        options?: { snapWidth?: boolean }
    ) => {
        if (!previewSize.width || !previewSize.height) {
            return {
                rect: {
                    x: rect.x ?? 0,
                    y: rect.y ?? 0,
                    width: rect.width ?? 0,
                    height: rect.height ?? 0,
                },
                guides: { vertical: null as number | null, horizontal: null as number | null },
            };
        }

        const fieldsData = formData.fields ?? [];
        const currentField = fieldsData[index];

        if (!currentField) {
            return {
                rect: {
                    x: rect.x ?? 0,
                    y: rect.y ?? 0,
                    width: rect.width ?? 0,
                    height: rect.height ?? 0,
                },
                guides: { vertical: null as number | null, horizontal: null as number | null },
            };
        }

        const baseRect = getFieldRectPx(currentField);
        let width = rect.width ?? baseRect.width;
        let height = rect.height ?? baseRect.height;
        let x = rect.x ?? baseRect.x;
        let y = rect.y ?? baseRect.y;

        const otherRects = fieldsData
            .map((field, idx) => (idx === index ? null : getFieldRectPx(field)))
            .filter((value): value is { x: number; y: number; width: number; height: number } => Boolean(value));

        if (options?.snapWidth && otherRects.length) {
            let closestWidth = width;
            let closestDiff = SNAP_THRESHOLD + 1;

            otherRects.forEach((other) => {
                const diff = Math.abs(other.width - width);
                if (diff < closestDiff && diff <= SNAP_THRESHOLD) {
                    closestDiff = diff;
                    closestWidth = other.width;
                }
            });

            width = closestWidth;
        }

        const verticalCandidates: number[] = [0, previewSize.width / 2, previewSize.width];
        const horizontalCandidates: number[] = [0, previewSize.height / 2, previewSize.height];

        otherRects.forEach((other) => {
            verticalCandidates.push(other.x, other.x + other.width / 2, other.x + other.width);
            horizontalCandidates.push(other.y, other.y + other.height / 2, other.y + other.height);
        });

        const snapAxis = (value: number, size: number, candidates: number[]) => {
            let snappedValue = value;
            let guide: number | null = null;
            let bestDiff = SNAP_THRESHOLD + 1;

            const points = [
                { point: value, offset: 0 },
                { point: value + size / 2, offset: -size / 2 },
                { point: value + size, offset: -size },
            ];

            candidates.forEach((candidate) => {
                points.forEach(({ point, offset }) => {
                    const diff = Math.abs(point - candidate);
                    if (diff < bestDiff && diff <= SNAP_THRESHOLD) {
                        bestDiff = diff;
                        snappedValue = candidate + offset;
                        guide = candidate;
                    }
                });
            });

            return { value: snappedValue, guide };
        };

        const { value: snappedX, guide: verticalGuide } = snapAxis(x, width, verticalCandidates);
        const { value: snappedY, guide: horizontalGuide } = snapAxis(y, height, horizontalCandidates);

        x = Math.min(Math.max(0, snappedX), Math.max(0, previewSize.width - width));
        y = Math.min(Math.max(0, snappedY), Math.max(0, previewSize.height - height));

        return {
            rect: { x, y, width, height },
            guides: { vertical: verticalGuide, horizontal: horizontalGuide },
        };
    };

    const handleDrag = (index: number, _e: any, d: any) => {
        if (!previewSize.width || !previewSize.height) return;

        const { rect, guides } = computeSnappedRect(index, { x: d.x, y: d.y });
        setSnapGuides(guides);

        updateFieldRect(index, {
            x: toPercent(rect.x, previewSize.width),
            y: toPercent(rect.y, previewSize.height),
        });
    };

    const handleDragStop = (index: number, e: any, d: any) => {
        handleDrag(index, e, d);
        setSnapGuides({ vertical: null, horizontal: null });
    };

    const handleResize = (index: number, _e: any, _direction: any, ref: HTMLElement, _delta: any, position: any) => {
        if (!previewSize.width || !previewSize.height) return;

        const { rect, guides } = computeSnappedRect(
            index,
            {
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
            },
            { snapWidth: true }
        );

        setSnapGuides(guides);

        updateFieldRect(index, {
            width: toPercent(rect.width, previewSize.width),
            height: toPercent(rect.height, previewSize.height),
            x: toPercent(rect.x, previewSize.width),
            y: toPercent(rect.y, previewSize.height),
        });
    };

    const handleResizeStop = (index: number, e: any, direction: any, ref: HTMLElement, delta: any, position: any) => {
        handleResize(index, e, direction, ref, delta, position);
        setSnapGuides({ vertical: null, horizontal: null });
    };

    return (
        <form onSubmit={handleSubmit(generateJson)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Load & Edit Stamp</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="stamp-selector">Select a Stamp to Edit</Label>
                    <Select value={selectedStamp} onValueChange={handleStampSelection}>
                        <SelectTrigger id="stamp-selector">
                            <SelectValue placeholder="Select a stamp..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="new">➕ New Stamp</SelectItem>
                            {stampFiles.map(file => (
                                <SelectItem key={file.id} value={file.id}>{file.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Stamp Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="stamp-title">Title</Label>
                        <Input id="stamp-title" {...register('title')} />
                    </div>
                    <div>
                        <Label htmlFor="stamp-desc">Description</Label>
                        <Input id="stamp-desc" {...register('description')} />
                    </div>
                    <div>
                        <Label htmlFor="stamp-image">Background Image</Label>
                        <Input id="stamp-image" {...register('image')} placeholder="e.g., property-tag-bg.png" />
                    </div>
                    <div>
                        <Label htmlFor="stamp-font-family">Global Font Family</Label>
                        <Input id="stamp-font-family" {...register('font.family')} placeholder="e.g., DejaVu Sans" />
                    </div>
                    <div>
                        <Label htmlFor="stamp-font-file">Global Font File</Label>
                        <Input id="stamp-font-file" {...register('font.file')} placeholder="e.g., DejaVuSans.ttf" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fields</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', label: '', x: 10, y: 10, width: 30, height: 5, fontSize: 16, color: '#000000', textAlign: 'left', type: 'textfield' })}>
                        <Plus className="mr-2" /> Add Field
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                            <div className="flex justify-end">
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500"/>
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input {...register(`fields.${index}.name`)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Label</Label>
                                    <Input {...register(`fields.${index}.label`)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Placeholder</Label>
                                    <Input {...register(`fields.${index}.placeholder`)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Controller control={control} name={`fields.${index}.type`} render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="textfield">Textfield</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Size</Label>
                                    <Input type="number" {...register(`fields.${index}.fontSize`, { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <Input type="color" {...register(`fields.${index}.color`)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Family (Override)</Label>
                                    <Input {...register(`fields.${index}.font.family`)} placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Font File (Override)</Label>
                                    <Input {...register(`fields.${index}.font.file`)} placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Weight</Label>
                                    <Controller control={control} name={`fields.${index}.fontWeight`} render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="bold">Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Text Align</Label>
                                    <Controller control={control} name={`fields.${index}.textAlign`} render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="center">Center</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                                <SelectItem value="justify">Justify</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>
                             <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>X Position (%)</Label>
                                    <Input type="number" step="any" {...register(`fields.${index}.x`, { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Y Position (%)</Label>
                                    <Input type="number" step="any" {...register(`fields.${index}.y`, { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Width (%)</Label>
                                    <Input type="number" step="any" {...register(`fields.${index}.width`, { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Height (%)</Label>
                                    <Input type="number" step="any" {...register(`fields.${index}.height`, { valueAsNumber: true })} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                <CardContent>
                    <div
                        ref={previewContainerRef}
                        className="relative bg-gray-200 dark:bg-gray-800 border border-dashed overflow-hidden"
                        style={{ width: '500px', height: '500px' }}
                    >
                        {formData.image && <img src={`/data/form-stamps/img/${formData.image}`} alt="background" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />}
                        {snapGuides.vertical !== null && (
                            <div
                                className="absolute top-0 bottom-0 bg-blue-500/60 pointer-events-none"
                                style={{ left: `${snapGuides.vertical}px`, width: '1px', zIndex: 30 }}
                            />
                        )}
                        {snapGuides.horizontal !== null && (
                            <div
                                className="absolute left-0 right-0 bg-blue-500/60 pointer-events-none"
                                style={{ top: `${snapGuides.horizontal}px`, height: '1px', zIndex: 30 }}
                            />
                        )}
                        {formData.fields?.map((field, index) => {
                            const containerWidth = previewSize.width;
                            const containerHeight = previewSize.height;

                            const widthPx = ((field.width ?? 0) / 100) * containerWidth;
                            const heightPx = ((field.height ?? 0) / 100) * containerHeight;
                            const xPx = ((field.x ?? 0) / 100) * containerWidth;
                            const yPx = ((field.y ?? 0) / 100) * containerHeight;

                            return (
                                <Rnd
                                    key={index}
                                    size={{
                                        width: widthPx,
                                        height: heightPx,
                                    }}
                                    position={{
                                        x: xPx,
                                        y: yPx,
                                    }}
                                    onDrag={(e, d) => handleDrag(index, e, d)}
                                    onDragStop={(e, d) => handleDragStop(index, e, d)}
                                    onResize={(e, direction, ref, delta, position) => handleResize(index, e, direction, ref, delta, position)}
                                    onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(index, e, direction, ref, delta, position)}
                                    bounds="parent"
                                    className="border border-blue-500/50 p-1 box-border"
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            fontSize: `${field.fontSize}px`,
                                            color: field.color,
                                            fontFamily: [formData.fields?.[index]?.font?.family, formData.font?.family, 'sans-serif']
                                                .filter(Boolean)
                                                .join(', '),
                                            fontWeight: field.fontWeight,
                                            textAlign: field.textAlign,
                                            overflowWrap: 'break-word',
                                            wordWrap: 'break-word',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {field.placeholder || `Field ${index + 1}`}
                                    </div>
                                </Rnd>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button type="submit">Generate JSON</Button>
            </div>
        </form>
    );
}

export default function Area51Page() {
    useEffect(() => {
        document.title = 'MDC Panel – Area 51';
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader title="Area 51" description="Experimental tools and generators." />
        <Tabs defaultValue="changelog" className="mt-6">
            <TabsList>
                <TabsTrigger value="changelog">Changelog Generator</TabsTrigger>
                <TabsTrigger value="form-stamps">Form Stamps Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="changelog" className="mt-4">
                <ChangelogGenerator />
            </TabsContent>
            <TabsContent value="form-stamps" className="mt-4">
                <FormStampsEditor />
            </TabsContent>
        </Tabs>
        </div>
    );
}
