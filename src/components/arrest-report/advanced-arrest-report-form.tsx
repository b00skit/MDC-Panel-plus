
'use client';

import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CirclePlus, Trash2, Calendar, Clock } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '../ui/select';
import { useAdvancedReportStore, FormState } from '@/stores/advanced-report-store';
import { useChargeStore } from '@/stores/charge-store';
import { useOfficerStore } from '@/stores/officer-store';
import { format } from 'date-fns';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { EvidenceLog, NarrativeSection } from './narrative-sections';

interface DeptRanks {
  [department: string]: string[];
}

export function AdvancedArrestReportForm() {
    const { formData, setFields } = useAdvancedReportStore();
    const { report: charges, penalCode } = useChargeStore();
    const { officers: defaultOfficers, alternativeCharacters, swapOfficer } = useOfficerStore();
    const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm<FormState>({
        defaultValues: formData,
    });
    
    const { fields: personFields, append: appendPerson, remove: removePersonField } = useFieldArray({
      control,
      name: 'persons'
    });

    const { fields: officerFields, append: appendOfficer, remove: removeOfficerField } = useFieldArray({
      control,
      name: 'officers'
    });
    
    const { fields: evidenceLogFields, append: appendEvidenceLog, remove: removeEvidenceLogField } = useFieldArray({
        control,
        name: 'evidenceLogs'
    });

    const [locations, setLocations] = useState<{districts: string[], streets: string[]}>({ districts: [], streets: []});
    const [deptRanks, setDeptRanks] = useState<DeptRanks>({});

    const watchedFields = watch();

    // Preset Effects
    useEffect(() => {
        if (watchedFields.narrativePresets?.source) {
            const officer = watchedFields.officers?.[0] || {};
            const date = watchedFields.incident?.date || 'DATE';
            const name = officer.name || 'NAME';
            const serial = officer.badgeNumber || 'SERIAL';
            const division = officer.divDetail || 'DIVISION';
            const callsign = officer.callSign || 'CALLSIGN';
            const isMarked = watchedFields.modifiers?.markedUnit ? 'marked' : 'unmarked';
            const isSlicktop = watchedFields.modifiers?.slicktop ? ' slicktop' : '';
            const uniform = watchedFields.modifiers?.inG3Uniform ? 'G3 uniform' : watchedFields.modifiers?.inMetroUniform ? 'metropolitan uniform' : 'uniform';
    
            const presetText = `On ${date}, I, ${officer.rank || 'RANK'} ${name} (#${serial}), assigned to ${division} Division, was deployed under Unit ${callsign}. I was wearing my department-issued ${uniform} and was openly displaying my badge of office on my uniform. I was driving a ${isMarked} black and white${isSlicktop}. At the start of watch, I conducted a check of my police vehicle and the blue, red, and amber emergency lights and siren were in good working order.\n\n`;
            if (getValues('narrative.source') !== presetText) {
                setValue('narrative.source', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.source, 
        watchedFields.officers?.[0]?.rank,
        watchedFields.officers?.[0]?.name,
        watchedFields.officers?.[0]?.badgeNumber,
        watchedFields.officers?.[0]?.divDetail,
        watchedFields.officers?.[0]?.callSign,
        watchedFields.incident?.date, 
        watchedFields.modifiers?.markedUnit,
        watchedFields.modifiers?.slicktop,
        watchedFields.modifiers?.inG3Uniform,
        watchedFields.modifiers?.inMetroUniform,
        setValue, 
        getValues
    ]);

    useEffect(() => {
        if (watchedFields.narrativePresets?.investigation) {
            const time = watchedFields.incident?.time || 'TIME';
            const location = `${watchedFields.incident?.locationDistrict || ''} ${watchedFields.incident?.locationStreet || ''}`.trim() || 'LOCATION';
            const vehicleColor = watchedFields.narrative?.vehicleColor || 'COLOR';
            const vehicleModel = watchedFields.narrative?.vehicleModel || 'MODEL';
            const vehiclePlate = watchedFields.narrative?.vehiclePlate ? `, San Andreas license plate ${watchedFields.narrative.vehiclePlate}` : ', with no plates';
    
            const presetText = `At approximately ${time} hours, I was driving on ${location} when I observed a ${vehicleColor} ${vehicleModel}${vehiclePlate}.`;
            if(getValues('narrative.investigation') !== presetText) {
                setValue('narrative.investigation', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.investigation,
        watchedFields.incident?.time, 
        watchedFields.incident?.locationDistrict,
        watchedFields.incident?.locationStreet,
        watchedFields.narrative?.vehicleColor,
        watchedFields.narrative?.vehicleModel,
        watchedFields.narrative?.vehiclePlate, 
        setValue, 
        getValues
    ]);

    useEffect(() => {
        if (watchedFields.narrativePresets?.arrest) {
            const arresteeName = watchedFields.arrestee?.name || 'ARRESTEE';
            const didMirandize = watchedFields.modifiers?.wasSuspectMirandized;
            const understoodRights = watchedFields.modifiers?.didSuspectUnderstandRights;
            const transported = watchedFields.modifiers?.didYouTransport;
            const chargeList = charges
              .map(c => {
                  const details = penalCode?.[c.chargeId!];
                  if (!details) return 'Unknown Charge';
                  const typePrefix = `${details.type}${c.class}`;
                  return `${typePrefix} ${details.id}. ${details.charge}`;
              }).join(', ');

            let presetText = `${arresteeName} was searched in front of a police vehicle, which was covered by the vehicle's Digital In-Car Video (DICV).\n`;
            presetText += `${arresteeName} was arrested for ${chargeList}.\n`;
            if (didMirandize) {
                presetText += `I admonished ${arresteeName} utilizing my Field Officer’s Notebook, reading the following, verbatim: \n“You have the right to remain silent. Anything you say may be used against you in a court of law. You have the right to the presence of an attorney during any questioning. If you cannot afford an attorney, one will be appointed to you, free of charge, before any questioning, if you want. Do you understand?” ${arresteeName} responded ${understoodRights ? 'affirmatively' : 'negatively'}.\n`;
            }
            if (transported) {
                presetText += `I transported ${arresteeName} to Mission Row Station.\n`;
            }
            if (getValues('narrative.arrest') !== presetText) {
                setValue('narrative.arrest', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.arrest,
        watchedFields.arrestee?.name,
        watchedFields.modifiers?.wasSuspectMirandized,
        watchedFields.modifiers?.didSuspectUnderstandRights,
        watchedFields.modifiers?.didYouTransport,
        charges, 
        penalCode, 
        setValue, 
        getValues
    ]);

    useEffect(() => {
        if (watchedFields.narrativePresets?.photographs) {
            let presetText = '';
            if (watchedFields.modifiers?.doYouHaveAVideo) presetText += `My Digital In-Car Video (DICV) was activated during this investigation - ${watchedFields.narrative?.dicvsLink || 'LINK'}\n`;
            if (watchedFields.modifiers?.didYouTakePhotographs) presetText += `I took photographs using my Department-issued cell phone - ${watchedFields.narrative?.photosLink || 'LINK'}\n`;
            if (watchedFields.modifiers?.didYouObtainCctvFootage) presetText += `I obtained closed-circuit television (CCTV) footage - ${watchedFields.narrative?.cctvLink || 'LINK'}\n`;
            if (watchedFields.modifiers?.thirdPartyVideoFootage) presetText += `I obtained third party video footage - ${watchedFields.narrative?.thirdPartyLink || 'LINK'}\n`;
            
            if (getValues('narrative.photographs') !== presetText) {
                setValue('narrative.photographs', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.photographs,
        watchedFields.modifiers?.doYouHaveAVideo,
        watchedFields.modifiers?.didYouTakePhotographs,
        watchedFields.modifiers?.didYouObtainCctvFootage,
        watchedFields.modifiers?.thirdPartyVideoFootage,
        watchedFields.narrative?.dicvsLink,
        watchedFields.narrative?.photosLink,
        watchedFields.narrative?.cctvLink,
        watchedFields.narrative?.thirdPartyLink, 
        setValue, 
        getValues
    ]);
    
    useEffect(() => {
        if (watchedFields.narrativePresets?.booking) {
            const arresteeName = watchedFields.arrestee?.name || 'ARRESTEE';
            const booked = watchedFields.modifiers?.didYouBook;
            const onFile = watchedFields.modifiers?.biometricsAlreadyOnFile;
            
            let presetText = '';
            if (booked) {
                presetText += `I booked ${arresteeName} on all of the charges listed under the ARREST sub-heading.\n`;
            }
            if (onFile) {
                presetText += `${arresteeName}'s full biometrics, including fingerprints and DNA, were already on file, streamlining the booking process.`;
            }
            if (getValues('narrative.booking') !== presetText) {
                setValue('narrative.booking', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.booking,
        watchedFields.arrestee?.name,
        watchedFields.modifiers?.didYouBook,
        watchedFields.modifiers?.biometricsAlreadyOnFile, 
        setValue, 
        getValues
    ]);
    
    useEffect(() => {
        if (watchedFields.narrativePresets?.evidence) {
            const evidenceLogs = watchedFields.evidenceLogs;
            let presetText = "I booked all evidence into the Mission Row Station property room.\n";
            evidenceLogs?.forEach((log, index) => {
                if (log.logNumber && log.description) {
                    presetText += `Item ${index + 1} - ${log.logNumber} - ${log.description} (x${log.quantity || 1})\n`;
                }
            });
            if (getValues('narrative.evidence') !== presetText) {
                setValue('narrative.evidence', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.evidence,
        watchedFields.evidenceLogs,
        setValue, 
        getValues
    ]);
    
    useEffect(() => {
        if (watchedFields.narrativePresets?.court) {
            const officer = watchedFields.officers?.[0] || {};
            const presetText = `I, ${officer.rank || 'RANK'} ${officer.name || 'NAME'} #${officer.badgeNumber || 'SERIAL'}, can testify to the contents of this report.\n`;
            if (getValues('narrative.court') !== presetText) {
                setValue('narrative.court', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.court,
        watchedFields.officers?.[0]?.rank,
        watchedFields.officers?.[0]?.name,
        watchedFields.officers?.[0]?.badgeNumber, 
        setValue, 
        getValues
    ]);

    useEffect(() => {
        if (watchedFields.narrativePresets?.additional) {
            const plea = watchedFields.narrative?.plea || 'Guilty';
            const arresteeName = watchedFields.arrestee?.name || 'ARRESTEE';
            const presetText = `(( ${arresteeName} pleaded ${plea}. ))\n`;
            if (getValues('narrative.additional') !== presetText) {
                setValue('narrative.additional', presetText, { shouldDirty: true });
            }
        }
    }, [
        watchedFields.narrativePresets?.additional,
        watchedFields.narrative?.plea,
        watchedFields.arrestee?.name, 
        setValue, 
        getValues
    ]);

    useEffect(() => {
        // Pre-fill default officer from officerStore
        if (defaultOfficers.length > 0 && officerFields.length === 0) {
            const defaultOfficer = defaultOfficers[0];
            const storedDivDetail = localStorage.getItem(`${defaultOfficer.badgeNumber}-divDetail`) || '';
            appendOfficer({
                ...defaultOfficer,
                divDetail: storedDivDetail
            });
        }

        if (personFields.length === 0) {
            appendPerson({ name: '', sex: '', gang: '' });
        }
    
        fetch('/data/dept_ranks.json')
            .then((res) => res.json())
            .then((data) => setDeptRanks(data));

        fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_locations.json')
            .then(res => res.json())
            .then(data => {
                const uniqueDistricts = [...new Set((data.districts || []) as string[])];
                const uniqueStreets = [...new Set((data.streets || []) as string[])];
                setLocations({ districts: uniqueDistricts, streets: uniqueStreets });
            })
            .catch(err => console.error("Failed to fetch locations:", err));
      
        // Pre-fill date and time
        if(!getValues('incident.date')) setValue('incident.date', format(new Date(), 'dd/MMM/yyyy').toUpperCase());
        if(!getValues('incident.time')) setValue('incident.time', format(new Date(), 'HH:mm'));

    }, [appendOfficer, appendPerson, defaultOfficers, getValues, officerFields.length, personFields.length, setValue]);

    useEffect(() => {
        reset(formData);
    }, [formData, reset]);
    
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (type === 'change') {
                if (value.officers && value.officers[0] && (name?.startsWith('officers.0') || !name)) {
                    const officer = value.officers[0];
                    if (officer.badgeNumber && officer.divDetail) {
                        localStorage.setItem(`${officer.badgeNumber}-divDetail`, officer.divDetail);
                    }
                }
                setFields(value as FormState);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setFields]);
    
    const handleRankChange = (index: number, value: string) => {
        const [department, rank] = value.split('__');
        setValue(`officers.${index}.department`, department);
        setValue(`officers.${index}.rank`, rank);
    };

    const handlePillClick = (officerIndex: number, altChar: any) => {
        const currentOfficerInForm = getValues(`officers.${officerIndex}`);
        swapOfficer(currentOfficerInForm.id, altChar);
        const updatedOfficersFromStore = useOfficerStore.getState().officers;
        const swappedInOfficer = updatedOfficersFromStore.find(o => o.id === currentOfficerInForm.id);
        
        if (swappedInOfficer) {
            setValue(`officers.${officerIndex}`, {
                ...swappedInOfficer,
                divDetail: getValues(`officers.${officerIndex}.divDetail`), 
            }, { shouldDirty: true });
        }
    }

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
                <colgroup>
                    <col style={{width: '22.5%'}} />
                    <col style={{width: '22.5%'}} />
                    <col style={{width: '15%'}} />
                    <col style={{width: '20%'}} />
                    <col style={{width: '20%'}} />
                </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={2}>
                    ARRESTEE NAME (FIRST, MIDDLE, LAST)
                  </TableHead>
                  <TableHead className="bg-secondary">SEX (M/F/O)</TableHead>
                  <TableHead className="bg-secondary">HAIR</TableHead>
                  <TableHead className="bg-secondary">EYES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Input placeholder="ARRESTEE NAME" {...register("arrestee.name")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="M / F / O" maxLength={1} {...register("arrestee.sex")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="HAIR COLOR" {...register("arrestee.hair")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="EYE COLOR" {...register("arrestee.eyes")} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={2}>
                    RESIDENCE
                  </TableHead>
                  <TableHead className="bg-secondary">AGE</TableHead>
                  <TableHead className="bg-secondary">HEIGHT</TableHead>
                  <TableHead className="bg-secondary">DESCENT</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Input placeholder="ADDRESS, CITY, STATE" {...register("arrestee.residence")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="AGE" type="number" {...register("arrestee.age")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="HEIGHT" {...register("arrestee.height")} />
                  </TableCell>
                  <TableCell>
                    <Input placeholder="DESCENT" {...register("arrestee.descent")} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={3}>
                    CLOTHING
                  </TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>
                    PERSONAL ODDITIES
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Input placeholder="DESCRIBE CLOTHING" {...register("arrestee.clothing")} />
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Input placeholder="DESCRIBE PERSONAL ODDITIES" {...register("arrestee.oddities")} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={3}>
                    MONIKER/ALIAS
                  </TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>
                    GANG/CLUB
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Input placeholder="MONIKER / ALIAS IF KNOWN" {...register("arrestee.alias")} />
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Input placeholder="GANG / CLUB IF KNOWN" {...register("arrestee.gang")} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={5}>
                    CHARGES
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="p-2">
                    <Textarea
                        readOnly
                        className="bg-muted min-h-[auto]"
                        value={
                            charges
                            .map((c) => {
                                const details = penalCode?.[c.chargeId!];
                                if (!details) return 'Unknown Charge';
                                const typePrefix = `${details.type}${c.class}`;
                                return `${typePrefix} ${details.id}. ${details.charge}`;
                            })
                            .join('\n') || 'No charges selected'
                        }
                        rows={charges.length || 1}
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>
                    PERSONS WITH SUBJECT
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">NAME</TableHead>
                  <TableHead className="bg-secondary">SEX (M/F/O)</TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>
                    GANG/MONIKER
                  </TableHead>
                  <TableHead className="bg-secondary">REMOVE</TableHead>
                </TableRow>
                 {personFields.map((field, index) => (
                    <TableRow key={field.id}>
                        <TableCell><Input placeholder={`NAME ${index + 1}`} {...register(`persons.${index}.name`)} /></TableCell>
                        <TableCell><Input placeholder="M / F / O" {...register(`persons.${index}.sex`)} maxLength={1}/></TableCell>
                        <TableCell colSpan={2}><Input placeholder="GANG / MONIKER / ALIAS IF KNOWN" {...register(`persons.${index}.gang`)} /></TableCell>
                        <TableCell><Button variant="destructive" className="w-full" type="button" onClick={() => removePersonField(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                 ))}
                <TableRow>
                  <TableCell colSpan={5} className="p-2">
                    <Button className="w-full" type="button" onClick={() => appendPerson({ name: '', sex: '', gang: '' })}>
                      <CirclePlus className="mr-2 h-4 w-4" /> ADD PERSON
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>
                    INCIDENT SETTING
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">DATE</TableHead>
                  <TableHead className="bg-secondary">TIME</TableHead>
                  <TableHead className="bg-secondary" colSpan={3}>
                    LOCATION
                  </TableHead>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={1}>
                        <div className="relative flex items-center">
                            <Calendar className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="DD/MMM/YYYY" className="pl-9" {...register("incident.date")} />
                        </div>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <div className="relative flex items-center">
                            <Clock className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="HH:MM (24H)" className="pl-9" {...register("incident.time")} />
                        </div>
                    </TableCell>
                  <TableCell colSpan={3}>
                     <div className="flex gap-2">
                        <Controller
                            control={control}
                            name="incident.locationDistrict"
                            render={({ field }) => (
                                <Combobox
                                    options={locations.districts}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select or type a district"
                                />
                            )}
                        />
                         <Controller
                            control={control}
                            name="incident.locationStreet"
                            render={({ field }) => (
                                <Combobox
                                    options={locations.streets}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select or type a street"
                                />
                            )}
                        />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>
                    HANDLING OFFICER(S)
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">RANK</TableHead>
                  <TableHead className="bg-secondary">NAME</TableHead>
                  <TableHead className="bg-secondary">SERIAL NO.</TableHead>
                  <TableHead className="bg-secondary">CALLSIGN</TableHead>
                  <TableHead className="bg-secondary">DIV/DETAIL</TableHead>
                </TableRow>
                {officerFields.map((field, index) => (
                    <React.Fragment key={field.id}>
                    <TableRow>
                        <TableCell>
                            <Controller
                                control={control}
                                name={`officers.${index}.rank`}
                                render={({ field: rankField }) => (
                                    <Select
                                        value={getValues(`officers.${index}.department`) && rankField.value ? `${getValues(`officers.${index}.department`)}__${rankField.value}` : ''}
                                        onValueChange={(value) => handleRankChange(index, value)}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Rank" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(deptRanks).map(([dept, ranks]) => (
                                                <SelectGroup key={dept}>
                                                    <SelectLabel>{dept}</SelectLabel>
                                                    {ranks.map(rank => <SelectItem key={`${dept}-${rank}`} value={`${dept}__${rank}`}>{rank}</SelectItem>)}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </TableCell>
                        <TableCell><Input placeholder={`OFFICER ${index + 1}`} {...register(`officers.${index}.name`)} /></TableCell>
                        <TableCell><Input placeholder="SERIAL NO." type="number" {...register(`officers.${index}.badgeNumber`)} /></TableCell>
                        <TableCell><Input placeholder="CALLSIGN" {...register(`officers.${index}.callSign`)} /></TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Input placeholder="DIVISION / DETAIL" {...register(`officers.${index}.divDetail`)} />
                           {index > 0 && <Button variant="ghost" size="icon" onClick={() => removeOfficerField(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                        </TableCell>
                    </TableRow>
                    {index === 0 && alternativeCharacters.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="p-2">
                                <div className="flex flex-wrap gap-2">
                                    {alternativeCharacters.filter(alt => alt.name).map((altChar) => {
                                        const currentOfficer = getValues('officers.0');
                                        const isSelected = currentOfficer?.badgeNumber === altChar.badgeNumber;
                                        return (
                                            !isSelected && (
                                                <Badge 
                                                    key={altChar.id}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handlePillClick(0, altChar)}
                                                >
                                                    {altChar.name}
                                                </Badge>
                                            )
                                        );
                                    })}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    </React.Fragment>
                ))}
                
                <TableRow>
                  <TableCell colSpan={5} className="p-2">
                    <Button className="w-full" type="button" onClick={() => appendOfficer({ id: Date.now(), name: '', rank: '', badgeNumber: '', department: '', divDetail: '' })}>
                      <CirclePlus className="mr-2 h-4 w-4" /> ADD OFFICER
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={5}>
                    ARREST REPORT MODIFIERS
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted p-1">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-center">
                        <div className="flex items-center space-x-2"><Controller name="modifiers.markedUnit" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="markedUnit" />} /><Label htmlFor="markedUnit">Marked Unit?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.slicktop" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="slicktop" />} /><Label htmlFor="slicktop">Slicktop?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.inUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inUniform" />} /><Label htmlFor="inUniform">In Uniform?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.inMetroUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inMetroUniform" />} /><Label htmlFor="inMetroUniform">In Metro Uniform?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.inG3Uniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inG3Uniform" />} /><Label htmlFor="inG3Uniform">In G3 Uniform?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectInVehicle" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectInVehicle" />} /><Label htmlFor="wasSuspectInVehicle">Was Suspect In Vehicle?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectMirandized" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectMirandized" />} /><Label htmlFor="wasSuspectMirandized">Was Suspect Mirandized?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didSuspectUnderstandRights" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didSuspectUnderstandRights" />} /><Label htmlFor="didSuspectUnderstandRights">Did Suspect Understand Rights?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.doYouHaveAVideo" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="doYouHaveAVideo" />} /><Label htmlFor="doYouHaveAVideo">Do You Have A Video?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTakePhotographs" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTakePhotographs" />} /><Label htmlFor="didYouTakePhotographs">Did You Take Photographs?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouObtainCctvFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouObtainCctvFootage" />} /><Label htmlFor="didYouObtainCctvFootage">Did You Obtain CCTV Footage?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.thirdPartyVideoFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="thirdPartyVideoFootage" />} /><Label htmlFor="thirdPartyVideoFootage">Third Party Video Footage?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.biometricsAlreadyOnFile" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="biometricsAlreadyOnFile" />} /><Label htmlFor="biometricsAlreadyOnFile">Biometrics Already On File?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTransport" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTransport" />} /><Label htmlFor="didYouTransport">Did You Transport?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouBook" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouBook" />} /><Label htmlFor="didYouBook">Did You Book?</Label></div>
                    </div>
                  </TableCell>
                </TableRow>
                
                 <NarrativeSection title="SOURCE OF ACTIVITY" presetFieldName="narrativePresets.source" control={control}>
                    <Controller name="narrative.source" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe the source of the activity..." rows={5} />} />
                </NarrativeSection>

                <NarrativeSection title="INVESTIGATION" presetFieldName="narrativePresets.investigation" control={control}>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <Input placeholder="VEHICLE COLOR" {...register('narrative.vehicleColor')} />
                        <Input placeholder="VEHICLE MODEL" {...register('narrative.vehicleModel')} />
                        <Input placeholder="VEHICLE PLATE" {...register('narrative.vehiclePlate')} />
                    </div>
                    <Controller name="narrative.investigation" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe the investigation..." rows={5} />} />
                </NarrativeSection>

                <NarrativeSection title="ARREST" presetFieldName="narrativePresets.arrest" control={control}>
                    <Controller name="narrative.arrest" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe the arrest..." rows={5} />} />
                </NarrativeSection>
                
                <NarrativeSection title="PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING" presetFieldName="narrativePresets.photographs" control={control}>
                    {getValues('modifiers.doYouHaveAVideo') ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                             <Input placeholder="DICVS Footage Link" {...register('narrative.dicvsLink')} />
                             <Input placeholder="CCTV Footage Link" {...register('narrative.cctvLink')} />
                             <Input placeholder="Photographs Link" {...register('narrative.photosLink')} />
                             <Input placeholder="Third Party Footage Link" {...register('narrative.thirdPartyLink')} />
                        </div>
                        <Controller name="narrative.photographs" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe video or photographic evidence..." rows={5} />} />
                    </>
                     ) : (
                        <Textarea placeholder="(( You may use this section if you don't have a video recording of what happened. Describe what the dashcam would capture. If you have a video, select 'Do You Have A Video?' in the Arrest Report Modifiers. Lying in this section will lead to OOC punishments. ))" rows={3} />
                     )}
                </NarrativeSection>

                <NarrativeSection title="BOOKING" presetFieldName="narrativePresets.booking" control={control}>
                    <Controller name="narrative.booking" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe booking details..." rows={5} />} />
                </NarrativeSection>
                
                 <NarrativeSection title="PHYSICAL EVIDENCE" presetFieldName="narrativePresets.evidence" control={control}>
                    <Table>
                        <EvidenceLog control={control} register={register} fields={evidenceLogFields} onRemove={removeEvidenceLogField} onAdd={() => appendEvidenceLog({ logNumber: '', description: '', quantity: '1'})} />
                    </Table>
                    <Controller name="narrative.evidence" control={control} render={({ field }) => <Textarea {...field} placeholder="Describe physical evidence..." rows={5} />} />
                </NarrativeSection>

                <NarrativeSection title="COURT INFORMATION" presetFieldName="narrativePresets.court" control={control}>
                    <Controller name="narrative.court" control={control} render={({ field }) => <Textarea {...field} placeholder="Information for the court..." rows={5} />} />
                </NarrativeSection>

                 <NarrativeSection title="ADDITIONAL INFORMATION" presetFieldName="narrativePresets.additional" control={control}>
                     <Controller
                        name="narrative.plea"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="mb-2">
                                    <SelectValue placeholder="Select Plea..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Guilty">Guilty</SelectItem>
                                    <SelectItem value="Not Guilty">Not Guilty</SelectItem>
                                    <SelectItem value="No Contest">No Contest</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        />
                    <Controller name="narrative.additional" control={control} render={({ field }) => <Textarea {...field} placeholder="Additional information..." rows={5} />} />
                </NarrativeSection>

              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-4">
        <Button type="submit">Generate Report Preview</Button>
      </div>
    </form>
  );
}
