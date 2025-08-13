
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { useAdvancedReportStore, FormState, type FormOfficer } from '@/stores/advanced-report-store';
import { useAdvancedReportModifiersStore } from '@/stores/advanced-report-modifiers-store';
import { useChargeStore } from '@/stores/charge-store';
import { useOfficerStore, Officer } from '@/stores/officer-store';
import { format } from 'date-fns';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { EvidenceLog, NarrativeSection } from './narrative-sections';

interface DeptRanks {
  [department: string]: string[];
}

export function AdvancedArrestReportForm() {
    const router = useRouter();
    // Session state for the current report
    const { formData: sessionFormData, setFields: setSessionFields } = useAdvancedReportStore();
    // Persistent state for user preferences
    const { modifiers, presets, userModified, narrative: persistentNarrative, setModifiersState, setNarrativeField, setPreset, setUserModified } = useAdvancedReportModifiersStore();

    const { report: charges, penalCode } = useChargeStore();
    const { officers: officersFromStore, updateOfficer: updateOfficerInStore, alternativeCharacters, swapOfficer: swapOfficerInStore } = useOfficerStore();
    
    const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm<FormState>({
        // Default values will be populated by the useEffect hook
    });
    
    const { fields: personFields, append: appendPerson, remove: removePersonField } = useFieldArray({
      control,
      name: 'persons'
    });

    const { fields: officerFields, append: appendOfficer, remove: removeOfficerField, update: updateOfficerField } = useFieldArray({
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

    const saveForm = useCallback(() => {
        const currentValues = getValues();
        
        // Save transactional data to session store
        const { modifiers, presets, userModified, ...sessionData } = currentValues;
        setSessionFields(sessionData);

        // Save persistent data to local store
        setModifiersState({
            modifiers: currentValues.modifiers,
            presets: currentValues.presets,
            userModified: currentValues.userModified
        });

        currentValues.officers.forEach((officer: FormOfficer) => {
            if (officer.id) {
                updateOfficerInStore(officer.id, {
                    callSign: officer.callSign,
                    divDetail: officer.divDetail
                });
            }
        });
        
        // Save narrative fields to local store only if they meet the criteria
        Object.keys(currentValues.narrative).forEach((key) => {
            const narrativeKey = key as keyof FormState['narrative'];
            const presetKey = key as keyof FormState['presets'];
            if(currentValues.userModified[presetKey] || !currentValues.presets[presetKey]){
                setNarrativeField(narrativeKey, currentValues.narrative[narrativeKey]);
            }
        });

    }, [getValues, setSessionFields, setModifiersState, updateOfficerInStore, setNarrativeField]);


    const handleFormSubmit = () => {
        saveForm();
        router.push('/arrest-submit?type=advanced');
    };
    
    // Auto-population from modifiers
    useEffect(() => {
        const officers = watchedFields.officers;
        const primaryOfficer = officers?.[0];
        if (!primaryOfficer || !watchedFields.presets?.source) return;
        if (watchedFields.userModified?.source) return;


        const date = watchedFields.incident?.date || '09/AUG/2025';
        const rank = primaryOfficer.rank || '';
        const name = primaryOfficer.name || '';
        const badge = primaryOfficer.badgeNumber || '';
        const divDetail = primaryOfficer.divDetail || '';
        const callsign = primaryOfficer.callSign || '';

        let sourceText = '';

        if (officers && officers.length > 1) {
            const partners = officers.slice(1).filter(p => p.name || p.badgeNumber || p.divDetail); // Filter out empty partners
            if (partners.length > 0) {
                const partnerDetails = partners.map(p => `${p.rank || ''} ${p.name || ''} (#${p.badgeNumber || ''}), assigned to ${p.divDetail || ''}`);

                let partnerStr = '';
                if (partnerDetails.length === 1) {
                    partnerStr = partnerDetails[0];
                } else if (partnerDetails.length > 1) {
                    const lastPartner = partnerDetails.pop();
                    partnerStr = partnerDetails.join(', ') + ', and ' + lastPartner;
                }

                sourceText = `On ${date}, I, ${rank} ${name} (#${badge}), assigned to ${divDetail}, partnered with ${partnerStr}, were deployed under Unit ${callsign}. `;

            } else {
                 // Fallback for case where there are officer rows but they are empty
                sourceText = `On ${date}, I, ${rank} ${name} (#${badge}), assigned to ${divDetail}, was deployed under Unit ${callsign}. `;
            }
        } else {
            sourceText = `On ${date}, I, ${rank} ${name} (#${badge}), assigned to ${divDetail}, was deployed under Unit ${callsign}. `;
        }
        
        // Vehicle part
        if (watchedFields.modifiers?.markedUnit) {
            if (watchedFields.modifiers?.slicktop) {
                sourceText += 'I was driving a marked black and white slicktop. ';
            } else {
                sourceText += 'I was driving a marked black and white with a rooftop light bar. ';
            }
        } else {
            sourceText += 'I was driving an unmarked vehicle. ';
        }

        // Uniform part
        if (watchedFields.modifiers?.inUniform) {
             if (watchedFields.modifiers?.inG3Uniform) {
                sourceText += 'I was wearing my department-issued metropolitan G3 uniform and was openly displaying my badge of office on my uniform.';
            } else if (watchedFields.modifiers?.inMetroUniform) {
                sourceText += 'I was wearing my department-issued metropolitan BDU uniform and was openly displaying my badge of office on my uniform.';
            } else {
                sourceText += 'I was wearing my department-issued patrol uniform and was openly displaying my badge of office on my uniform.';
            }
        } else {
            if (watchedFields.modifiers?.undercover) {
                 sourceText += 'I was wearing plain clothes.';
            } else {
                 sourceText += 'I was wearing plain clothes and was openly displaying my badge.';
            }
        }
        
        setValue('narrative.source', sourceText.trim());

    }, [
        watchedFields.modifiers?.markedUnit, 
        watchedFields.modifiers?.slicktop, 
        watchedFields.modifiers?.inUniform, 
        watchedFields.modifiers?.undercover, 
        watchedFields.modifiers?.inMetroUniform, 
        watchedFields.modifiers?.inG3Uniform, 
        watchedFields.incident?.date,
        JSON.stringify(watchedFields.officers),
        watchedFields.presets?.source,
        watchedFields.userModified?.source,
        setValue,
    ]);

    useEffect(() => {
        if (!watchedFields.presets?.investigation) return;
        if (watchedFields.userModified?.investigation) return;
        let investigationText = '';
        const time = watchedFields.incident?.time || '';
        const street = watchedFields.incident?.locationStreet || '';

        if(watchedFields.modifiers?.wasSuspectInVehicle) {
            const color = watchedFields.narrative?.vehicleColor || '';
            const model = watchedFields.narrative?.vehicleModel || '';
            const plate = watchedFields.narrative?.vehiclePlate ? `with ${watchedFields.narrative.vehiclePlate} plates` : 'with no plates';
            investigationText = `At approximately ${time} hours, I was driving on ${street} when I observed a ${color} ${model}, ${plate}.`;
        } else {
            investigationText = `At approximately ${time} hours, I was driving on ${street}`;
        }
        setValue('narrative.investigation', investigationText);
    }, [
        watchedFields.modifiers?.wasSuspectInVehicle,
        watchedFields.incident?.time,
        watchedFields.incident?.locationStreet,
        watchedFields.narrative?.vehicleColor,
        watchedFields.narrative?.vehicleModel,
        watchedFields.narrative?.vehiclePlate,
        watchedFields.presets?.investigation,
        watchedFields.userModified?.investigation,
        setValue,
    ]);

     useEffect(() => {
        if (!watchedFields.presets?.arrest) return;
        if (watchedFields.userModified?.arrest) return;
        let arrestText = '';
        const suspectName = watchedFields.arrestee?.name || 'the suspect';
        if (watchedFields.modifiers?.wasSuspectMirandized) {
            const understood = watchedFields.modifiers?.didSuspectUnderstandRights ? 'affirmatively' : 'negatively';
            arrestText += `I admonished ${suspectName} utilizing my Field Officer’s Notebook, reading the following, verbatim:\n“You have the right to remain silent. Anything you say may be used against you in a court of law. You have the right to the presence of an attorney during any questioning. If you cannot afford an attorney, one will be appointed to you, free of charge, before any questioning, if you want. Do you understand?”\n${suspectName} responded ${understood}.`;
        }

        const transportingRank = watchedFields.narrative?.transportingRank || '';
        const transportingName = watchedFields.narrative?.transportingName || '';
        
        if (watchedFields.modifiers?.didYouTransport) {
            arrestText += `\nI transported ${suspectName} to Mission Row Station.`;
        } else {
            arrestText += `\n${transportingRank} ${transportingName} transported ${suspectName} to Mission Row Station.`;
        }

        const chargesList = charges.map(c => {
            const details = penalCode?.[c.chargeId!];
            return details ? `${details.type}${c.class} ${details.id}. ${details.charge}` : 'an unknown charge';
        }).join(', ');

        arrestText += `\n${suspectName} was searched in front of a police vehicle, which was covered by the vehicle's Digital In-Car Video (DICV).`;
        arrestText += `\n${suspectName} was arrested for ${chargesList || 'the aforementioned charges'}.`;

        setValue('narrative.arrest', arrestText.trim() || '');
    }, [
        watchedFields.modifiers?.wasSuspectMirandized, 
        watchedFields.modifiers?.didSuspectUnderstandRights,
        watchedFields.modifiers?.didYouTransport,
        watchedFields.arrestee?.name,
        watchedFields.narrative?.transportingRank,
        watchedFields.narrative?.transportingName,
        charges,
        penalCode,
        watchedFields.presets?.arrest,
        watchedFields.userModified?.arrest,
        setValue,
    ]);

    useEffect(() => {
        if (!watchedFields.presets?.photographs) return;
        if (watchedFields.userModified?.photographs) return;
        let photosText = '';
        if (watchedFields.modifiers?.doYouHaveAVideo) {
            photosText += `My Digital In-Car Video (DICV) was activated during this investigation - ${watchedFields.narrative?.dicvsLink || ''}\n`;
        }
        if (watchedFields.modifiers?.didYouTakePhotographs) {
            photosText += `I took photographs using my Department-issued cell phone - ${watchedFields.narrative?.photosLink || ''}\n`;
        }
        if (watchedFields.modifiers?.didYouObtainCctvFootage) {
            photosText += `I obtained closed-circuit television (CCTV) footage - ${watchedFields.narrative?.cctvLink || ''}\n`;
        }
        if (watchedFields.modifiers?.thirdPartyVideoFootage) {
            photosText += `I obtained third party video footage - ${watchedFields.narrative?.thirdPartyLink || ''}\n`;
        }

        setValue('narrative.photographs', photosText.trim() || '');
    }, [
        watchedFields.modifiers?.doYouHaveAVideo,
        watchedFields.modifiers?.didYouTakePhotographs,
        watchedFields.modifiers?.didYouObtainCctvFootage,
        watchedFields.modifiers?.thirdPartyVideoFootage,
        watchedFields.narrative?.dicvsLink,
        watchedFields.narrative?.photosLink,
        watchedFields.narrative?.cctvLink,
        watchedFields.narrative?.thirdPartyLink,
        watchedFields.presets?.photographs,
        watchedFields.userModified?.photographs,
        setValue,
    ]);
    
    useEffect(() => {
        if (!watchedFields.presets?.booking) return;
        if (watchedFields.userModified?.booking) return;
        let bookingText = '';
        const suspectName = watchedFields.arrestee?.name || 'the suspect';
        const isFelony = charges.some(c => penalCode?.[c.chargeId!]?.type === 'F');

        const bookingRank = watchedFields.narrative?.bookingRank || '';
        const bookingName = watchedFields.narrative?.bookingName || '';

        const booker = watchedFields.modifiers?.didYouBook ? 'I' : `${bookingRank} ${bookingName}`;

        if (watchedFields.modifiers?.biometricsAlreadyOnFile) {
            bookingText = `${suspectName}'s full biometrics, including fingerprints and DNA, were already on file, streamlining the booking process.`;
        } else {
            bookingText += `${booker} booked ${suspectName} on all of the charges listed under the ARREST sub-heading.\n`;
            bookingText += `During booking, ${booker} took 10 fingerprint samples from ${suspectName} and entered them into the Automated Fingerprint Identification System (AFIS).\n`;
            if (isFelony) {
                bookingText += `As ${suspectName} was booked on a felony charge, ${booker} took a Bode SecurSwab 2 Deoxyribonucleic acid (DNA) profile from him.\n`;
                bookingText += `${booker} submitted this profile to the Combined DNA Index System (CODIS).`;
            }
        }
        setValue('narrative.booking', bookingText.trim());

    }, [
        watchedFields.modifiers?.didYouBook,
        watchedFields.modifiers?.biometricsAlreadyOnFile,
        watchedFields.arrestee?.name,
        watchedFields.narrative?.bookingRank,
        watchedFields.narrative?.bookingName,
        charges,
        penalCode,
        watchedFields.presets?.booking,
        watchedFields.userModified?.booking,
        setValue,
    ]);
    
    useEffect(() => {
        if (!watchedFields.presets?.evidence) return;
        if (watchedFields.userModified?.evidence) return;
        let evidenceText = "I booked all evidence into the Mission Row Station property room.\n";
        const evidenceLogs = watchedFields.evidenceLogs || [];
        evidenceLogs.forEach((log, index) => {
            if(log.logNumber || log.description || log.quantity) {
                 evidenceText += `Item ${index + 1} - ${log.logNumber || ''} - ${log.description || ''} (x${log.quantity || ''})\n`;
            }
        });
        setValue('narrative.evidence', evidenceText.trim());
    }, [JSON.stringify(watchedFields.evidenceLogs), watchedFields.presets?.evidence, watchedFields.userModified?.evidence, setValue]);

    useEffect(() => {
        if (!watchedFields.presets?.court) return;
        if (watchedFields.userModified?.court) return;
        const officers = watchedFields.officers || [];
        const primaryOfficer = officers[0];
        let courtText = '';

        if(primaryOfficer) {
            const rank = primaryOfficer.rank || '';
            const name = primaryOfficer.name || '';
            const badge = primaryOfficer.badgeNumber || '';
            courtText = `I, ${rank} ${name} #${badge}, can testify to the contents of this report.`;
        }

        if (officers.length > 1) {
            officers.slice(1).forEach(officer => {
                if(officer.name && officer.rank && officer.badgeNumber) {
                    courtText += `\n${officer.rank} ${officer.name} #${officer.badgeNumber} can also testify to the contents of this report.`;
                }
            });
        }
        setValue('narrative.court', courtText);
    }, [JSON.stringify(watchedFields.officers), watchedFields.presets?.court, watchedFields.userModified?.court, setValue]);


    useEffect(() => {
        if (!watchedFields.presets?.additional) return;
        if (watchedFields.userModified?.additional) return;
        const suspectName = watchedFields.arrestee?.name || '';
        const plea = watchedFields.narrative?.plea || 'Guilty';
        const additionalText = `(( ${suspectName} pled ${plea}. ))`;
        setValue('narrative.additional', additionalText);
    }, [
        watchedFields.arrestee?.name,
        watchedFields.narrative?.plea,
        watchedFields.presets?.additional,
        watchedFields.userModified?.additional,
        setValue
    ]);

    const handlePresetToggle = (presetName: keyof FormState['presets']) => {
        const isEnabled = !getValues(`presets.${presetName}`);
        setValue(`presets.${presetName}`, isEnabled);
        setPreset(presetName, isEnabled);
        
        if (!isEnabled && !getValues(`userModified.${presetName}`)) {
            setValue(`narrative.${presetName}`, '');
        }
        saveForm();
    };
    
    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        field: keyof FormState['narrative'] & keyof FormState['userModified']
    ) => {
        const value = e.target.value;
        setValue(`narrative.${field}`, value);
        
        if (value) {
            setValue(`userModified.${field}`, true);
            setUserModified(field, true);
        } else {
            setValue(`userModified.${field}`, false);
            setUserModified(field, false);
        }
        saveForm();
    };

    const isInitialLoad = useRef(true);
    useEffect(() => {
        if (isInitialLoad.current) {
            const mergedFormData: FormState = {
                ...sessionFormData,
                modifiers: { ...modifiers, ...sessionFormData.modifiers },
                presets: { ...presets, ...sessionFormData.presets },
                userModified: { ...userModified, ...sessionFormData.userModified },
                narrative: { ...persistentNarrative, ...sessionFormData.narrative },
            };
    
            if (!mergedFormData.officers || mergedFormData.officers.length === 0) {
                const defaultOfficer = officersFromStore.length > 0 ? { ...officersFromStore[0] } : { id: Date.now(), name: '', rank: '', department: '', badgeNumber: '' };
                mergedFormData.officers = [defaultOfficer as FormOfficer];
            } else {
                 const defaultOfficerFromStore = officersFromStore.find(o => o.id === mergedFormData.officers[0].id);
                 if(defaultOfficerFromStore) {
                     mergedFormData.officers[0] = { ...defaultOfficerFromStore, ...mergedFormData.officers[0] };
                 }
            }

            if (!mergedFormData.persons || mergedFormData.persons.length === 0) {
                mergedFormData.persons = [{ name: '', sex: '', gang: '' }];
            }
            if(!mergedFormData.incident.date) mergedFormData.incident.date = format(new Date(), 'dd/MMM/yyyy').toUpperCase();
            if(!mergedFormData.incident.time) mergedFormData.incident.time = format(new Date(), 'HH:mm');
            
            if (!mergedFormData.evidenceLogs || mergedFormData.evidenceLogs.length === 0) {
                mergedFormData.evidenceLogs = [{logNumber: '', description: '', quantity: '1'}];
            }
    
            reset(mergedFormData);
            
            isInitialLoad.current = false;
        }
    }, [reset, sessionFormData, modifiers, presets, userModified, persistentNarrative, officersFromStore]);


    const handlePillClick = (officerIndex: number, altChar: Officer) => {
        const currentOfficerInForm = getValues(`officers.${officerIndex}`);
        swapOfficerInStore(currentOfficerInForm.id!, altChar);

        const swappedOfficer = useOfficerStore.getState().officers.find(o => o.id === currentOfficerInForm.id);
        if (swappedOfficer) {
            updateOfficerField(officerIndex, swappedOfficer);
        }
        saveForm(); 
    }
    
    const onAddOfficerClick = () => {
        appendOfficer({ name: '', rank: '', department: '', badgeNumber: '' });
    }

    useEffect(() => {
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
    }, []);

    const handleRankChange = (index: number, value: string) => {
        const [department, rank] = value.split('__');
        setValue(`officers.${index}.department`, department, { shouldDirty: true });
        setValue(`officers.${index}.rank`, rank, { shouldDirty: true });
        saveForm();
    };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} onBlur={saveForm}>
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
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => handleRankChange(index, value)}
                                        value={field.value && getValues(`officers.${index}.department`) ? `${getValues(`officers.${index}.department`)}__${field.value}`: ''}
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
                           {index > 0 && <Button variant="ghost" size="icon" type="button" onClick={() => removeOfficerField(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                        </TableCell>
                    </TableRow>
                    {index === 0 && alternativeCharacters.length > 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="p-2">
                                <div className="flex flex-wrap gap-2">
                                    {alternativeCharacters.filter(alt => alt.name).map((altChar) => {
                                        const currentOfficer = getValues('officers.0');
                                        if (!currentOfficer) return null;
                                        const isSelected = currentOfficer.badgeNumber === altChar.badgeNumber;
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
                    <Button className="w-full" type="button" onClick={onAddOfficerClick}>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-2 p-2">
                        <div className="flex items-center space-x-2"><Controller name="modifiers.markedUnit" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="markedUnit" />} /><Label htmlFor="markedUnit">Marked Unit?</Label></div>
                        {watchedFields.modifiers?.markedUnit && <div className="flex items-center space-x-2"><Controller name="modifiers.slicktop" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="slicktop" />} /><Label htmlFor="slicktop">Slicktop?</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.inUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inUniform" />} /><Label htmlFor="inUniform">In Uniform?</Label></div>
                        {!watchedFields.modifiers?.inUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.undercover" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="undercover" />} /><Label htmlFor="undercover">Undercover?</Label></div>}
                        {watchedFields.modifiers?.inUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.inMetroUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inMetroUniform" />} /><Label htmlFor="inMetroUniform">In Metro Uniform?</Label></div>}
                        {watchedFields.modifiers?.inMetroUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.inG3Uniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inG3Uniform" />} /><Label htmlFor="inG3Uniform">In G3 Uniform?</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectInVehicle" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectInVehicle" />} /><Label htmlFor="wasSuspectInVehicle">Suspect In Vehicle?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectMirandized" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectMirandized" />} /><Label htmlFor="wasSuspectMirandized">Mirandized?</Label></div>
                        {watchedFields.modifiers?.wasSuspectMirandized && <div className="flex items-center space-x-2"><Controller name="modifiers.didSuspectUnderstandRights" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didSuspectUnderstandRights" />} /><Label htmlFor="didSuspectUnderstandRights">Understood Rights?</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.doYouHaveAVideo" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="doYouHaveAVideo" />} /><Label htmlFor="doYouHaveAVideo">Video?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTakePhotographs" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTakePhotographs" />} /><Label htmlFor="didYouTakePhotographs">Photographs?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouObtainCctvFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouObtainCctvFootage" />} /><Label htmlFor="didYouObtainCctvFootage">CCTV?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.thirdPartyVideoFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="thirdPartyVideoFootage" />} /><Label htmlFor="thirdPartyVideoFootage">3rd Party Video?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTransport" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTransport" />} /><Label htmlFor="didYouTransport">Did You Transport?</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouBook" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouBook" />} /><Label htmlFor="didYouBook">Did You Book?</Label></div>
                        {watchedFields.modifiers?.didYouBook && <div className="flex items-center space-x-2"><Controller name="modifiers.biometricsAlreadyOnFile" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="biometricsAlreadyOnFile" />} /><Label htmlFor="biometricsAlreadyOnFile">Biometrics On File?</Label></div>}
                    </div>
                  </TableCell>
                </TableRow>
                
                <NarrativeSection
                    title="SOURCE OF ACTIVITY"
                    presetName="source"
                    isChecked={!!watchedFields.presets?.source}
                    isUserModified={!!watchedFields.userModified?.source}
                    onToggle={() => handlePresetToggle('source')}
                >
                    <Textarea
                        value={watchedFields.narrative?.source}
                        onChange={(e) => handleTextareaChange(e, 'source')}
                        placeholder="Describe the source of the activity..."
                        rows={3}
                    />
                </NarrativeSection>

                <NarrativeSection
                    title="INVESTIGATION"
                    presetName="investigation"
                    isChecked={!!watchedFields.presets?.investigation}
                    isUserModified={!!watchedFields.userModified?.investigation}
                    onToggle={() => handlePresetToggle('investigation')}
                >
                    {watchedFields.modifiers?.wasSuspectInVehicle &&
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <Input placeholder="VEHICLE COLOR" {...register('narrative.vehicleColor')} />
                            <Input placeholder="VEHICLE MODEL" {...register('narrative.vehicleModel')} />
                            <Input placeholder="VEHICLE PLATE" {...register('narrative.vehiclePlate')} />
                        </div>
                    }
                    <Textarea
                        value={watchedFields.narrative?.investigation}
                        onChange={(e) => handleTextareaChange(e, 'investigation')}
                        placeholder="Describe the investigation..."
                        rows={3}
                    />
                </NarrativeSection>

                <NarrativeSection
                    title="ARREST"
                    presetName="arrest"
                    isChecked={!!watchedFields.presets?.arrest}
                    isUserModified={!!watchedFields.userModified?.arrest}
                    onToggle={() => handlePresetToggle('arrest')}
                >
                    {!watchedFields.modifiers?.didYouTransport && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input placeholder="TRANSPORTING OFFICER RANK" {...register('narrative.transportingRank')} />
                            <Input placeholder="TRANSPORTING OFFICER NAME" {...register('narrative.transportingName')} />
                        </div>
                    )}
                    <Textarea
                        value={watchedFields.narrative?.arrest}
                        onChange={(e) => handleTextareaChange(e, 'arrest')}
                        placeholder="Describe the arrest..."
                        rows={3}
                    />
                </NarrativeSection>
                
                <NarrativeSection
                    title="PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING"
                    presetName="photographs"
                    isChecked={!!watchedFields.presets?.photographs}
                    isUserModified={!!watchedFields.userModified?.photographs}
                    onToggle={() => handlePresetToggle('photographs')}
                >
                    {watchedFields.modifiers?.doYouHaveAVideo || watchedFields.modifiers?.didYouTakePhotographs || watchedFields.modifiers?.didYouObtainCctvFootage || watchedFields.modifiers?.thirdPartyVideoFootage ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                             {watchedFields.modifiers.doYouHaveAVideo && <Input placeholder="DICVS Footage Link" {...register('narrative.dicvsLink')} />}
                             {watchedFields.modifiers.didYouTakePhotographs && <Input placeholder="Photographs Link" {...register('narrative.photosLink')} />}
                             {watchedFields.modifiers.didYouObtainCctvFootage && <Input placeholder="CCTV Footage Link" {...register('narrative.cctvLink')} />}
                             {watchedFields.modifiers.thirdPartyVideoFootage && <Input placeholder="Third Party Footage Link" {...register('narrative.thirdPartyLink')} />}
                        </div>
                        <Textarea
                            value={watchedFields.narrative?.photographs}
                            onChange={(e) => handleTextareaChange(e, 'photographs')}
                            placeholder="Describe video or photographic evidence..."
                            rows={3}
                        />
                    </>
                     ) : (
                        <Textarea placeholder="(( You may use this section if you don't have a video recording of what happened. Describe what the dashcam would capture. If you have a video, select 'Do You Have A Video?' in the Arrest Report Modifiers. Lying in this section will lead to OOC punishments. ))" rows={3} />
                     )}
                </NarrativeSection>

                <NarrativeSection
                    title="BOOKING"
                    presetName="booking"
                    isChecked={!!watchedFields.presets?.booking}
                    isUserModified={!!watchedFields.userModified?.booking}
                    onToggle={() => handlePresetToggle('booking')}
                >
                    {!watchedFields.modifiers?.didYouBook && (
                         <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input placeholder="BOOKING OFFICER RANK" {...register('narrative.bookingRank')} />
                            <Input placeholder="BOOKING OFFICER NAME" {...register('narrative.bookingName')} />
                        </div>
                    )}
                    <Textarea
                        value={watchedFields.narrative?.booking}
                        onChange={(e) => handleTextareaChange(e, 'booking')}
                        placeholder="Describe booking details..."
                        rows={3}
                    />
                </NarrativeSection>
                
                 <NarrativeSection
                    title="PHYSICAL EVIDENCE"
                    presetName="evidence"
                    isChecked={!!watchedFields.presets?.evidence}
                    isUserModified={!!watchedFields.userModified?.evidence}
                    onToggle={() => handlePresetToggle('evidence')}
                 >
                    <Table>
                        <EvidenceLog control={control} register={register} fields={evidenceLogFields} onRemove={removeEvidenceLogField} onAdd={() => appendEvidenceLog({ logNumber: '', description: '', quantity: '1'})} onKeyUp={saveForm} />
                    </Table>
                    <Textarea
                        value={watchedFields.narrative?.evidence}
                        onChange={(e) => handleTextareaChange(e, 'evidence')}
                        placeholder="Describe physical evidence..."
                        rows={3}
                    />
                </NarrativeSection>

                <NarrativeSection
                    title="COURT INFORMATION"
                    presetName="court"
                    isChecked={!!watchedFields.presets?.court}
                    isUserModified={!!watchedFields.userModified?.court}
                    onToggle={() => handlePresetToggle('court')}
                >
                    <Textarea
                        value={watchedFields.narrative?.court}
                        onChange={(e) => handleTextareaChange(e, 'court')}
                        placeholder="Information for the court..."
                        rows={3}
                    />
                </NarrativeSection>

                 <NarrativeSection
                    title="ADDITIONAL INFORMATION"
                    presetName="additional"
                    isChecked={!!watchedFields.presets?.additional}
                    isUserModified={!!watchedFields.userModified?.additional}
                    onToggle={() => handlePresetToggle('additional')}
                 >
                     <Controller
                        name="narrative.plea"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
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
                    <Textarea
                        value={watchedFields.narrative?.additional}
                        onChange={(e) => handleTextareaChange(e, 'additional')}
                        placeholder="Additional information..."
                        rows={3}
                    />
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
