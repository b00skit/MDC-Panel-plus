'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Radio } from 'lucide-react';

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
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        className="pl-9"
      />
    </div>
  </div>
);

export function GeneralSection() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(format(now, 'dd/MMM/yyyy').toUpperCase());
    setCurrentTime(format(now, 'HH:mm'));
  }, []);

  return (
    <FormSection title="General Section" icon={<CalendarDays className="h-6 w-6" />}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InputField
          label="Date"
          id="date"
          placeholder="DD/MMM/YYYY"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          type="text"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
        />
        <InputField
          label="Time"
          id="time"
          placeholder="HH:MM"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          type="text"
          value={currentTime}
          onChange={(e) => setCurrentTime(e.target.value)}
        />
        <InputField
          label="Call Sign"
          id="call-sign"
          placeholder="CALL SIGN"
          icon={<Radio className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </FormSection>
  );
}
