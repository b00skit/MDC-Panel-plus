
'use client';
import { useState, useEffect } from 'react';
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
import { User, Shield, Badge as BadgeIcon, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { Separator } from '../ui/separator';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useSettingsStore, FactionGroup } from '@/stores/settings-store';
import { Switch } from '../ui/switch';

interface DeptRanks {
  [department: string]: string[];
}

interface SettingsPageProps {
    initialFactionGroups: FactionGroup[];
}

export function SettingsPage({ initialFactionGroups }: SettingsPageProps) {
  const { toast } = useToast();
  const { 
    officers, 
    updateOfficer, 
    setInitialOfficers,
    alternativeCharacters,
    addAlternativeCharacter,
    updateAlternativeCharacter,
    removeAlternativeCharacter,
  } = useOfficerStore();
  const { hiddenFactions, toggleFactionVisibility, setFactionGroups } = useSettingsStore();

  const [deptRanks, setDeptRanks] = useState<DeptRanks>({});
  const defaultOfficer = officers[0];

  const resetCharges = useChargeStore(state => state.resetCharges);
  const resetBasicForm = useFormStore(state => state.reset);
  const resetAdvancedForm = useAdvancedReportStore(state => state.reset);
  const resetOfficers = useOfficerStore(state => state.setInitialOfficers);


  useEffect(() => {
    setInitialOfficers(); 
    fetch('/data/dept_ranks.json')
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

  const handleClearData = () => {
    try {
        localStorage.clear();
        sessionStorage.clear();

        resetCharges();
        resetBasicForm();
        resetAdvancedForm();
        resetOfficers();
        
        toast({
            title: 'Data Cleared',
            description: 'All local and session data has been successfully cleared.',
        });

        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        toast({
            title: 'Error',
            description: 'Could not clear all site data.',
            variant: 'destructive',
          });
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your application settings and data."
      />
      <div className="grid gap-8 mt-6">
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
                </div>
                 {index < 2 && <Separator />}
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
                {initialFactionGroups.length > 0 ? (
                    initialFactionGroups.map(group => (
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
                    <p className="text-muted-foreground text-sm">No faction-specific form groups found.</p>
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
            <CardContent>
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
