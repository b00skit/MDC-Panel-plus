
'use client';

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
import { CirclePlus, Trash2, Calendar } from 'lucide-react';
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
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { useChargeStore } from '@/stores/charge-store';
import { useOfficerStore } from '@/stores/officer-store';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';

interface DeptRanks {
  [department: string]: string[];
}

export function AdvancedArrestReportForm() {
    const { formData, setFormField, setFields, reset, addPerson, removePerson, addOfficer, removeOfficer } = useAdvancedReportStore();
    const { report: charges, penalCode } = useChargeStore();
    const { officers: defaultOfficers, alternativeCharacters, swapOfficer } = useOfficerStore();
    const { register, control, handleSubmit, watch, setValue, getValues } = useForm({
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

    const [locations, setLocations] = useState<{districts: string[], streets: string[]}>({ districts: [], streets: []});
    const [deptRanks, setDeptRanks] = useState<DeptRanks>({});


    useEffect(() => {
        reset(formData);
    }, [formData, reset]);

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
    
      fetch('/data/dept_ranks.json')
        .then((res) => res.json())
        .then((data) => setDeptRanks(data));

      fetch('https://sys.booskit.dev/cdn/serve.php?file=gtaw_locations.json')
        .then(res => res.json())
        .then(data => setLocations(data))
        .catch(err => console.error("Failed to fetch locations:", err));
      
       // Pre-fill date and time
       setValue('incident.date', format(new Date(), 'yyyy-MM-dd'));
       setValue('incident.time', format(new Date(), 'HH:mm'));

    }, []);

    useEffect(() => {
        const subscription = watch((value) => {
          // Syncing div/detail to localStorage
          if (value.officers && value.officers[0]) {
            const officer = value.officers[0];
            if (officer.badgeNumber && officer.divDetail) {
              localStorage.setItem(`${officer.badgeNumber}-divDetail`, officer.divDetail);
            }
          }
          setFields(value as any);
        });
        return () => subscription.unsubscribe();
    }, [watch, setFields]);
    
    const handleRankChange = (index: number, value: string) => {
        const [department, rank] = value.split('__');
        setValue(`officers.${index}.department`, department);
        setValue(`officers.${index}.rank`, rank);
    };

    const handlePillClick = (officerIndex: number, altChar: any) => {
        const currentOfficer = getValues(`officers.${officerIndex}`);
        swapOfficer(currentOfficer.id, altChar); // This updates the officerStore
        
        // We need to manually update the form state after swap
        const swappedInOfficer = altChar;
        setValue(`officers.${officerIndex}`, {
            ...currentOfficer, // keep the same ID for the form field array
            name: swappedInOfficer.name,
            rank: swappedInOfficer.rank,
            badgeNumber: swappedInOfficer.badgeNumber,
            department: swappedInOfficer.department,
        });
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
                    <Input
                        readOnly
                        className="bg-muted"
                        value={
                            charges
                            .map((c) => penalCode?.[c.chargeId!]?.charge || 'Unknown Charge')
                            .join(', ') || 'No charges selected'
                        }
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
                        <TableCell><Button variant="destructive" className="w-full" onClick={() => removePersonField(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
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
                     <Controller
                        control={control}
                        name="incident.date"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        )}
                        />
                  </TableCell>
                  <TableCell colSpan={1}>
                    <Input type="time" {...register("incident.time")} />
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
                    <TableRow key={field.id}>
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
                ))}
                {alternativeCharacters.length > 0 && officerFields.length > 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="p-2">
                        <div className="flex flex-wrap gap-2">
                        {alternativeCharacters.filter(alt => alt.name).map((altChar) => {
                            const currentOfficer = getValues('officers.0');
                            const isSelected = currentOfficer?.name === altChar.name && currentOfficer?.badgeNumber === altChar.badgeNumber;
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
