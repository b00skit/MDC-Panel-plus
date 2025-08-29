
'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
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
import { User, Shield, Badge as BadgeIcon, Trash2, Plus, Monitor, Moon, Sun, BookUser, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { Separator } from '../ui/separator';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useSettingsStore, FactionGroup } from '@/stores/settings-store';
import { Switch } from '../ui/switch';
import { useTheme } from 'next-themes';

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
    reset: resetOfficers
  } = useOfficerStore();
  const { hiddenFactions, toggleFactionVisibility, setFactionGroups, showHiddenGroups, toggleHiddenGroupVisibility } = useSettingsStore();

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

  const visibleGroups = initialFactionGroups.filter(g => !g.hidden);
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
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
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
                
                {hiddenGroups.length > 0 && <Separator />}

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
