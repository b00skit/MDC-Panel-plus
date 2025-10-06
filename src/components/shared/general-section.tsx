
'use client';

import { useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Radio } from 'lucide-react';
import { useFormStore } from '@/stores/form-store';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';
import { Combobox } from '../ui/combobox';
import { useScopedI18n } from '@/lib/i18n/client';

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
    onBlur,
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
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
          onBlur={onBlur}
          readOnly={readOnly}
          className={cn('pl-9')}
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
    const { predefinedCallsigns, defaultCallsignId } = useSettingsStore();
    const t = useScopedI18n('shared.generalSection');

    useEffect(() => {
        const now = new Date();
        const existingDate = useFormStore.getState().formData.general.date;
        const existingTime = useFormStore.getState().formData.general.time;
        
        if (!existingDate) {
            setFormField('general', 'date', formatInTimeZone(now, 'UTC', 'dd/MMM/yyyy').toUpperCase());
        }
        if (!existingTime) {
            setFormField('general', 'time', formatInTimeZone(now, 'UTC', 'HH:mm'));
        }
    }, [setFormField]);


  return (
    <FormSection title={t('title')} icon={<CalendarDays className="h-6 w-6" />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InputField
            label={t('date')}
            id="date"
            placeholder={t('datePlaceholder')}
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            type="text"
            value={general?.date || ''}
            onChange={(e) => setFormField('general', 'date', e.target.value)}
            onBlur={(e) => setFormField('general', 'date', e.target.value)}
          />
          <InputField
            label={t('time')}
            id="time"
            placeholder={t('timePlaceholder')}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            type="text"
            value={general?.time || ''}
            onChange={(e) => setFormField('general', 'time', e.target.value)}
            onBlur={(e) => setFormField('general', 'time', e.target.value)}
          />
          <div className="grid gap-2">
            <Label htmlFor="call-sign">{t('callSign')}</Label>
             <div className="relative flex items-center">
                <Radio className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                {predefinedCallsigns.length > 0 ? (
                    <Combobox
                        options={predefinedCallsigns.map(c => c.value)}
                        value={general?.callSign || ''}
                        onChange={(value) => setFormField('general', 'callSign', value)}
                        placeholder={t('callSignComboboxPlaceholder')}
                        className="pl-9 w-full"
                    />
                ) : (
                    <Input
                        id="call-sign"
                        placeholder={t('callSignPlaceholder')}
                        value={general?.callSign || ''}
                        onChange={(e) => setFormField('general', 'callSign', e.target.value)}
                        onBlur={(e) => setFormField('general', 'callSign', e.target.value)}
                        className="pl-9 w-full"
                        required
                    />
                )}
            </div>
          </div>
        </div>
      </FormSection>
    );
  }
