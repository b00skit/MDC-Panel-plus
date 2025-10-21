
'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useOfficerStore } from '@/stores/officer-store';
import { User, Shield, Badge as BadgeIcon, Trash2, Plus, Monitor, Moon, Sun, BookUser, Download, Upload, Radio, BarChart, Settings2, AlertTriangle, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { Separator } from '@/components/ui/separator';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useSettingsStore, FactionGroup, type BackgroundLogoOption } from '@/stores/settings-store';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useI18n, useScopedI18n } from '@/lib/i18n/client';
import Image from 'next/image';

// --- Helper Interfaces ---
interface DeptRanks {
  [department: string]: string[];
}

/**
 * A comprehensive function to clear all types of browser storage for the current site origin.
 * This includes localStorage, sessionStorage, cookies, IndexedDB, and service worker caches.
 * @returns {Promise<boolean>} A promise that resolves to true on success and false on failure.
 */
async function clearAllSiteData() {
  let success = true;

  // 1. Clear Local Storage
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    success = false;
  }

  // 2. Clear Session Storage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    success = false;
  }

  // 3. Clear Cookies
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  } catch (error) {
    console.error('Error clearing cookies:', error);
    success = false;
  }

  // 4. Clear IndexedDB databases
  try {
    if ('indexedDB' in window) {
      const dbs = await (indexedDB.databases ? indexedDB.databases() : []);
      const deletePromises = dbs.map(
        db =>
          new Promise<void>((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(db.name!);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onblocked = () => {
              console.warn(`IndexedDB ${db.name} deletion blocked.`);
              resolve();
            };
          })
      );
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    success = false;
  }

  // 5. Unregister Service Workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    }
  } catch (error) {
    console.error('Error unregistering service workers:', error);
    success = false;
  }

  // 6. Clear Cache Storage
  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  } catch (error) {
    console.error('Error clearing caches:', error);
    success = false;
  }

  return success;
}


