
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
import { User, Shield, Badge as BadgeIcon, Trash2, Plus, Monitor, Moon, Sun, BookUser, Download, Upload, Radio, BarChart, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { Separator } from '@/components/ui/separator';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useSettingsStore, FactionGroup, type BackgroundLogoOption } from '@/stores/settings-store';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

// --- Helper Interfaces ---
interface DeptRanks {
  [department: string]: string[];
}

interface SettingsPageProps {
    initialFactionGroups: FactionGroup[];
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


export function SettingsPage({ initialFactionGroups }: SettingsPageProps) {
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const { 
    officers, 
    updateOfficer, 
    setInitialOfficers,
    alternativeCharacters,
    addAlternativeCharacter,
    updateAlternativeCharacter,
    removeAlternativeCharacter,
  } = useOfficerStore();
  const { hiddenFactions, toggleFactionVisibility, setFactionGroups, showHiddenGroups, toggleHiddenGroupVisibility, predefinedCallsigns, defaultCallsignId, addCallsign, removeCallsign, updateCallsign, setDefaultCallsignId, analyticsOptOut, toggleAnalytics, backgroundLogo, setBackgroundLogo } = useSettingsStore();

  const [deptRanks, setDeptRanks] = useState<DeptRanks>({});
  const defaultOfficer = officers[0];

  const resetCharges = useChargeStore(state => state.resetCharges);
  const resetBasicForm = useFormStore(state => state.reset);
  const resetAdvancedForm = useAdvancedReportStore(state => state.reset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInitialOfficers(); 
    fetch('/data/faction_ranks.json')
      .then((res) => res.json())
      .then((data) => setDeptRanks(data));
    setFactionGroups(initialFactionGroups);
  }, [setInitialOfficers, initialFactionGroups, setFactionGroups]);

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
      title: 'Settings Saved',
      description: 'Your settings have been updated.',
    });
  };

  const handleClearData = async () => {
    const success = await clearAllSiteData();
    toast({
      title: success ? 'Data Cleared' : 'Error',
      description: success
        ? 'All local and session data has been successfully cleared.'
        : 'Could not clear all site data. Check the console for details.',
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
      title: 'Data Exported',
      description: 'A file with your data has been downloaded.',
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
          title: 'Data Imported',
          description: 'Local storage data has been imported.',
        });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: 'Import Failed',
          description: 'Could not import data. Please ensure the file is valid.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const visibleGroups = initialFactionGroups.filter(g => (!g.hidden && !g.url));
  const hiddenGroups = initialFactionGroups.filter(g => g.hidden);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your application settings and data."
      />
      <div className="grid gap-8 mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                        <Sun className="mr-2" /> Light
                    </Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                        <Moon className="mr-2" /> Dark
                    </Button>
                    <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
                        <Monitor className="mr-2" /> System
                    </Button>
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium leading-none">Background Logo</h4>
                        <p className="text-sm text-muted-foreground">
                            Choose the logo that is displayed behind the application content.
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
                                label: 'San Andreas Seal',
                                image: '/img/logos/Logo-SanAndreasSeal.png',
                                alt: 'San Andreas Seal',
                            },
                            {
                                value: 'lspd' as BackgroundLogoOption,
                                label: 'Los Santos Police Department',
                                image: '/img/logos/Logo-LSPD.png',
                                alt: 'Los Santos Police Department',
                            },
                            {
                                value: 'lssd' as BackgroundLogoOption,
                                label: "Los Santos County Sheriff's Department",
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

        <Card>
            <CardHeader>
                <CardTitle>Advanced Form Parameters</CardTitle>
                <CardDescription>
                    Configure advanced form options, such as setting a default officer lineup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/settings/advanced-form-parameters">
                        <Settings2 className="mr-2" /> Go to Advanced Parameters
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Officer Information</CardTitle>
            <CardDescription>
              Set the default officer details that will be pre-filled in new arrest reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {defaultOfficer ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="officer-name">Full Name</Label>
                    <div className="relative flex items-center">
                        <User className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="officer-name"
                        placeholder="John Doe"
                        value={defaultOfficer.name}
                        onChange={(e) => handleOfficerChange('name', e.target.value)}
                        className="pl-9"
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank & Department</Label>
                    <div className="relative flex items-center">
                        <Shield className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                         <Select 
                           value={defaultOfficer.department && defaultOfficer.rank ? `${defaultOfficer.department}__${defaultOfficer.rank}` : ''}
                           onValueChange={handleRankChange}>
                           <SelectTrigger id="rank" className="pl-9">
                               <SelectValue placeholder="Select Rank" />
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
                    <Label htmlFor="badge-number">Badge Number</Label>
                     <div className="relative flex items-center">
                        <BadgeIcon className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="badge-number"
                        placeholder="12345"
                        value={defaultOfficer.badgeNumber}
                        onChange={(e) => handleOfficerChange('badgeNumber', e.target.value)}
                        className="pl-9"
                        />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="div-detail">Division / Detail</Label>
                     <div className="relative flex items-center">
                        <BookUser className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="div-detail"
                        placeholder="e.g. Mission Row"
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

         <Card>
          <CardHeader>
            <CardTitle>Predefined Callsigns</CardTitle>
            <CardDescription>
              Manage a list of callsigns to quickly select from in forms.
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
                            placeholder={`Callsign #${index + 1}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeCallsign(callsign.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </RadioGroup>
            <Button variant="outline" onClick={addCallsign}>
                <Plus className="mr-2 h-4 w-4" /> Add Callsign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Characters</CardTitle>
            <CardDescription>
              Manage up to 3 alternative characters for quick selection in reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {alternativeCharacters.map((altChar, index) => (
              <div key={altChar.id} className="space-y-4">
                 <div className="flex justify-between items-center">
                   <Label className="text-lg font-medium">Character {index + 1}</Label>
                   <Button variant="ghost" size="icon" onClick={() => removeAlternativeCharacter(altChar.id)}>
                       <Trash2 className="h-4 w-4 text-red-500"/>
                   </Button>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor={`alt-officer-name-${altChar.id}`}>Full Name</Label>
                        <div className="relative flex items-center">
                            <User className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-officer-name-${altChar.id}`}
                                placeholder="John Doe"
                                value={altChar.name}
                                onChange={(e) => handleAltOfficerChange(altChar.id, 'name', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`alt-rank-${altChar.id}`}>Rank & Department</Label>
                        <div className="relative flex items-center">
                            <Shield className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Select 
                                value={altChar.department && altChar.rank ? `${altChar.department}__${altChar.rank}` : ''}
                                onValueChange={(value) => handleAltRankChange(altChar.id, value)}>
                                <SelectTrigger id={`alt-rank-${altChar.id}`} className="pl-9">
                                    <SelectValue placeholder="Select Rank" />
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
                        <Label htmlFor={`alt-badge-number-${altChar.id}`}>Badge Number</Label>
                        <div className="relative flex items-center">
                            <BadgeIcon className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-badge-number-${altChar.id}`}
                                placeholder="123456"
                                value={altChar.badgeNumber}
                                onChange={(e) => handleAltOfficerChange(altChar.id, 'badgeNumber', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`alt-div-detail-${altChar.id}`}>Division / Detail</Label>
                        <div className="relative flex items-center">
                            <BookUser className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input
                                id={`alt-div-detail-${altChar.id}`}
                                placeholder="e.g. Mission Row"
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
                    <Plus className="mr-2 h-4 w-4" /> Add Character
                </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Form Visibility</CardTitle>
                <CardDescription>
                    Control which faction-specific forms are visible on the Paperwork Generators page.
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
                    <p className="text-muted-foreground text-sm">No toggleable faction form groups found.</p>
                )}
            </CardContent>
        </Card>
        
         <Card>
            <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                    Manage how your data is used.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="analytics-opt-out" className="text-base flex flex-col">
                            Anonymous Analytics
                           <span className="text-xs text-muted-foreground">Help improve the application by sharing anonymous usage data.</span>
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

        <div className="flex justify-end">
            <Button onClick={handleSave}>Save All Changes</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                    Permanently delete all your stored data, including saved reports, charges, and default settings. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" /> Export Data
                    </Button>
                    <Button variant="outline" onClick={handleImportDataClick}>
                        <Upload className="mr-2 h-4 w-4" /> Import Data
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
                            <Trash2 className="mr-2 h-4 w-4" /> Clear All Site Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your
                            application data from your browser's storage.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
