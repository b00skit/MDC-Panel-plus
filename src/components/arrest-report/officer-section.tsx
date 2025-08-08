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
import { User, Shield, Badge, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfficerStore } from '@/stores/officer-store';

interface DeptRanks {
  [department: string]: string[];
}

const FormSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       <div className="flex items-center gap-4">
            {icon}
            <CardTitle className="text-xl">{title}</CardTitle>
       </div>
       <Button variant="outline" size="sm" onClick={useOfficerStore.getState().addOfficer} type="button">
            <Plus className="mr-2 h-4 w-4" /> Add Officer
        </Button>
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
  required = true,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Input
        id={id}
        placeholder={placeholder}
        className="pl-9"
        value={value}
        onChange={onChange}
        required={required}
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
  required = true,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger id={id} className="pl-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  </div>
);


export function OfficerSection() {
  const { officers, updateOfficer, removeOfficer, setInitialOfficers } = useOfficerStore();
  const [deptRanks, setDeptRanks] = useState<DeptRanks>({});

  useEffect(() => {
    setInitialOfficers();
    fetch('/data/dept_ranks.json')
      .then((res) => res.json())
      .then((data) => setDeptRanks(data));
  }, [setInitialOfficers]);

  const handleRankChange = (id: number, value: string) => {
    const [department, rank] = value.split('__');
    updateOfficer(id, { department, rank });
  };
  
  return (
    <FormSection title="Officer Section" icon={<User className="h-6 w-6" />}>
      <div className="space-y-6">
        {officers.map((officer, index) => (
          <div key={officer.id} className="grid grid-cols-1 gap-6 md:grid-cols-12 items-end">
            <div className="md:col-span-4">
                <InputField
                    label="Full Name"
                    id={`officer-name-${officer.id}`}
                    placeholder="Isabella Attaway"
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    value={officer.name}
                    onChange={(e) => updateOfficer(officer.id, { name: e.target.value })}
                />
            </div>
             <div className="md:col-span-4">
                <SelectField
                    label="Rank"
                    id={`rank-${officer.id}`}
                    placeholder="Select Rank"
                    icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                    value={officer.department && officer.rank ? `${officer.department}__${officer.rank}` : ''}
                    onValueChange={(value) => handleRankChange(officer.id, value)}
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
             <div className="md:col-span-3">
                <InputField
                    label="Badge"
                    id={`badge-${officer.id}`}
                    placeholder="177131"
                    icon={<Badge className="h-4 w-4 text-muted-foreground" />}
                    value={officer.badgeNumber}
                    onChange={(e) => updateOfficer(officer.id, { badgeNumber: e.target.value })}
                />
             </div>
             <div className="md:col-span-1">
                {index > 0 && (
                     <Button variant="ghost" size="icon" onClick={() => removeOfficer(officer.id)} type="button">
                        <Trash2 className="h-5 w-5 text-red-500" />
                     </Button>
                )}
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