export default function SettingsPage() {
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const { t: tRoot } = useI18n();
  const t = useScopedI18n('settings');
  const { 
    officers, 
    updateOfficer, 
    setInitialOfficers,
    alternativeCharacters,
    addAlternativeCharacter,
    updateAlternativeCharacter,
    removeAlternativeCharacter,
    predefinedOfficers,
    clearPredefinedOfficers,
  } = useOfficerStore();
  const {
    hiddenFactions,
    toggleFactionVisibility,
    setFactionGroups,
    showHiddenGroups,
    toggleHiddenGroupVisibility,
    predefinedCallsigns,
    defaultCallsignId,
    addCallsign,
    removeCallsign,
    updateCallsign,
    setDefaultCallsignId,
    analyticsOptOut,
    toggleAnalytics,
    experimentalFeatures,
    toggleExperimentalFeature,
    factionGroups,
    backgroundLogo,
    setBackgroundLogo,
  } = useSettingsStore();

  const [deptRanks, setDeptRanks] = useState<DeptRanks>({});
  const defaultOfficer = officers[0];

  const resetCharges = useChargeStore(state => state.resetCharges);
  const resetBasicForm = useFormStore(state => state.reset);
  const resetAdvancedForm = useAdvancedReportStore(state => state.reset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = tRoot('settings.pageTitle');
  }, [tRoot]);

  useEffect(() => {
    setInitialOfficers();
    fetch('/data/faction_ranks.json')
      .then((res) => res.json())
      .then((data) => setDeptRanks(data));
    fetch('/api/paperwork-generators/groups')
      .then((res) => res.json())
      .then((data) => setFactionGroups(data));
  }, [setInitialOfficers, setFactionGroups]);

  const handleOfficerChange = (field: string, value: string) => {
    if (defaultOfficer) {
      updateOfficer(defaultOfficer.id, { [field]: value });
    }
  };
  
  const handleAltOfficerChange = (id: number, field: string, value: string) => {
    updateAlternativeCharacter(id, { [field]: value });
  };

  const handleRankChange = (value: string) => {
    const [department, rank] = value.split('__');
    if (defaultOfficer) {
        updateOfficer(defaultOfficer.id, { department, rank });
    }
  };

  const handleAltRankChange = (id: number, value: string) => {
    const [department, rank] = value.split('__');
    updateAlternativeCharacter(id, { department, rank });
  };

  const handleSave = () => {
    toast({
      title: t('toasts.settingsSaved'),
      description: t('toasts.settingsSavedDesc'),
    });
  };

  const handleClearData = async () => {
    const success = await clearAllSiteData();
    toast({
      title: success ? t('toasts.dataCleared') : t('toasts.clearError'),
      description: success
        ? t('toasts.dataClearedDesc')
        : t('toasts.clearErrorDesc'),
      ...(success ? {} : { variant: 'destructive' }),
    });

    setTimeout(() => window.location.reload(), 1000);
  };

  const handleExportData = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== 'local_storage_version' && key !== 'cache_version') {
        const value = localStorage.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mdc-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t('toasts.dataExported'),
      description: t('toasts.dataExportedDesc'),
    });
  };

  const handleImportDataClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Record<string, string>;
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'local_storage_version' && key !== 'cache_version') {
            localStorage.setItem(key, value);
          }
        });
        toast({
          title: t('toasts.dataImported'),
          description: t('toasts.dataImportedDesc'),
        });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: t('toasts.importFailed'),
          description: t('toasts.importFailedDesc'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  
  const hasPredefinedOfficers = predefinedOfficers.length > 0;

  const sortedFactionGroups = [...factionGroups].sort((a, b) => (a.order || 99) - (b.order || 99));
  const visibleGroups = sortedFactionGroups.filter(g => !g.hidden && !g.url);
  const hiddenGroups = sortedFactionGroups.filter(g => g.hidden);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title={t('header.title')}
        description={t('header.description')}
      />
      <div className="grid gap-8 mt-6">
        <Card>
            <CardHeader>
                <CardTitle>{t('appearance.title')}</CardTitle>
                <CardDescription>
                    {t('appearance.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                        <Sun className="mr-2" /> {t('appearance.light')}
                    </Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                        <Moon className="mr-2" /> {t('appearance.dark')}
                    </Button>
                    <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
                        <Monitor className="mr-2" /> {t('appearance.system')}
                    </Button>
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium leading-none">
                            {t('appearance.backgroundLogo.title')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {t('appearance.backgroundLogo.description')}
                        </p>
                    </div>
                    <RadioGroup
                        value={backgroundLogo}
                        onValueChange={(value) => setBackgroundLogo(value as BackgroundLogoOption)}
                        className="grid gap-3"
                    >
                        {[
                            {
                                value: 'sanAndreasSeal' as BackgroundLogoOption,
                                label: t('appearance.backgroundLogo.options.sanAndreasSeal'),
                                image: '/img/logos/Logo-SanAndreasSeal.png',
                                alt: 'San Andreas Seal',
                            },
                            {
                                value: 'lspd' as BackgroundLogoOption,
                                label: t('appearance.backgroundLogo.options.lspd'),
                                image: '/img/logos/Logo-LSPD.png',
                                alt: 'Los Santos Police Department',
                            },
                            {
                                value: 'lssd' as BackgroundLogoOption,
                                label: t('appearance.backgroundLogo.options.lssd'),
                                image: '/img/logos/Logo-LSSD.png',
                                alt: "Los Santos County Sheriff's Department",
                            },
                        ].map((option) => (
                            <div key={option.value} className="flex items-center gap-4">
                                <RadioGroupItem
                                    value={option.value}
                                    id={`background-logo-${option.value}`}
                                    className="sr-only"
                                />
                                <Label
                                    htmlFor={`background-logo-${option.value}`}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center gap-4 rounded-lg border bg-background p-3 transition-all',
                                        backgroundLogo === option.value
                                            ? 'border-primary ring-2 ring-primary/50'
                                            : 'hover:border-primary/50'
                                    )}
                                >
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                                        <Image
                                            src={option.image}
                                            alt={option.alt}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <span className="font-medium">{option.label}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>

        {hasPredefinedOfficers ? (
             <Card>
                <CardHeader>
                    <CardTitle>{t('defaultOfficer.predefinedActive.title')}</CardTitle>
                    <CardDescription>
                        {t('defaultOfficer.predefinedActive.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('defaultOfficer.predefinedActive.title')}</AlertTitle>
                        <AlertDescription>
                            {t('defaultOfficer.predefinedActive.alert')}
                        </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                         <Button asChild>
                            <Link href="/settings/advanced-form-parameters">
                                <Settings2 className="mr-2" /> {t('defaultOfficer.predefinedActive.goToAdvanced')}
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={clearPredefinedOfficers}>
                            <Trash2 className="mr-2" /> {t('defaultOfficer.predefinedActive.reset')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle>{t('defaultOfficer.title')}</CardTitle>
                    <CardDescription>
                    {t('defaultOfficer.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {defaultOfficer ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="officer-name">{t('defaultOfficer.fields.fullName')}</Label>
                            <div className="relative flex items-center">
                                <User className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                                <Input
                                id="officer-name"
                                placeholder={t('defaultOfficer.fields.fullNamePlaceholder')}
                                value={defaultOfficer.name}
                                onChange={(e) => handleOfficerChange('name', e.target.value)}
                                className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rank">{t('defaultOfficer.fields.rankAndDept')}</Label>
                            <div className="relative flex items-center">
                                <Shield className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                                <Select 
                                value={defaultOfficer.department && defaultOfficer.rank ? `${defaultOfficer.department}__${defaultOfficer.rank}` : ''}
                                onValueChange={handleRankChange}>
                                <SelectTrigger id="rank" className="pl-9">
                                    <SelectValue placeholder={t('defaultOfficer.fields.rankPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(deptRanks).map(([dept, ranks]) => (
                                        <SelectGroup key={dept}>
                                            <SelectLabel>{dept}</SelectLabel>
                                            {ranks.map((rank) => (
                                                <SelectItem key={`${dept}-${rank}`} value={`${dept}__${rank}`}>{rank}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="badge-number">{t('defaultOfficer.fields.badgeNo')}</Label>
                            <div className="relative flex items-center">
                                <BadgeIcon className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                                <Input
                                id="badge-number"
                                placeholder={t('defaultOfficer.fields.badgePlaceholder')}
                                value={defaultOfficer.badgeNumber}
                                onChange={(e) => handleOfficerChange('badgeNumber', e.target.value)}
                                className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="div-detail">{t('defaultOfficer.fields.divDetail')}</Label>
                            <div className="relative flex items-center">
                                <BookUser className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                                <Input
                                id="div-detail"
                                placeholder={t('defaultOfficer.fields.divDetailPlaceholder')}
                                value={defaultOfficer.divDetail || ''}
                                onChange={(e) => handleOfficerChange('divDetail', e.target.value)}
                                className="pl-9"
                                />
                            </div>
                        </div>
                        </div>
                    </>
                    ) : (
                    <p>Loading officer information...</p>
                    )}
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>{t('advancedParams.title')}</CardTitle>
                <CardDescription>
                    {t('advancedParams.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/settings/advanced-form-parameters">
                        <Settings2 className="mr-2" /> {t('advancedParams.button')}
                    </Link>
                </Button>
            </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>{t('predefinedCallsigns.title')}</CardTitle>
            <CardDescription>
              {t('predefinedCallsigns.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={String(defaultCallsignId)} onValueChange={(value) => setDefaultCallsignId(Number(value))}>
                {predefinedCallsigns.map((callsign, index) => (
                    <div key={callsign.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <RadioGroupItem value={String(callsign.id)} id={`callsign-default-${callsign.id}`} />
                        <Label htmlFor={`callsign-default-${callsign.id}`} className="sr-only">Set as default</Label>
                        <Input
                            className="flex-1"
                            value={callsign.value}
                            onChange={(e) => updateCallsign(callsign.id, e.target.value)}
                            placeholder={t('predefinedCallsigns.placeholder', { index: index + 1 })}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeCallsign(callsign.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </RadioGroup>
            <Button variant="outline" onClick={addCallsign}>
                <Plus className="mr-2 h-4 w-4" /> {t('predefinedCallsigns.addButton')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('altCharacters.title')}</CardTitle>
            <CardDescription>
              {t('altCharacters.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {alternativeCharacters.map((altChar, index) => (
              <div key={altChar.id} className="space-y-4">
                 <div className="flex justify-between items-center">
                   <Label className="text-lg font-medium">{t('altCharacters.character', { index: index + 1 })}</Label>
                   <Button variant="ghost" size="icon" onClick={() => removeAlternativeCharacter(altChar.id)}>
                       <Trash2 className="h-4 w-4 text-red-500"/>
                   </Button>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor={`alt-officer-name-${altChar.id}`}>{t('defaultOfficer.fields.fullName')}</Label>
                        <div className="relative flex items-center">
                            <User className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-officer-name-${altChar.id}`}
                                placeholder={t('defaultOfficer.fields.fullNamePlaceholder')}
                                value={altChar.name}
                                onChange={(e) => handleAltOfficerChange(altChar.id, 'name', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`alt-rank-${altChar.id}`}>{t('defaultOfficer.fields.rankAndDept')}</Label>
                        <div className="relative flex items-center">
                            <Shield className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Select 
                                value={altChar.department && altChar.rank ? `${altChar.department}__${altChar.rank}` : ''}
                                onValueChange={(value) => handleAltRankChange(altChar.id, value)}>
                                <SelectTrigger id={`alt-rank-${altChar.id}`} className="pl-9">
                                    <SelectValue placeholder={t('defaultOfficer.fields.rankPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(deptRanks).map(([dept, ranks]) => (
                                        <SelectGroup key={dept}>
                                            <SelectLabel>{dept}</SelectLabel>
                                            {ranks.map((rank) => (
                                                <SelectItem key={`${dept}-${rank}-${altChar.id}`} value={`${dept}__${rank}`}>{rank}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`alt-badge-number-${altChar.id}`}>{t('defaultOfficer.fields.badgeNo')}</Label>
                        <div className="relative flex items-center">
                            <BadgeIcon className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-badge-number-${altChar.id}`}
                                placeholder={t('defaultOfficer.fields.badgePlaceholder')}
                                value={altChar.badgeNumber}
                                onChange={(e) => handleAltOfficerChange(altChar.id, 'badgeNumber', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`alt-div-detail-${altChar.id}`}>{t('defaultOfficer.fields.divDetail')}</Label>
                        <div className="relative flex items-center">
                            <BookUser className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-div-detail-${altChar.id}`}
                                placeholder={t('defaultOfficer.fields.divDetailPlaceholder')}
                                value={altChar.divDetail || ''}
                                onChange={(e) => handleAltOfficerChange(altChar.id, 'divDetail', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
                 {index < alternativeCharacters.length - 1 && index < 2 && <Separator />}
              </div>
            ))}
            {alternativeCharacters.length < 3 && (
                <Button variant="outline" onClick={addAlternativeCharacter}>
                    <Plus className="mr-2 h-4 w-4" /> {t('altCharacters.addButton')}
                </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>{t('formVisibility.title')}</CardTitle>
                <CardDescription>
                    {t('formVisibility.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {hiddenGroups.map(group => (
                    <div key={group.group_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor={`toggle-hidden-${group.group_id}`} className="text-base">{group.group_name}</Label>
                        <Switch
                            id={`toggle-hidden-${group.group_id}`}
                            checked={showHiddenGroups[group.group_id] === true}
                            onCheckedChange={() => toggleHiddenGroupVisibility(group.group_id)}
                        />
                    </div>
                ))}

                {visibleGroups.length > 0 ? (
                    visibleGroups.map(group => (
                        <div key={group.group_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <Label htmlFor={`toggle-${group.group_id}`} className="text-base">{group.group_name}</Label>
                            <Switch
                                id={`toggle-${group.group_id}`}
                                checked={!hiddenFactions.includes(group.group_id)}
                                onCheckedChange={() => toggleFactionVisibility(group.group_id)}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm">{t('formVisibility.noGroups')}</p>
                )}
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>{t('privacy.title')}</CardTitle>
                <CardDescription>
                    {t('privacy.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="analytics-opt-out" className="text-base flex flex-col">
                            {t('privacy.analyticsLabel')}
                           <span className="text-xs text-muted-foreground">{t('privacy.analyticsDescription')}</span>
                        </Label>
                    </div>
                    <Switch
                        id="analytics-opt-out"
                        checked={!analyticsOptOut}
                        onCheckedChange={toggleAnalytics}
                    />
                </div>
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>{t('experimental.title')}</CardTitle>
                <CardDescription>
                    {t('experimental.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="experimental-ai-reports" className="text-base flex flex-col">
                            {t('experimental.aiReportsLabel')}
                           <span className="text-xs text-muted-foreground">{t('experimental.aiReportsDescription')}</span>
                        </Label>
                    </div>
                    <Switch
                        id="experimental-ai-reports"
                        checked={experimentalFeatures.includes('ai_arrest_reports')}
                        onCheckedChange={() => toggleExperimentalFeature('ai_arrest_reports')}
                    />
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button onClick={handleSave}>{t('buttons.save')}</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('dataManagement.title')}</CardTitle>
                <CardDescription>
                    {t('dataManagement.description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" /> {t('dataManagement.exportButton')}
                    </Button>
                    <Button variant="outline" onClick={handleImportDataClick}>
                        <Upload className="mr-2 h-4 w-4" /> {t('dataManagement.importButton')}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        onChange={handleImportData}
                        className="hidden"
                    />
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> {t('dataManagement.clearButton')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('dataManagement.clearDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('dataManagement.clearDialog.description')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData}>{t('buttons.continue')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
