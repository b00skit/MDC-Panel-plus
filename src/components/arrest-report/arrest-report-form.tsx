
'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { LocationDetails } from '../shared/location-details';
import { useForm, FormProvider } from 'react-hook-form';

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
  required = true,
  isInvalid = false,
  ...props
}: {
  label:string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
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
        className={cn(
            'pl-9',
            isInvalid && 'border-red-500 focus-visible:ring-red-500',
            className
        )}
        defaultValue={defaultValue}
        required={required}
        {...props}
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
  required = true,
  isInvalid = false,
  ...props
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  required?: boolean;
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
        className={cn(
            'pl-9 pt-3',
            isInvalid && 'border-red-500 focus-visible:ring-red-500',
            className
        )}
        defaultValue={defaultValue}
        required={required}
        {...props}
      />
    </div>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
);


export const ArrestReportForm = forwardRef((props, ref) => {
  const router = useRouter();
  const { toast } = useToast();
  const { formData, setAll } = useFormStore();
  const { officers } = useOfficerStore();
  const [submitted, setSubmitted] = useState(false);
  const methods = useForm({ defaultValues: formData });
  const formRef = useRef<HTMLFormElement>(null);


  const getFormData = () => {
    if (!formRef.current) return null;
    const form = formRef.current;
    const data = {
        ...useFormStore.getState().formData,
        arrest: {
            suspectName: (form.elements.namedItem('suspect-name') as HTMLInputElement).value,
            narrative: (form.elements.namedItem('narrative') as HTMLTextAreaElement).value,
        },
        evidence: {
            supporting: (form.elements.namedItem('supporting-evidence') as HTMLTextAreaElement).value,
            dashcam: (form.elements.namedItem('dashcam') as HTMLTextAreaElement).value,
        },
        officers: officers,
    };
    return data;
  }

  const validateForm = (data: any) => {
    // General Section
    if (!data.general.callSign) return "Call Sign is required.";
    if (!data.general.date) return "Date is required.";
    if (!data.general.time) return "Time is required.";
    
    // Officer Section
    for (const officer of data.officers) {
        if (!officer.name || !officer.rank || !officer.badgeNumber || !officer.department) {
            return `All fields for Officer ${officer.name || '(new officer)'} are required.`;
        }
    }

    // Arrest Section
    if (!data.arrest.suspectName) return "Suspect's Full Name is required.";
    if (!data.arrest.narrative) return "Arrest Narrative is required.";

    // Location Details
    if (!data.location.district) return "District is required.";
    if (!data.location.street) return "Street Name is required.";
    
    // Evidence Section
    if (!data.evidence.dashcam) return "Dashboard Camera narrative is required.";
    // Supporting evidence is not mandatory

    return null;
  };

  const saveDraft = () => {
    const latestFormData = getFormData();
    if (latestFormData) {
        setAll(latestFormData as any);
    }
    toast({
        title: 'Draft Saved',
        description: 'Your report has been saved as a draft.',
    });
  }

  useImperativeHandle(ref, () => ({
    saveDraft
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const latestFormData = getFormData();
    if (!latestFormData) return;

    const validationError = validateForm(latestFormData);
    if (validationError) {
      toast({
        title: 'Missing Information',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }
    
    setAll(latestFormData as any);
    router.push('/arrest-submit?type=basic');
  };

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <GeneralSection isSubmitted={submitted} />
        <OfficerSection isSubmitted={submitted} isArrestReport={true} />

        <FormSection title="Arrest Section" icon={<FileText className="h-6 w-6" />}>
          <div className="space-y-6">
              <InputField
                label="Suspect's Full Name"
                id="suspect-name"
                placeholder="Firstname Lastname"
                icon={<User className="h-4 w-4 text-muted-foreground" />}
                defaultValue={formData.arrest.suspectName}
                isInvalid={submitted && !formData.arrest.suspectName}
              />
              <TextareaField 
                  label="Arrest Narrative"
                  id="narrative"
                  placeholder="Arrest Narrative"
                  icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                  description={
                      <span className="text-red-500">
                        Describe the events leading up to the arrest in first person and in chronological order, ensure you explain your probable cause of each of the charges and the arrest.
                      </span>
                    }
                    className="min-h-[150px]"
                    defaultValue={formData.arrest.narrative}
                    isInvalid={submitted && !formData.arrest.narrative}
              />
          </div>
        </FormSection>

        <FormSection title="Location Details" icon={<MapPin className="h-6 w-6" />}>
          <LocationDetails 
            districtFieldName="location.district"
            streetFieldName="location.street"
            showDistrict={true}
            isSubmitted={submitted}
          />
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
                  defaultValue={formData.evidence.supporting}
                  required={false}
              />
              <TextareaField 
                  label="Dashboard Camera"
                  id="dashcam"
                  placeholder="The dashboard camera captures audio and video footage showcasing..."
                  icon={<Video className="h-4 w-4 text-muted-foreground" />}
                  description={
                      <span>
                        Roleplay what the dashboard camera captures OR provide Streamable/YouTube links.
                        <br/>
                        <span className="text-red-500">(( Lying in this section will lead to OOC punishment ))</span>
                      </span>
                    }
                    className="min-h-[150px]"
                    defaultValue={formData.evidence.dashcam}
                    isInvalid={submitted && !formData.evidence.dashcam}
              />
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={saveDraft}>Save as Draft</Button>
            <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </FormProvider>
  );
});

ArrestReportForm.displayName = 'ArrestReportForm';
