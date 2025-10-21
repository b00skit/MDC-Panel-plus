
'use client';

import React, { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
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
import { CirclePlus, Trash2, Calendar, Clock, Radio } from 'lucide-react';
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
import { useSettingsStore } from '@/stores/settings-store';
import { formatInTimeZone } from 'date-fns-tz';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { EvidenceLog, NarrativeSection } from './narrative-sections';
import configData from '../../../data/config.json';
import { getGtawDataUrl } from '@/lib/gtaw-data';
import { useI18n } from '@/lib/i18n/client';

interface DeptRanks {
  [department: string]: string[];
}

type PleaKey = 'guilty' | 'notGuilty' | 'noContest' | 'requiredCase';
const PLEA_KEYS: PleaKey[] = ['guilty', 'notGuilty', 'noContest', 'requiredCase'];

export const AdvancedArrestReportForm = forwardRef((props, ref) => {
    const router = useRouter();
    const { t, locale } = useI18n();
    // Session state for the current report
    const { formData: sessionFormData, setFields: setSessionFields } = useAdvancedReportStore();
    // Persistent state for user preferences
    const { modifiers, presets, userModified, narrative: persistentNarrative, setModifiersState, setNarrativeField, setPreset, setUserModified } = useAdvancedReportModifiersStore();

    const { report: charges, penalCode } = useChargeStore();
    const { officers: officersFromStore, predefinedOfficers, updateOfficer: updateOfficerInStore, alternativeCharacters, swapOfficer: swapOfficerInStore, setInitialOfficers } = useOfficerStore();
    const { predefinedCallsigns, defaultCallsignId } = useSettingsStore();
    
    const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm<FormState>({
        // Default values will be populated by the useEffect hook
    });

    const isLSSD = watch('officers.0.department') === "Los Santos County Sheriff's Department";
    
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

    useImperativeHandle(ref, () => ({
        saveForm
    }));


    const handleFormSubmit = () => {
        saveForm();
        router.push('/arrest-submit?type=advanced');
    };
    
    // Auto-population from modifiers
    const parsePleaKey = useCallback((value?: string): PleaKey => {
        const baseMap: Record<string, PleaKey> = {
            guilty: 'guilty',
            'not guilty': 'notGuilty',
            'no contest': 'noContest',
            'required case': 'requiredCase',
        };

        PLEA_KEYS.forEach((key) => {
            const translated = t(`arrestReport.advancedForm.pleas.${key}`).toLowerCase();
            baseMap[translated] = key;
        });

        if (!value) return 'guilty';

        if (PLEA_KEYS.includes(value as PleaKey)) {
            return value as PleaKey;
        }

        const normalized = value.trim().toLowerCase();
        return baseMap[normalized] ?? 'guilty';
    }, [t]);

    useEffect(() => {
        const officers = watchedFields.officers;
        const primaryOfficer = officers?.[0];
        if (!primaryOfficer || !watchedFields.presets?.source) return;
        if (watchedFields.userModified?.source) return;


        const date = watchedFields.incident?.date || formatInTimeZone(new Date(), 'UTC', 'dd/MMM/yyyy').toUpperCase();
        const rank = primaryOfficer.rank || '';
        const name = primaryOfficer.name || '';
        const badge = primaryOfficer.badgeNumber || '';
        const divDetail = primaryOfficer.divDetail || '';
        const callsign = primaryOfficer.callSign || '';

        const sourceParts: string[] = [];

        if (officers && officers.length > 1) {
            const partners = officers.slice(1).filter(p => p.name || p.badgeNumber || p.divDetail);
            if (partners.length > 0) {
                const partnerDetails = partners.map(p =>
                    t('arrestReport.advancedForm.presets.source.partnerDetail', {
                        rank: p.rank || '',
                        name: p.name || '',
                        badge: p.badgeNumber || '',
                        divDetail: p.divDetail || '',
                    })
                );
                const partnerFormatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
                const partnerStr = partnerFormatter.format(partnerDetails);
                sourceParts.push(
                    t('arrestReport.advancedForm.presets.source.withPartners', {
                        date,
                        rank,
                        name,
                        badge,
                        divDetail,
                        partners: partnerStr,
                        callsign,
                    })
                );
            } else {
                sourceParts.push(
                    t('arrestReport.advancedForm.presets.source.singleOfficer', {
                        date,
                        rank,
                        name,
                        badge,
                        divDetail,
                        callsign,
                    })
                );
            }
        } else {
            sourceParts.push(
                t('arrestReport.advancedForm.presets.source.singleOfficer', {
                    date,
                    rank,
                    name,
                    badge,
                    divDetail,
                    callsign,
                })
            );
        }

        if (watchedFields.modifiers?.markedUnit) {
            sourceParts.push(
                watchedFields.modifiers?.slicktop
                    ? t('arrestReport.advancedForm.presets.source.vehicleMarkedSlicktop')
                    : t('arrestReport.advancedForm.presets.source.vehicleMarkedLightbar')
            );
        } else {
            sourceParts.push(t('arrestReport.advancedForm.presets.source.vehicleUnmarked'));
        }

        if (watchedFields.modifiers?.inUniform) {
            if (watchedFields.modifiers?.inG3Uniform) {
                const uniformType = isLSSD
                    ? t('arrestReport.advancedForm.presets.source.uniforms.g3.lssd')
                    : t('arrestReport.advancedForm.presets.source.uniforms.g3.lspd');
                sourceParts.push(
                    t('arrestReport.advancedForm.presets.source.uniformWithBadge', { uniform: uniformType })
                );
            } else if (watchedFields.modifiers?.inMetroUniform) {
                const uniformType = isLSSD
                    ? t('arrestReport.advancedForm.presets.source.uniforms.bdu.lssd')
                    : t('arrestReport.advancedForm.presets.source.uniforms.bdu.lspd');
                sourceParts.push(
                    t('arrestReport.advancedForm.presets.source.uniformWithBadge', { uniform: uniformType })
                );
            } else {
                sourceParts.push(t('arrestReport.advancedForm.presets.source.patrolUniform'));
            }
        } else if (watchedFields.modifiers?.undercover) {
            sourceParts.push(t('arrestReport.advancedForm.presets.source.plainClothes'));
        } else {
            sourceParts.push(t('arrestReport.advancedForm.presets.source.plainClothesBadge'));
        }

        setValue('narrative.source', sourceParts.filter(Boolean).join(' '));

    }, [
        isLSSD,
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
        locale,
        t,
        setValue,
    ]);

    useEffect(() => {
        if (!watchedFields.presets?.investigation) return;
        if (watchedFields.userModified?.investigation) return;
        const time = watchedFields.incident?.time || '';
        const street = watchedFields.incident?.locationStreet || '';

        let investigationText = '';

        if(watchedFields.modifiers?.wasSuspectInVehicle) {
            const color = watchedFields.narrative?.vehicleColor || '';
            const model = watchedFields.narrative?.vehicleModel || '';
            const plate = watchedFields.narrative?.vehiclePlate
                ? t('arrestReport.advancedForm.presets.investigation.plateKnown', { plate: watchedFields.narrative.vehiclePlate })
                : t('arrestReport.advancedForm.presets.investigation.plateUnknown');
            investigationText = t('arrestReport.advancedForm.presets.investigation.vehicleObserved', {
                time,
                street,
                color,
                model,
                plate,
            });
        } else {
            investigationText = t('arrestReport.advancedForm.presets.investigation.onPatrol', {
                time,
                street,
            });
        }
        setValue('narrative.investigation', investigationText.trim());
    }, [
        watchedFields.modifiers?.wasSuspectInVehicle,
        watchedFields.incident?.time,
        watchedFields.incident?.locationStreet,
        watchedFields.narrative?.vehicleColor,
        watchedFields.narrative?.vehicleModel,
        watchedFields.narrative?.vehiclePlate,
        watchedFields.presets?.investigation,
        watchedFields.userModified?.investigation,
        t,
        setValue,
    ]);

    useEffect(() => {
        if (!watchedFields.presets?.arrest) return;
        if (watchedFields.userModified?.arrest) return;
        const arrestParts: string[] = [];
        const suspectName = watchedFields.arrestee?.name || t('arrestReport.advancedForm.presets.arrest.defaultSuspect');
        if (watchedFields.modifiers?.wasSuspectMirandized) {
            const notebookType = isLSSD
                ? t('arrestReport.advancedForm.presets.arrest.notebooks.lssd')
                : t('arrestReport.advancedForm.presets.arrest.notebooks.lspd');
            const understood = watchedFields.modifiers?.didSuspectUnderstandRights
                ? t('arrestReport.advancedForm.presets.arrest.responses.affirmative')
                : t('arrestReport.advancedForm.presets.arrest.responses.negative');
            arrestParts.push(
                t('arrestReport.advancedForm.presets.arrest.miranda', {
                    suspectName,
                    notebookType,
                    understood,
                })
            );
        }

        const transportingRank = watchedFields.narrative?.transportingRank || '';
        const transportingName = watchedFields.narrative?.transportingName || '';

        const station = isLSSD
            ? t('arrestReport.advancedForm.presets.arrest.stations.lssd')
            : t('arrestReport.advancedForm.presets.arrest.stations.lspd');
        if (watchedFields.modifiers?.didYouTransport) {
            arrestParts.push(t('arrestReport.advancedForm.presets.arrest.transportSelf', { suspectName, station }));
        } else {
            arrestParts.push(
                t('arrestReport.advancedForm.presets.arrest.transportOther', {
                    suspectName,
                    station,
                    transportingRank,
                    transportingName,
                })
            );
        }

        const chargesList = charges
            .map(c => {
                const details = penalCode?.[c.chargeId!];
                return details
                    ? `${details.type}${c.class} ${details.id}. ${details.charge}`
                    : t('arrestReport.advancedForm.unknownCharge');
            })
            .join(', ');

        arrestParts.push(t('arrestReport.advancedForm.presets.arrest.searched', { suspectName }));
        arrestParts.push(
            t('arrestReport.advancedForm.presets.arrest.arrestedFor', {
                suspectName,
                charges: chargesList || t('arrestReport.advancedForm.presets.arrest.aforementionedCharges'),
            })
        );

        setValue('narrative.arrest', arrestParts.filter(Boolean).join('\n').trim());
    }, [
        isLSSD,
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
        t,
        setValue,
    ]);

    useEffect(() => {
        if (!watchedFields.presets?.photographs) return;
        if (watchedFields.userModified?.photographs) return;

        const photoLines: string[] = [];
        if (watchedFields.modifiers?.doYouHaveAVideo) {
            photoLines.push(
                t('arrestReport.advancedForm.presets.photographs.dicv', {
                    link: watchedFields.narrative?.dicvsLink || '',
                })
            );
        }
        if (watchedFields.modifiers?.didYouTakePhotographs) {
            photoLines.push(
                t('arrestReport.advancedForm.presets.photographs.photos', {
                    link: watchedFields.narrative?.photosLink || '',
                })
            );
        }
        if (watchedFields.modifiers?.didYouObtainCctvFootage) {
            photoLines.push(
                t('arrestReport.advancedForm.presets.photographs.cctv', {
                    link: watchedFields.narrative?.cctvLink || '',
                })
            );
        }
        if (watchedFields.modifiers?.thirdPartyVideoFootage) {
            photoLines.push(
                t('arrestReport.advancedForm.presets.photographs.thirdParty', {
                    link: watchedFields.narrative?.thirdPartyLink || '',
                })
            );
        }

        setValue('narrative.photographs', photoLines.join('\n').trim());
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
        t,
        setValue,
    ]);
    
    useEffect(() => {
        if (!watchedFields.presets?.booking) return;
        if (watchedFields.userModified?.booking) return;
        const suspectName = watchedFields.arrestee?.name || t('arrestReport.advancedForm.presets.arrest.defaultSuspect');
        const isFelony = charges.some(c => penalCode?.[c.chargeId!]?.type === 'F');

        const bookingRank = watchedFields.narrative?.bookingRank || '';
        const bookingName = watchedFields.narrative?.bookingName || '';

        const booker = watchedFields.modifiers?.didYouBook
            ? t('arrestReport.advancedForm.presets.booking.bookerSelf')
            : t('arrestReport.advancedForm.presets.booking.bookerOther', {
                  rank: bookingRank,
                  name: bookingName,
              });

        const bookingLines: string[] = [];

        if (watchedFields.modifiers?.biometricsAlreadyOnFile) {
            bookingLines.push(
                t('arrestReport.advancedForm.presets.booking.biometricsOnFile', {
                    suspectName,
                })
            );
        } else {
            bookingLines.push(
                t('arrestReport.advancedForm.presets.booking.booked', {
                    booker,
                    suspectName,
                })
            );
            bookingLines.push(
                t('arrestReport.advancedForm.presets.booking.fingerprints', {
                    booker,
                    suspectName,
                })
            );
            if (isFelony) {
                bookingLines.push(
                    t('arrestReport.advancedForm.presets.booking.dna', {
                        booker,
                        suspectName,
                    })
                );
                bookingLines.push(
                    t('arrestReport.advancedForm.presets.booking.codis', {
                        booker,
                    })
                );
            }
        }
        setValue('narrative.booking', bookingLines.join('\n').trim());

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
        t,
        setValue,
    ]);
    
    useEffect(() => {
        if (!watchedFields.presets?.evidence) return;
        if (watchedFields.userModified?.evidence) return;

        const propertyRoom = isLSSD
            ? t('arrestReport.advancedForm.presets.evidence.propertyRoom.lssd')
            : t('arrestReport.advancedForm.presets.evidence.propertyRoom.lspd');
        const evidenceLines = [
            t('arrestReport.advancedForm.presets.evidence.booked', {
                propertyRoom,
            }),
        ];

        const evidenceLogs = watchedFields.evidenceLogs || [];
        evidenceLogs.forEach((log, index) => {
            if(log.logNumber || log.description || log.quantity) {
                evidenceLines.push(
                    t('arrestReport.advancedForm.presets.evidence.item', {
                        index: index + 1,
                        logNumber: log.logNumber || '',
                        description: log.description || '',
                        quantity: log.quantity || '',
                    })
                );
            }
        });
        setValue('narrative.evidence', evidenceLines.join('\n').trim());
    }, [isLSSD, JSON.stringify(watchedFields.evidenceLogs), watchedFields.presets?.evidence, watchedFields.userModified?.evidence, t, setValue]);

    useEffect(() => {
        if (!watchedFields.presets?.court) return;
        if (watchedFields.userModified?.court) return;
        const officers = watchedFields.officers || [];
        const primaryOfficer = officers[0];
        const courtLines: string[] = [];

        if(primaryOfficer) {
            const rank = primaryOfficer.rank || '';
            const name = primaryOfficer.name || '';
            const badge = primaryOfficer.badgeNumber || '';
            courtLines.push(
                t('arrestReport.advancedForm.presets.court.primary', {
                    rank,
                    name,
                    badge,
                })
            );
        }

        if (officers.length > 1) {
            officers.slice(1).forEach(officer => {
                if(officer.name && officer.rank && officer.badgeNumber) {
                    courtLines.push(
                        t('arrestReport.advancedForm.presets.court.additional', {
                            rank: officer.rank,
                            name: officer.name,
                            badge: officer.badgeNumber,
                        })
                    );
                }
            });
        }
        setValue('narrative.court', courtLines.join('\n'));
    }, [JSON.stringify(watchedFields.officers), watchedFields.presets?.court, watchedFields.userModified?.court, t, setValue]);


    useEffect(() => {
        if (!watchedFields.presets?.additional) return;
        if (watchedFields.userModified?.additional) return;
        const suspectName = watchedFields.arrestee?.name || '';
        const pleaKey = parsePleaKey(watchedFields.narrative?.plea);
        const plea = t(`arrestReport.advancedForm.pleas.${pleaKey}`);
        const additionalText = t('arrestReport.advancedForm.presets.additional.plea', {
            suspectName,
            plea,
        });
        setValue('narrative.additional', additionalText);
    }, [
        watchedFields.arrestee?.name,
        watchedFields.narrative?.plea,
        watchedFields.presets?.additional,
        watchedFields.userModified?.additional,
        setValue,
        parsePleaKey,
        t,
    ]);

    useEffect(() => {
        if (!watchedFields.narrative?.plea) return;
        const parsedPlea = parsePleaKey(watchedFields.narrative?.plea);
        if (watchedFields.narrative?.plea !== parsedPlea) {
            setValue('narrative.plea', parsedPlea);
        }
    }, [watchedFields.narrative?.plea, parsePleaKey, setValue]);

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
        setInitialOfficers();
    }, [setInitialOfficers]);

    useEffect(() => {
        const defaultCallsign = predefinedCallsigns.find(c => c.id === defaultCallsignId)?.value || '';

        if (isInitialLoad.current && (officersFromStore.length > 0 || predefinedOfficers.length > 0)) {
            const mergedFormData: FormState = {
                ...sessionFormData,
                modifiers: { ...modifiers, ...(sessionFormData as FormState).modifiers },
                presets: { ...presets, ...(sessionFormData as FormState).presets },
                userModified: { ...userModified, ...(sessionFormData as FormState).userModified },
                narrative: { ...persistentNarrative, ...(sessionFormData as FormState).narrative },
            };

            if (!mergedFormData.officers || mergedFormData.officers.length === 0) {
                if (officersFromStore.length > 0) {
                    mergedFormData.officers = officersFromStore.map(o => ({ ...o, callSign: o.callSign || defaultCallsign }));
                } else if (predefinedOfficers.length > 0) {
                    mergedFormData.officers = predefinedOfficers.map(o => ({ ...o, callSign: defaultCallsign }));
                } else {
                    mergedFormData.officers = [{
                        id: Date.now(),
                        name: '',
                        rank: '',
                        department: '',
                        badgeNumber: '',
                        callSign: defaultCallsign,
                    }];
                }
            } else {
                const defaultOfficerFromStore = officersFromStore.find(o => o.id === mergedFormData.officers[0].id);
                if (defaultOfficerFromStore) {
                    mergedFormData.officers[0] = {
                        ...defaultOfficerFromStore,
                        ...mergedFormData.officers[0],
                        callSign: defaultCallsign,
                    };
                }
            }

            if (!mergedFormData.persons || mergedFormData.persons.length === 0) {
                mergedFormData.persons = [{ name: '', sex: '', gang: '' }];
            }

            if (!mergedFormData.incident.date) mergedFormData.incident.date = formatInTimeZone(new Date(), 'UTC', 'dd/MMM/yyyy').toUpperCase();
            if (!mergedFormData.incident.time) mergedFormData.incident.time = formatInTimeZone(new Date(), 'UTC', 'HH:mm');

            if (!mergedFormData.evidenceLogs || mergedFormData.evidenceLogs.length === 0) {
                mergedFormData.evidenceLogs = [{ logNumber: '', description: '', quantity: '1' }];
            }

            reset(mergedFormData);

            isInitialLoad.current = false;
        }
    }, [reset, sessionFormData, modifiers, presets, userModified, persistentNarrative, officersFromStore, predefinedOfficers, predefinedCallsigns, defaultCallsignId]);


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
        const defaultCallsign = predefinedCallsigns.find(c => c.id === defaultCallsignId)?.value || '';
        appendOfficer({ name: '', rank: '', department: '', badgeNumber: '', callSign: defaultCallsign });
    }

    useEffect(() => {
        fetch('/data/faction_ranks.json')
            .then((res) => res.json())
            .then((data) => setDeptRanks(data));

        fetch(getGtawDataUrl('gtaw_locations.json'))
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
                  <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.headers.arresteeName')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.sex')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.hair')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.eyes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.placeholders.arresteeName')} {...register("arrestee.name")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.sex')} maxLength={1} {...register("arrestee.sex")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.hair')} {...register("arrestee.hair")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.eyes')} {...register("arrestee.eyes")} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.headers.residence')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.age')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.height')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.descent')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.placeholders.residence')} {...register("arrestee.residence")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.age')} type="number" {...register("arrestee.age")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.height')} {...register("arrestee.height")} /></TableCell>
                  <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.descent')} {...register("arrestee.descent")} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={3}>{t('arrestReport.advancedForm.headers.clothing')}</TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.headers.oddities')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}><Input placeholder={t('arrestReport.advancedForm.placeholders.clothing')} {...register("arrestee.clothing")} /></TableCell>
                  <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.placeholders.oddities')} {...register("arrestee.oddities")} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={3}>{t('arrestReport.advancedForm.headers.alias')}</TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.headers.gang')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}><Input placeholder={t('arrestReport.advancedForm.placeholders.alias')} {...register("arrestee.alias")} /></TableCell>
                  <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.placeholders.gang')} {...register("arrestee.gang")} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={5}>{t('arrestReport.advancedForm.headers.charges')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="p-2">
                    <Textarea readOnly className="bg-muted min-h-[auto]" value={charges.map(c => {
                        const details = penalCode?.[c.chargeId!];
                        if (!details) return t('arrestReport.advancedForm.unknownCharge');
                        return `${details.type}${c.class} ${details.id}. ${details.charge}`;
                    }).join('\n') || t('arrestReport.advancedForm.noChargesSelected')} rows={charges.length || 1} />
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>{t('arrestReport.advancedForm.headers.personsWithSubject')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.name')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.sex')}</TableHead>
                  <TableHead className="bg-secondary" colSpan={2}>{t('arrestReport.advancedForm.headers.gangMoniker')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.remove')}</TableHead>
                </TableRow>
                 {personFields.map((field, index) => (
                    <TableRow key={field.id}>
                        <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.name', { index: index + 1 })} {...register(`persons.${index}.name`)} /></TableCell>
                        <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.sex')} {...register(`persons.${index}.sex`)} maxLength={1}/></TableCell>
                        <TableCell colSpan={2}><Input placeholder={t('arrestReport.advancedForm.placeholders.gangMoniker')} {...register(`persons.${index}.gang`)} /></TableCell>
                        <TableCell><Button variant="destructive" className="w-full" type="button" onClick={() => removePersonField(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                 ))}
                <TableRow>
                  <TableCell colSpan={5} className="p-2">
                    <Button className="w-full" type="button" onClick={() => appendPerson({ name: '', sex: '', gang: '' })}>
                      <CirclePlus className="mr-2 h-4 w-4" /> {t('arrestReport.advancedForm.buttons.addPerson')}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>{t('arrestReport.advancedForm.headers.incidentSetting')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.date')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.time')}</TableHead>
                  <TableHead className="bg-secondary" colSpan={3}>{t('arrestReport.advancedForm.headers.location')}</TableHead>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={1}>
                        <div className="relative flex items-center">
                            <Calendar className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.date')} className="pl-9" {...register("incident.date")} />
                        </div>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <div className="relative flex items-center">
                            <Clock className="absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.time')} className="pl-9" {...register("incident.time")} />
                        </div>
                    </TableCell>
                  <TableCell colSpan={3}>
                     <div className="flex gap-2">
                        <Controller control={control} name="incident.locationDistrict" render={({ field }) => (
                            <Combobox options={locations.districts} value={field.value} onChange={field.onChange} placeholder={t('arrestReport.advancedForm.placeholders.district')} />
                        )} />
                         <Controller control={control} name="incident.locationStreet" render={({ field }) => (
                            <Combobox options={locations.streets} value={field.value} onChange={field.onChange} placeholder={t('arrestReport.advancedForm.placeholders.street')} />
                        )} />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary h-12" colSpan={5}>{t('arrestReport.advancedForm.headers.handlingOfficers', { officer: isLSSD ? 'Deputies' : 'Officer(s)'})}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.rank')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.name')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.badgeNo', { badge: isLSSD ? 'Badge' : 'Serial' })}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.callsign')}</TableHead>
                  <TableHead className="bg-secondary">{t('arrestReport.advancedForm.headers.divDetail', { div: isLSSD ? 'Unit' : 'Div' })}</TableHead>
                </TableRow>
                {officerFields.map((field, index) => (
                    <React.Fragment key={field.id}>
                    <TableRow>
                        <TableCell>
                            <Controller control={control} name={`officers.${index}.rank`} render={({ field }) => (
                                <Select onValueChange={(value) => handleRankChange(index, value)} value={field.value && getValues(`officers.${index}.department`) ? `${getValues(`officers.${index}.department`)}__${field.value}`: ''}>
                                    <SelectTrigger><SelectValue placeholder={t('arrestReport.advancedForm.placeholders.rank')} /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(deptRanks).map(([dept, ranks]) => (
                                            <SelectGroup key={dept}>
                                                <SelectLabel>{dept}</SelectLabel>
                                                {ranks.map(rank => <SelectItem key={`${dept}-${rank}`} value={`${dept}__${rank}`}>{rank}</SelectItem>)}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </TableCell>
                        <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.officer', { index: index + 1 })} {...register(`officers.${index}.name`)} /></TableCell>
                        <TableCell><Input placeholder={t('arrestReport.advancedForm.placeholders.badgeNo', { badge: isLSSD ? 'Badge' : 'Serial' })} type="number" {...register(`officers.${index}.badgeNumber`)} /></TableCell>
                        <TableCell>
                            <Controller name={`officers.${index}.callSign`} control={control} render={({ field: { onChange, value } }) => (
                                <div className="relative flex items-center">
                                    {predefinedCallsigns.length > 0 ? (
                                        <Combobox options={predefinedCallsigns.map(c => c.value)} value={value || ''} onChange={onChange} placeholder={t('arrestReport.advancedForm.placeholders.callsign')} className="w-full" />
                                    ) : (
                                        <Input placeholder={t('arrestReport.advancedForm.placeholders.callsign')} value={value || ''} onChange={(e) => onChange(e.target.value)} />
                                    )}
                                </div>
                            )} />
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Input placeholder={t('arrestReport.advancedForm.placeholders.divDetail', { div: isLSSD ? 'Unit' : 'Div' })} {...register(`officers.${index}.divDetail`)} />
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
                                                <Badge key={altChar.id} variant="outline" className="cursor-pointer hover:bg-accent" onClick={() => handlePillClick(0, altChar)}>
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
                      <CirclePlus className="mr-2 h-4 w-4" /> {t('arrestReport.advancedForm.buttons.addOfficer', { officer: isLSSD ? 'Deputy' : 'Officer' })}
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="h-3" />
                <TableRow>
                  <TableHead className="bg-secondary" colSpan={5}>{t('arrestReport.advancedForm.headers.modifiers')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted p-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-2 p-2">
                        <div className="flex items-center space-x-2"><Controller name="modifiers.markedUnit" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="markedUnit" />} /><Label htmlFor="markedUnit">{t('arrestReport.advancedForm.modifiers.markedUnit')}</Label></div>
                        {watchedFields.modifiers?.markedUnit && <div className="flex items-center space-x-2"><Controller name="modifiers.slicktop" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="slicktop" />} /><Label htmlFor="slicktop">{t('arrestReport.advancedForm.modifiers.slicktop')}</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.inUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inUniform" />} /><Label htmlFor="inUniform">{t('arrestReport.advancedForm.modifiers.inUniform')}</Label></div>
                        {!watchedFields.modifiers?.inUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.undercover" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="undercover" />} /><Label htmlFor="undercover">{t('arrestReport.advancedForm.modifiers.undercover')}</Label></div>}
                        {watchedFields.modifiers?.inUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.inMetroUniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inMetroUniform" />} /><Label htmlFor="inMetroUniform">{t('arrestReport.advancedForm.modifiers.inMetroUniform', { metro: isLSSD ? 'SEB' : 'Metro' })}</Label></div>}
                        {watchedFields.modifiers?.inMetroUniform && <div className="flex items-center space-x-2"><Controller name="modifiers.inG3Uniform" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="inG3Uniform" />} /><Label htmlFor="inG3Uniform">{t('arrestReport.advancedForm.modifiers.inG3Uniform')}</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectInVehicle" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectInVehicle" />} /><Label htmlFor="wasSuspectInVehicle">{t('arrestReport.advancedForm.modifiers.suspectInVehicle')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.wasSuspectMirandized" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="wasSuspectMirandized" />} /><Label htmlFor="wasSuspectMirandized">{t('arrestReport.advancedForm.modifiers.mirandized')}</Label></div>
                        {watchedFields.modifiers?.wasSuspectMirandized && <div className="flex items-center space-x-2"><Controller name="modifiers.didSuspectUnderstandRights" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didSuspectUnderstandRights" />} /><Label htmlFor="didSuspectUnderstandRights">{t('arrestReport.advancedForm.modifiers.understoodRights')}</Label></div>}
                        <div className="flex items-center space-x-2"><Controller name="modifiers.doYouHaveAVideo" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="doYouHaveAVideo" />} /><Label htmlFor="doYouHaveAVideo">{t('arrestReport.advancedForm.modifiers.video')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTakePhotographs" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTakePhotographs" />} /><Label htmlFor="didYouTakePhotographs">{t('arrestReport.advancedForm.modifiers.photographs')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouObtainCctvFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouObtainCctvFootage" />} /><Label htmlFor="didYouObtainCctvFootage">{t('arrestReport.advancedForm.modifiers.cctv')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.thirdPartyVideoFootage" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="thirdPartyVideoFootage" />} /><Label htmlFor="thirdPartyVideoFootage">{t('arrestReport.advancedForm.modifiers.thirdPartyVideo')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouTransport" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouTransport" />} /><Label htmlFor="didYouTransport">{t('arrestReport.advancedForm.modifiers.transported')}</Label></div>
                        <div className="flex items-center space-x-2"><Controller name="modifiers.didYouBook" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="didYouBook" />} /><Label htmlFor="didYouBook">{t('arrestReport.advancedForm.modifiers.booked')}</Label></div>
                        {watchedFields.modifiers?.didYouBook && <div className="flex items-center space-x-2"><Controller name="modifiers.biometricsAlreadyOnFile" control={control} render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id="biometricsAlreadyOnFile" />} /><Label htmlFor="biometricsAlreadyOnFile">{t('arrestReport.advancedForm.modifiers.biometricsOnFile')}</Label></div>}
                    </div>
                  </TableCell>
                </TableRow>
                
                <NarrativeSection title={t('arrestReport.advancedForm.narrative.source.title')} presetName="source" isChecked={!!watchedFields.presets?.source} isUserModified={!!watchedFields.userModified?.source} onToggle={() => handlePresetToggle('source')} >
                    <Textarea value={watchedFields.narrative?.source} onChange={(e) => handleTextareaChange(e, 'source')} placeholder={t('arrestReport.advancedForm.narrative.source.placeholder')} rows={3} />
                </NarrativeSection>

                <NarrativeSection title={t('arrestReport.advancedForm.narrative.investigation.title')} presetName="investigation" isChecked={!!watchedFields.presets?.investigation} isUserModified={!!watchedFields.userModified?.investigation} onToggle={() => handlePresetToggle('investigation')}>
                    {watchedFields.modifiers?.wasSuspectInVehicle &&
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.vehicleColor')} {...register('narrative.vehicleColor')} />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.vehicleModel')} {...register('narrative.vehicleModel')} />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.vehiclePlate')} {...register('narrative.vehiclePlate')} />
                        </div>
                    }
                    <Textarea value={watchedFields.narrative?.investigation} onChange={(e) => handleTextareaChange(e, 'investigation')} placeholder={t('arrestReport.advancedForm.narrative.investigation.placeholder')} rows={3} />
                </NarrativeSection>

                <NarrativeSection title={t('arrestReport.advancedForm.narrative.arrest.title')} presetName="arrest" isChecked={!!watchedFields.presets?.arrest} isUserModified={!!watchedFields.userModified?.arrest} onToggle={() => handlePresetToggle('arrest')}>
                    {!watchedFields.modifiers?.didYouTransport && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.transportingRank')} {...register('narrative.transportingRank')} />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.transportingName')} {...register('narrative.transportingName')} />
                        </div>
                    )}
                    <Textarea value={watchedFields.narrative?.arrest} onChange={(e) => handleTextareaChange(e, 'arrest')} placeholder={t('arrestReport.advancedForm.narrative.arrest.placeholder')} rows={3} />
                </NarrativeSection>
                
                <NarrativeSection title={t('arrestReport.advancedForm.narrative.photographs.title')} presetName="photographs" isChecked={!!watchedFields.presets?.photographs} isUserModified={!!watchedFields.userModified?.photographs} onToggle={() => handlePresetToggle('photographs')}>
                    {watchedFields.modifiers?.doYouHaveAVideo || watchedFields.modifiers?.didYouTakePhotographs || watchedFields.modifiers?.didYouObtainCctvFootage || watchedFields.modifiers?.thirdPartyVideoFootage ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                             {watchedFields.modifiers.doYouHaveAVideo && <Input placeholder={t('arrestReport.advancedForm.placeholders.dicvsLink')} {...register('narrative.dicvsLink')} />}
                             {watchedFields.modifiers.didYouTakePhotographs && <Input placeholder={t('arrestReport.advancedForm.placeholders.photosLink')} {...register('narrative.photosLink')} />}
                             {watchedFields.modifiers.didYouObtainCctvFootage && <Input placeholder={t('arrestReport.advancedForm.placeholders.cctvLink')} {...register('narrative.cctvLink')} />}
                             {watchedFields.modifiers.thirdPartyVideoFootage && <Input placeholder={t('arrestReport.advancedForm.placeholders.thirdPartyLink')} {...register('narrative.thirdPartyLink')} />}
                        </div>
                        <Textarea value={watchedFields.narrative?.photographs} onChange={(e) => handleTextareaChange(e, 'photographs')} placeholder={t('arrestReport.advancedForm.narrative.photographs.placeholder')} rows={3} />
                    </>
                     ) : (
                        <Textarea value={watchedFields.narrative?.photographs} onChange={(e) => handleTextareaChange(e, 'photographs')} placeholder={t('arrestReport.advancedForm.narrative.photographs.noVideoPlaceholder')} rows={3} />
                     )}
                </NarrativeSection>

                <NarrativeSection title={t('arrestReport.advancedForm.narrative.booking.title')} presetName="booking" isChecked={!!watchedFields.presets?.booking} isUserModified={!!watchedFields.userModified?.booking} onToggle={() => handlePresetToggle('booking')}>
                    {!watchedFields.modifiers?.didYouBook && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.bookingRank')} {...register('narrative.bookingRank')} />
                            <Input placeholder={t('arrestReport.advancedForm.placeholders.bookingName')} {...register('narrative.bookingName')} />
                        </div>
                    )}
                    <Textarea value={watchedFields.narrative?.booking} onChange={(e) => handleTextareaChange(e, 'booking')} placeholder={t('arrestReport.advancedForm.narrative.booking.placeholder')} rows={3} />
                </NarrativeSection>
                
                 <NarrativeSection title={t('arrestReport.advancedForm.narrative.evidence.title')} presetName="evidence" isChecked={!!watchedFields.presets?.evidence} isUserModified={!!watchedFields.userModified?.evidence} onToggle={() => handlePresetToggle('evidence')}>
                    <Table><EvidenceLog control={control} register={register} fields={evidenceLogFields} onRemove={removeEvidenceLogField} onAdd={() => appendEvidenceLog({ logNumber: '', description: '', quantity: '1'})} onKeyUp={saveForm} /></Table>
                    <Textarea value={watchedFields.narrative?.evidence} onChange={(e) => handleTextareaChange(e, 'evidence')} placeholder={t('arrestReport.advancedForm.narrative.evidence.placeholder')} rows={3} />
                </NarrativeSection>

                <NarrativeSection title={t('arrestReport.advancedForm.narrative.court.title')} presetName="court" isChecked={!!watchedFields.presets?.court} isUserModified={!!watchedFields.userModified?.court} onToggle={() => handlePresetToggle('court')}>
                    <Textarea value={watchedFields.narrative?.court} onChange={(e) => handleTextareaChange(e, 'court')} placeholder={t('arrestReport.advancedForm.narrative.court.placeholder')} rows={3} />
                </NarrativeSection>

                 <NarrativeSection title={t('arrestReport.advancedForm.narrative.additional.title')} presetName="additional" isChecked={!!watchedFields.presets?.additional} isUserModified={!!watchedFields.userModified?.additional} onToggle={() => handlePresetToggle('additional')}>
                    <Controller name="narrative.plea" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value ? parsePleaKey(field.value) : undefined}>
                            <SelectTrigger className="mb-2"><SelectValue placeholder={t('arrestReport.advancedForm.placeholders.plea')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="guilty">{t('arrestReport.advancedForm.pleas.guilty')}</SelectItem>
                                <SelectItem value="notGuilty">{t('arrestReport.advancedForm.pleas.notGuilty')}</SelectItem>
                                <SelectItem value="noContest">{t('arrestReport.advancedForm.pleas.noContest')}</SelectItem>
                                <SelectItem value="requiredCase">{t('arrestReport.advancedForm.pleas.requiredCase')}</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    <Textarea value={watchedFields.narrative?.additional} onChange={(e) => handleTextareaChange(e, 'additional')} placeholder={t('arrestReport.advancedForm.narrative.additional.placeholder')} rows={3} />
                </NarrativeSection>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-4">
        <Button type="submit">{t('arrestReport.advancedForm.buttons.submit')}</Button>
      </div>
    </form>
  );
});

AdvancedArrestReportForm.displayName = 'AdvancedArrestReportForm';
