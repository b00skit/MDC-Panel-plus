
'use client';
import { useRouter } from 'next/navigation';
import { useRef, forwardRef, useImperativeHandle, useEffect, useMemo, useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin,
  Paperclip,
  Video,
  FileText,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GeneralSection } from './general-section';
import { OfficerSection } from './officer-section';
import { useFormStore } from '@/stores/form-store';
import { useOfficerStore } from '@/stores/officer-store';
import { LocationDetails } from '../shared/location-details';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useBasicReportModifiersStore, Modifier } from '@/stores/basic-report-modifiers-store';
import { TextareaWithPreset } from '../shared/textarea-with-preset';
import Handlebars from 'handlebars';

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
  className = '',
  defaultValue,
  onBlur,
  isInvalid,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  className?: string;
  defaultValue?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className={cn('pl-9', className, isInvalid && 'border-red-500 focus-visible:ring-red-500')}
        defaultValue={defaultValue}
        onBlur={onBlur}
      />
    </div>
  </div>
);

const TextareaField = ({
  label,
  id,
  placeholder,
  icon,
  description,
  className = '',
  defaultValue,
  onBlur,
  isInvalid,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  isInvalid?: boolean;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <div className="absolute left-3 top-3.5">{icon}</div>
        <Textarea
          id={id}
          name={id}
          placeholder={placeholder}
          className={cn('pl-9 pt-3', className, isInvalid && 'border-red-500 focus-visible:ring-red-500')}
          defaultValue={defaultValue}
          onBlur={onBlur}
        />
    </div>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
);

export const ArrestReportForm = forwardRef((props, ref) => {
  const router = useRouter();

  const { formData, setFormField, setAll } = useFormStore();
  const { officers } = useOfficerStore();
  const {
    modifiers,
    presets,
    userModified,
    setModifier,
    setPreset,
    setUserModified,
  } = useBasicReportModifiersStore();
  
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const methods = useForm({
    defaultValues: useMemo(() => ({
      ...formData,
      narrative: {
        modifiers: modifiers,
        isPreset: presets.narrative,
        userModified: userModified.narrative,
        narrative: formData.arrest.narrative,
      },
    }), [formData, modifiers, presets, userModified]),
  });

  const { control, getValues, reset, watch, trigger, formState: { errors } } = methods;

  useEffect(() => {
    reset({
        ...formData,
        narrative: {
            modifiers: modifiers,
            isPreset: presets.narrative,
            userModified: userModified.narrative,
            narrative: formData.arrest.narrative,
        },
    });
  }, [formData, modifiers, presets, userModified, reset]);

  const formRef = useRef<HTMLFormElement>(null);
  const allWatchedFields = watch();

  const arrestReportModifiers: Modifier[] = useMemo(
    () => [
      { name: 'callOfService', label: 'Call of Service', text: 'received a call of service #' },
      { name: 'booking', label: 'Booking', text: 'I transported {{suspect}} to the nearest department\'s station, where I booked them for the charges mentioned within this report according to all outlined departmental guidelines, state requirements and training' },
    ],
    []
  );

  const narrativeText = useMemo(() => {
    const isPresetActive = allWatchedFields.narrative?.isPreset;
    const isUserModified = allWatchedFields.narrative?.userModified;
    
    if (!isPresetActive || isUserModified) {
      return allWatchedFields.arrest?.narrative || '';
    }

    const primaryOfficer = officers[0];
    const data = {
      date: allWatchedFields.general?.date || '',
      time: allWatchedFields.general?.time || '',
      street: allWatchedFields.location?.street || '',
      suspect: allWatchedFields.arrest?.suspectName || '',
      rank: primaryOfficer?.rank || '',
      name: primaryOfficer?.name || '',
      department: primaryOfficer?.department || '',
    };
    
    let baseText = `On the ${data.date}, I ${data.rank} ${data.name} of the ${data.department} conducted an arrest on ${data.suspect}. At approximately ${data.time} hours, I was driving on ${data.street} when I `;

    const activeModifiers = arrestReportModifiers.filter(mod => allWatchedFields.narrative?.modifiers?.[mod.name]);
    
    activeModifiers.forEach(mod => {
      if (mod.name === 'booking') return; // Handled separately
      if (mod.text) {
        const template = Handlebars.compile(mod.text, { noEscape: true });
        baseText += template(data);
      }
    });

    const bookingModifier = arrestReportModifiers.find(m => m.name === 'booking');
    if (allWatchedFields.narrative?.modifiers?.[bookingModifier!.name] && bookingModifier?.text) {
      const template = Handlebars.compile(bookingModifier.text, { noEscape: true });
      baseText += `\n\n${template(data)}`;
    }

    return baseText;
  }, [
    allWatchedFields.general,
    allWatchedFields.location,
    allWatchedFields.arrest?.suspectName,
    allWatchedFields.narrative?.isPreset,
    allWatchedFields.narrative?.userModified,
    JSON.stringify(allWatchedFields.narrative?.modifiers),
    officers,
    arrestReportModifiers,
  ]);
  
  const validateForm = useCallback(() => {
      const currentValues = getValues();
      const newErrors: Record<string, boolean> = {};
      if (!currentValues.arrest?.suspectName) newErrors.suspectName = true;
      if (!currentValues.evidence?.dashcam) newErrors.dashcam = true;
      if (!currentValues.location?.district) newErrors.district = true;
      if (!currentValues.location?.street) newErrors.street = true;
      setFormErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }, [getValues]);

  const saveDraft = useCallback(() => {
    const latestFormData = getValues();
    if (latestFormData) {
        const currentOfficerState = useOfficerStore.getState().officers;
        setAll({
            general: latestFormData.general,
            arrest: { ...latestFormData.arrest, narrative: narrativeText },
            location: latestFormData.location,
            evidence: latestFormData.evidence,
            officers: currentOfficerState,
        });

        if (latestFormData.narrative?.modifiers) {
            Object.keys(latestFormData.narrative.modifiers).forEach((key) => {
                setModifier(key as keyof typeof modifiers, latestFormData.narrative.modifiers[key]);
            });
        }
        if (latestFormData.narrative?.isPreset !== undefined) {
            setPreset('narrative', latestFormData.narrative.isPreset);
        }
        if (latestFormData.narrative?.userModified !== undefined) {
            setUserModified('narrative', latestFormData.narrative.userModified);
        }
    }
  }, [getValues, setAll, setModifier, setPreset, setUserModified, narrativeText]);


  useImperativeHandle(ref, () => ({
    saveDraft,
  }));
  
  useEffect(() => {
    validateForm();
  }, [allWatchedFields, validateForm]);


  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if(validateForm()) {
        saveDraft();
        router.push('/arrest-submit?type=basic');
    }
  };
  
  const isInvalid = (field: string) => !!formErrors[field];

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={handleSubmitForm} className="space-y-6">
        <GeneralSection />
        <OfficerSection isArrestReport={true} />

        <FormSection title="Location Details" icon={<MapPin className="h-6 w-6" />}>
          <LocationDetails
            districtFieldName="location.district"
            streetFieldName="location.street"
            showDistrict={true}
          />
        </FormSection>

        <FormSection title="Arrest Section" icon={<FileText className="h-6 w-6" />}>
          <div className="space-y-6">
            <InputField
              label="Suspect's Full Name"
              id="suspect-name"
              placeholder="Firstname Lastname"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              defaultValue={formData.arrest?.suspectName ?? ''}
              onBlur={(e) => setFormField('arrest', 'suspectName', e.target.value)}
              isInvalid={isInvalid('suspectName')}
            />
            <Controller
                name="arrest.narrative"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                     <TextareaWithPreset
                        label="Arrest Narrative"
                        placeholder="Arrest Narrative"
                        description={
                            <span className="text-red-500">
                            Describe the events leading up to the arrest in first person and in chronological order, ensure you
                            explain your probable cause of each of the charges and the arrest.
                            </span>
                        }
                        basePath="narrative"
                        control={control}
                        modifiers={arrestReportModifiers}
                        isInvalid={isInvalid('narrative')}
                        presetValue={narrativeText}
                        onTextChange={(newValue) => field.onChange(newValue)}
                        />
                )}
            />
          </div>
        </FormSection>

        <FormSection title="Evidence Section" icon={<Paperclip className="h-6 w-6" />}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextareaField
              label="Supporting Evidence"
              id="supporting-evidence"
              placeholder="Videos, Photographs, Links, Audio Recordings / Transcripts, Witness Statements & Testimony"
              icon={<Paperclip className="h-4 w-4 text-muted-foreground" />}
              description="Provide supporting evidence to aid the arrest report."
              className="min-h-[150px]"
              defaultValue={formData.evidence?.supporting ?? ''}
              onBlur={(e) => setFormField('evidence', 'supporting', e.target.value)}
            />
            <TextareaField
              label="Dashboard Camera"
              id="dashcam"
              placeholder="The dashboard camera captures audio and video footage showcasing..."
              icon={<Video className="h-4 w-4 text-muted-foreground" />}
              description={
                <span>
                  Roleplay what the dashboard camera captures OR provide Streamable/YouTube links.
                  <br />
                  <span className="text-red-500">(( Lying in this section will lead to OOC punishment ))</span>
                </span>
              }
              className="min-h-[150px]"
              defaultValue={formData.evidence?.dashcam ?? ''}
              onBlur={(e) => setFormField('evidence', 'dashcam', e.target.value)}
              isInvalid={isInvalid('dashcam')}
            />
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={saveDraft}>
            Save as Draft
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </FormProvider>
  );
});

ArrestReportForm.displayName = 'ArrestReportForm';

    