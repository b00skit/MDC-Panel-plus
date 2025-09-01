
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { User, IdCard, ShieldEllipsis as ShieldIcon, BookUser, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfficerStore, Officer } from '@/stores/officer-store';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';

interface DeptRanks {
  [department: string]: string[];
}

const FormSection = ({
  title,
  icon,
  children,
  onAdd,
  showAddButton,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAdd: () => void;
  showAddButton: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <div className="flex items-center gap-4">
            {icon}
            <CardTitle className="text-xl">{title}</CardTitle>
       </div>
       {showAddButton && (
            <Button variant="outline" size="sm" onClick={onAdd} type="button">
                <Plus className="mr-2 h-4 w-4" /> Add Officer
            </Button>
       )}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const InputField = ({
  label,
  id,
  placeholder,
  icon,
  value,
  onChange,
  onBlur,
  isInvalid
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Input
        id={id}
        placeholder={placeholder}
        className={cn('pl-9', isInvalid && 'border-red-500 focus-visible:ring-red-500')}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  id,
  placeholder,
  icon,
  value,
  onValueChange,
  children,
  isInvalid,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  isInvalid?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={cn('pl-9', isInvalid && 'border-red-500 focus-visible:ring-red-500')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  </div>
);


export function OfficerSection({ 
    isArrestReport = false, 
    isMultiOfficer = true,
    showDivDetail = false,
    showBadgeNumber = false,
 }: { 
    isArrestReport?: boolean, 
    isMultiOfficer?: boolean,
    showDivDetail?: boolean,
    showBadgeNumber?: boolean
}) {
  const { 
    officers, 
    updateOfficer, 
    removeOfficer, 
    setInitialOfficers, 
    addOfficer,
    alternativeCharacters,
    swapOfficer,
  } = useOfficerStore();
  const [deptRanks, setDeptRanks] = useState<DeptRanks>({});
  const { toggleAdvanced } = useAdvancedReportStore();

  const showLspdWarning = isArrestReport && officers.some(o => o.department === 'Los Santos Police Department');

  useEffect(() => {
    setInitialOfficers(); 
    fetch('/data/faction_ranks.json')
      .then((res) => res.json())
      .then((data) => setDeptRanks(data));
  }, [setInitialOfficers]);
  
  const handlePillClick = (officerId: number, altChar: Officer) => {
    swapOfficer(officerId, altChar);
  }
  
  const isOfficerInvalid = (officer: Officer) => {
    return !officer.name || !officer.rank || !officer.badgeNumber;
  };

  const fieldSpans: Record<string, number> = { name: 3, rank: 3, badge: 2, divDetail: 3, remove: 1 };
  const enabledFields = ['name', 'rank', ...(showBadgeNumber ? ['badge'] : []), ...(showDivDetail ? ['divDetail'] : []), 'remove'];
  const totalColumns = enabledFields.reduce((sum, field) => sum + fieldSpans[field], 0);
  const gridColsClass: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12',
  };

  return (
    <FormSection title="Officer Section" icon={<User className="h-6 w-6" />} onAdd={addOfficer} showAddButton={isMultiOfficer}>
      <div className="space-y-6">
        {officers.map((officer, index) => (
          <div key={officer.id} className="p-4 border rounded-lg space-y-4">
            <div className={cn('grid grid-cols-1 gap-6 items-end', gridColsClass[totalColumns])}>
                <div className="md:col-span-3">
                    <InputField
                        label="Full Name"
                        id={`officer-name-${officer.id}`}
                        placeholder="John Doe"
                        icon={<User className="h-4 w-4 text-muted-foreground" />}
                        value={officer.name}
                        onChange={(e) => updateOfficer(officer.id, { name: e.target.value })}
                        isInvalid={!officer.name}
                    />
                </div>
                <div className="md:col-span-3">
                    <SelectField
                        label="Rank"
                        id={`rank-${officer.id}`}
                        placeholder="Select Rank"
                        icon={<IdCard className="h-4 w-4 text-muted-foreground" />}
                        value={officer.department && officer.rank ? `${officer.department}__${officer.rank}` : ''}
                        onValueChange={(value) => {
                            const [department, rank] = value.split('__');
                            updateOfficer(officer.id, { department, rank });
                        }}
                        isInvalid={!officer.rank}
                    >
                        {Object.entries(deptRanks).map(([dept, ranks]) => (
                            <SelectGroup key={dept}>
                                <SelectLabel>{dept}</SelectLabel>
                                {ranks.map((rank) => (
                                    <SelectItem key={`${dept}-${rank}`} value={`${dept}__${rank}`}>{rank}</SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectField>
                </div>
                {showBadgeNumber && (
                  <div className="md:col-span-2">
                      <InputField
                          label="Badge No."
                          id={`badge-${officer.id}`}
                          placeholder="12345"
                          icon={<ShieldIcon className="h-4 w-4 text-muted-foreground" />}
                          value={officer.badgeNumber}
                          onChange={(e) => updateOfficer(officer.id, { badgeNumber: e.target.value })}
                          isInvalid={!officer.badgeNumber}
                      />
                  </div>
                )}
                 {showDivDetail && (
                     <div className="md:col-span-3">
                        <InputField
                            label="Unit / Detail"
                            id={`div-detail-${officer.id}`}
                            placeholder="e.g. Mission Row"
                            icon={<BookUser className="h-4 w-4 text-muted-foreground" />}
                            value={officer.divDetail || ''}
                            onChange={(e) => updateOfficer(officer.id, { divDetail: e.target.value })}
                        />
                    </div>
                 )}
              <div className="md:col-span-1">
                  {index > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => removeOfficer(officer.id)} type="button">
                          <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                  )}
              </div>
            </div>
            {index === 0 && (
              <div className="flex flex-wrap gap-2">
                {alternativeCharacters.filter(alt => alt.name).map((altChar) => {
                  const isSelected = officer.name === altChar.name && officer.badgeNumber === altChar.badgeNumber;
                  return (
                    !isSelected && (
                      <Badge 
                        key={altChar.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handlePillClick(officer.id, altChar)}
                      >
                        {altChar.name}
                      </Badge>
                    )
                  );
                })}
              </div>
            )}
          </div>
        ))}
         {showLspdWarning && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Policy Notice</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>LSPD policy requires the use of the advanced arrest report format.</span>
                    <Button variant="outline" size="sm" onClick={toggleAdvanced}>
                        Switch to Advanced
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </div>
    </FormSection>
  );
}
