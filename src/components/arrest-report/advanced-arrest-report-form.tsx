
'use client';

import { useForm, Controller } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CirclePlus, Trash2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// This is a placeholder component.
// The full implementation will depend on the final form structure.
export function AdvancedArrestReportForm() {
  const { register, control, handleSubmit, watch, setValue } = useForm();
  
  const onSubmit = (data:any) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="bg-secondary" colSpan={2}>ARRESTEE NAME (FIRST, MIDDLE, LAST)</TableHead>
                                <TableHead className="bg-secondary">SEX (M/F/O)</TableHead>
                                <TableHead className="bg-secondary">HAIR</TableHead>
                                <TableHead className="bg-secondary">EYES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={2}><Input placeholder="ARRESTEE NAME" {...register("arrestee.name")} /></TableCell>
                                <TableCell><Input placeholder="M / F / O" maxLength={1} {...register("arrestee.sex")} /></TableCell>
                                <TableCell><Input placeholder="HAIR COLOR" {...register("arrestee.hair")} /></TableCell>
                                <TableCell><Input placeholder="EYE COLOR" {...register("arrestee.eyes")} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableHead className="bg-secondary" colSpan={2}>RESIDENCE</TableHead>
                                <TableHead className="bg-secondary">AGE</TableHead>
                                <TableHead className="bg-secondary">HEIGHT</TableHead>
                                <TableHead className="bg-secondary">DESCENT</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}><Input placeholder="ADDRESS, CITY, STATE" {...register("arrestee.residence")} /></TableCell>
                                <TableCell><Input placeholder="AGE" type="number" {...register("arrestee.age")} /></TableCell>
                                <TableCell><Input placeholder="HEIGHT" {...register("arrestee.height")} /></TableCell>
                                <TableCell><Input placeholder="DESCENT" {...register("arrestee.descent")} /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableHead className="bg-secondary" colSpan={3}>CLOTHING</TableHead>
                                <TableHead className="bg-secondary" colSpan={2}>PERSONAL ODDITIES</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={3}><Input placeholder="DESCRIBE CLOTHING" {...register("arrestee.clothing")} /></TableCell>
                                <TableCell colSpan={2}><Input placeholder="DESCRIBE PERSONAL ODDITIES" {...register("arrestee.oddities")} /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableHead className="bg-secondary" colSpan={3}>MONIKER/ALIAS</TableHead>
                                <TableHead className="bg-secondary" colSpan={2}>GANG/CLUB</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={3}><Input placeholder="MONIKER / ALIAS IF KNOWN" {...register("arrestee.alias")} /></TableCell>
                                <TableCell colSpan={2}><Input placeholder="GANG / CLUB IF KNOWN" {...register("arrestee.gang")} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableHead className="bg-secondary" colSpan={5}>CHARGES</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5}>
                                    {/* Charges will be pre-filled from calculator */}
                                    <Input readOnly value="Charges from calculator..." />
                                </TableCell>
                            </TableRow>
                            <TableRow className='h-3' />
                             <TableRow>
                                <TableHead className="bg-secondary h-12" colSpan={5}>PERSONS WITH SUBJECT</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableHead className="bg-secondary">NAME</TableHead>
                                <TableHead className="bg-secondary">SEX (M/F/O)</TableHead>
                                <TableHead className="bg-secondary" colSpan={2}>GANG/MONIKER</TableHead>
                                <TableHead className="bg-secondary">REMOVE</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell><Input placeholder="NAME 1" /></TableCell>
                                <TableCell><Input placeholder="M / F / O" /></TableCell>
                                <TableCell colSpan={2}><Input placeholder="GANG / MONIKER / ALIAS IF KNOWN" /></TableCell>
                                <TableCell><Button variant="destructive" className="w-full"><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5}><Button className="w-full"><CirclePlus className="mr-2 h-4 w-4" /> ADD PERSON</Button></TableCell>
                            </TableRow>
                             <TableRow className='h-3' />
                             <TableRow>
                                <TableHead className="bg-secondary h-12" colSpan={5}>INCIDENT SETTING</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="bg-secondary">DATE</TableHead>
                                <TableHead className="bg-secondary">TIME</TableHead>
                                <TableHead className="bg-secondary" colSpan={3}>LOCATION</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={1}><Input type="date"/></TableCell>
                                <TableCell colSpan={1}><Input type="time"/></TableCell>
                                <TableCell colSpan={3}><Input placeholder="STREET, CROSS, AREA" /></TableCell>
                            </TableRow>
                             <TableRow className='h-3' />
                             <TableRow>
                                <TableHead className="bg-secondary h-12" colSpan={5}>HANDLING OFFICER(S)</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="bg-secondary">RANK</TableHead>
                                <TableHead className="bg-secondary">NAME</TableHead>
                                <TableHead className="bg-secondary">SERIAL NO.</TableHead>
                                <TableHead className="bg-secondary">CALLSIGN</TableHead>
                                <TableHead className="bg-secondary">DIV/DETAIL</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableCell><Input placeholder="RANK 1" /></TableCell>
                                <TableCell><Input placeholder="OFFICER 1" /></TableCell>
                                <TableCell><Input placeholder="SERIAL NO." type="number" /></TableCell>
                                <TableCell><Input placeholder="CALLSIGN" /></TableCell>
                                <TableCell><Input placeholder="DIVISION / DETAIL" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5}><Button className="w-full"><CirclePlus className="mr-2 h-4 w-4" /> ADD OFFICER</Button></TableCell>
                            </TableRow>
                            <TableRow className='h-3' />
                            <TableRow>
                                <TableHead className="bg-secondary" colSpan={5}>ARREST REPORT MODIFIERS</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5} className="bg-muted">
                                    <div className="flex flex-wrap gap-4 items-center justify-center">
                                        <div className="flex items-center space-x-2"><Checkbox id="markedUnit" /><Label htmlFor="markedUnit">Marked Unit?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="slicktop" /><Label htmlFor="slicktop">Slicktop?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="inUniform" /><Label htmlFor="inUniform">In Uniform?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="inMetroUniform" /><Label htmlFor="inMetroUniform">In Metro Uniform?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="inG3Uniform" /><Label htmlFor="inG3Uniform">In G3 Uniform?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="wasSuspectInVehicle" /><Label htmlFor="wasSuspectInVehicle">Was Suspect In Vehicle?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="wasSuspectMirandized" /><Label htmlFor="wasSuspectMirandized">Was Suspect Mirandized?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="didSuspectUnderstandRights" /><Label htmlFor="didSuspectUnderstandRights">Did Suspect Understand Rights?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="doYouHaveAVideo" /><Label htmlFor="doYouHaveAVideo">Do You Have A Video?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="didYouTakePhotographs" /><Label htmlFor="didYouTakePhotographs">Did You Take Photographs?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="didYouObtainCctvFootage" /><Label htmlFor="didYouObtainCctvFootage">Did You Obtain Cctv Footage?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="thirdPartyVideoFootage" /><Label htmlFor="thirdPartyVideoFootage">Third Party Video Footage?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="biometricsAlreadyOnFile" /><Label htmlFor="biometricsAlreadyOnFile">Biometrics Already On File?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="didYouTransport" /><Label htmlFor="didYouTransport">Did You Transport?</Label></div>
                                        <div className="flex items-center space-x-2"><Checkbox id="didYouBook" /><Label htmlFor="didYouBook">Did You Book?</Label></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                            <TableRow className='h-3' />
                            <TableRow>
                                 <TableHead className="bg-secondary" colSpan={5}>SOURCE OF ACTIVITY</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={5}><Textarea placeholder="Describe the source of the activity..." /></TableCell>
                            </TableRow>
                             <TableRow className='h-3' />
                            <TableRow>
                                 <TableHead className="bg-secondary" colSpan={5}>NARRATIVE</TableHead>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={5}><Textarea placeholder="Describe the narrative..." /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
            <Button type="submit">Submit Advanced Report</Button>
        </div>
    </form>
  );
}

