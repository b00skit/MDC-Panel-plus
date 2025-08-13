
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Officer } from './officer-store';

type Person = {
    name: string;
    sex: string;
    gang: string;
};

type EvidenceLog = {
    logNumber: string;
    description: string;
    quantity: string;
}

export type FormOfficer = Omit<Officer, 'id'> & { id?: number; callSign?: string, divDetail?: string };


export interface FormState {
    arrestee: {
        name: string;
        sex: string;
        hair: string;
        eyes: string;
        residence: string;
        age: string;
        height: string;
        descent: string;
        clothing: string;
        oddities: string;
        alias: string;
        gang: string;
    };
    persons: Person[];
    incident: {
        date: string;
        time: string;
        locationDistrict: string;
        locationStreet: string;
    };
    officers: FormOfficer[];
    modifiers: Record<string, boolean>;
    narrative: {
        source: string;
        investigation: string;
        arrest: string;
        photographs: string;
        booking: string;
        evidence: string;
        court: string;
        additional: string;
        vehicleColor: string;
        vehicleModel: string;
        vehiclePlate: string;
        dicvsLink: string;
        cctvLink: string;
        photosLink: string;
        thirdPartyLink: string;
        plea: string;
        transportingRank: string;
        transportingName: string;
        bookingRank: string;
        bookingName: string;
    },
    evidenceLogs: EvidenceLog[];
    presets: {
        source: boolean;
        investigation: boolean;
        arrest: boolean;
        photographs: boolean;
        booking: boolean;
        evidence: boolean;
        court: boolean;
        additional: boolean;
    };
    userModified: {
        source: boolean;
        investigation: boolean;
        arrest: boolean;
        photographs: boolean;
        booking: boolean;
        evidence: boolean;
        court: boolean;
        additional: boolean;
    };
}

const getInitialState = (): Omit<FormState, 'modifiers' | 'presets' | 'userModified' | 'narrative'> => ({
    arrestee: {
        name: '', sex: '', hair: '', eyes: '', residence: '', age: '', height: '',
        descent: '', clothing: '', oddities: '', alias: '', gang: ''
    },
    persons: [],
    incident: {
        date: '', time: '', locationDistrict: '', locationStreet: ''
    },
    officers: [],
    evidenceLogs: [],
});


interface AdvancedReportState {
  isAdvanced: boolean;
  toggleAdvanced: () => void;
  setAdvanced: (isAdvanced: boolean) => void;
  formData: Omit<FormState, 'modifiers' | 'presets' | 'userModified' | 'narrative'> & { narrative: Partial<FormState['narrative']>};
  setFields: (fields: Partial<FormState>) => void;
  reset: () => void;
}

export const useAdvancedReportStore = create<AdvancedReportState>()(
  persist(
    (set) => ({
      isAdvanced: false,
      toggleAdvanced: () => set((state) => ({ isAdvanced: !state.isAdvanced })),
      setAdvanced: (isAdvanced) => set({ isAdvanced }),
      formData: { ...getInitialState(), narrative: {} },
      setFields: (fields) => set(state => {
        const { modifiers, presets, userModified, narrative, ...rest } = fields;
        return {
            formData: {
                ...state.formData,
                ...rest,
                narrative: {
                    ...state.formData.narrative,
                    ...narrative,
                }
            }
        }
      }),
      reset: () => set({ formData: { ...getInitialState(), narrative: {} } }),
    }),
    {
      name: 'advanced-arrest-report-session-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
