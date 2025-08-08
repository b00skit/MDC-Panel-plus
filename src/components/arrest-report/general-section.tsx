'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Radio } from 'lucide-react';
import { useFormStore } from '@/stores/form-store';

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
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      {icon}
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const InputField = ({
  label,
  id,
  placeholder,
  icon,
  type = 'text',
  value,
  onChange,
  readOnly = false,
  required = true,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="pl-9"
        required={required}
      />
    </div>
  </div>
);

export function GeneralSection() {
    const { general, setFormField } = useFormStore(state => ({
        general: state.formData.general,
        setFormField: state.setFormField,
    }));
  
    useEffect(() => {
        const now = new Date();
        const existingDate = useFormStore.getState().formData.general.date;
        const existingTime = useFormStore.getState().formData.general.time;
        
        if (!existingDate) {
            setFormField('general', 'date', format(now, 'dd/MMM/yyyy').toUpperCase());
        }
        if (!existingTime) {
            setFormField('general', 'time', format(now, 'HH:mm'));
        }
    }, [setFormField]);


  return (
    <FormSection title="General Section" icon={<CalendarDays className="h-6 w-6" />}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InputField
          label="Date"
          id="date"
          placeholder="DD/MMM/YYYY"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          type="text"
          value={general?.date || ''}
          readOnly
        />
        <InputField
          label="Time"
          id="time"
          placeholder="HH:MM"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          type="text"
          value={general?.time || ''}
          readOnly
        />
        <InputField
          label="Call Sign"
          id="call-sign"
          placeholder="CALL SIGN"
          icon={<Radio className="h-4 w-4 text-muted-foreground" />}
          value={general?.callSign || ''}
          onChange={(e) => setFormField('general', 'callSign', e.target.value)}
        />
      </div>
    </FormSection>
  );
}
