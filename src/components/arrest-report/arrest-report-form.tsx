
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarDays,
  Clock,
  Radio,
  User,
  Shield,
  Badge,
  Plus,
  MapPin,
  Map,
  Paperclip,
  Video,
  FileText,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

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
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  className?: string;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
      <div className="absolute left-2.5 z-10">{icon}</div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn('pl-9', className)}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  id,
  placeholder,
  icon,
  children,
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative flex items-center">
       <div className="absolute left-2.5 z-10">{icon}</div>
      <Select>
        <SelectTrigger id={id} className="pl-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
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
}: {
  label: string;
  id: string;
  placeholder: string;
  icon: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <div className="absolute left-3 top-3.5">{icon}</div>
      <Textarea id={id} placeholder={placeholder} className={cn('pl-9 pt-3', className)} />
    </div>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </div>
);


export function ArrestReportForm() {
  return (
    <div className="space-y-6">
      <FormSection title="General Section" icon={<CalendarDays className="h-6 w-6" />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InputField
            label="Date"
            id="date"
            placeholder="DD/MMM/YYYY"
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
            type="date"
          />
          <InputField
            label="Time"
            id="time"
            placeholder="HH:MM"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            type="time"
          />
          <InputField
            label="Call Sign"
            id="call-sign"
            placeholder="CALL SIGN"
            icon={<Radio className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </FormSection>

      <FormSection title="Officer Section" icon={<User className="h-6 w-6" />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <InputField
              label="Full Name"
              id="officer-name"
              placeholder="Isabella Attaway"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
            />
            <SelectField
                label="Rank"
                id="rank"
                placeholder="Select Rank"
                icon={<Shield className="h-4 w-4 text-muted-foreground" />}
            >
                <SelectItem value="sergeant">Sergeant</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="deputy">Deputy</SelectItem>
            </SelectField>
            <InputField
                label="Badge"
                id="badge"
                placeholder="177131"
                icon={<Badge className="h-4 w-4 text-muted-foreground" />}
            />
             <div className="grid gap-2">
                <Label>Options</Label>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> Slot</Button>
            </div>
        </div>
      </FormSection>

       <FormSection title="Arrest Section" icon={<User className="h-6 w-6" />}>
         <div className="space-y-6">
            <InputField
              label="Suspect's Full Name"
              id="suspect-name"
              placeholder="Firstname Lastname"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
            />
            <TextareaField 
                label="Arrest Narrative"
                id="narrative"
                placeholder="Arrest Narrative"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                description={
                    <span className="text-red-500">
                      LSPD: Describe the events leading up to the arrest in third person and in chronological order, explaining all charges. <br />
                      LSSD: Describe the events leading up to the arrest in first person and in chronological order, explaining all charges.
                    </span>
                  }
                  className="min-h-[150px]"
            />
         </div>
      </FormSection>

       <FormSection title="Location Details" icon={<MapPin className="h-6 w-6" />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="District"
              id="district"
              placeholder="District"
              icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            />
            <InputField
              label="Street Name"
              id="street-name"
              placeholder="Street Name"
              icon={<Map className="h-4 w-4 text-muted-foreground" />}
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
            />
        </div>
      </FormSection>

      <div className="flex justify-end gap-4">
          <Button variant="outline">Save as Draft</Button>
          <Button>Submit Report</Button>
      </div>
    </div>
  );
}
