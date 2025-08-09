
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

type FormOfficer = Omit<Officer, 'id'> & { id?: number; callSign?: string, divDetail?: string };


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

const getInitialState = (): FormState => ({
    arrestee: {
        name: '', sex: '', hair: '', eyes: '', residence: '', age: '', height: '',
        descent: '', clothing: '', oddities: '', alias: '', gang: ''
    },
    persons: [],
    incident: {
        date: '', time: '', locationDistrict: '', locationStreet: ''
    },
    officers: [],
    modifiers: {
        markedUnit: true,
        slicktop: false,
        inUniform: true,
        undercover: false,
        inMetroUniform: false,
        inG3Uniform: false,
        wasSuspectInVehicle: false,
        wasSuspectMirandized: true,
        didSuspectUnderstandRights: true,
        doYouHaveAVideo: false,
        didYouTakePhotographs: false,
        didYouObtainCctvFootage: false,
        thirdPartyVideoFootage: false,
        biometricsAlreadyOnFile: false,
        didYouTransport: true,
        didYouBook: true,
    },
    narrative: {
        source: '', investigation: '', arrest: '', photographs: '', booking: '', evidence: '',
        court: '', additional: '', vehicleColor: '', vehicleModel: '', vehiclePlate: '',
        dicvsLink: '', cctvLink: '', photosLink: '', thirdPartyLink: '', plea: 'Guilty',
        transportingRank: '', transportingName: '', bookingRank: '', bookingName: ''
    },
    evidenceLogs: [],
    presets: {
        source: true,
        investigation: true,
        arrest: true,
        photographs: true,
        booking: true,
        evidence: true,
        court: true,
        additional: true,
    },
    userModified: {
        source: false,
        investigation: false,
        arrest: false,
        photographs: false,
        booking: false,
        evidence: false,
        court: false,
        additional: false,
    },
});


interface AdvancedReportState {
  isAdvanced: boolean;
  toggleAdvanced: () => void;
  setAdvanced: (isAdvanced: boolean) => void;
  formData: FormState;
  setFields: (fields: Partial<FormState>) => void;
  reset: () => void;
}

export const useAdvancedReportStore = create<AdvancedReportState>()(
  persist(
    (set) => ({
      isAdvanced: false,
      toggleAdvanced: () => set((state) => ({ isAdvanced: !state.isAdvanced })),
      setAdvanced: (isAdvanced) => set({ isAdvanced }),
      formData: getInitialState(),
      setFields: (fields) => set(state => ({
        formData: {
            ...state.formData,
            ...fields,
        }
      })),
      reset: () => set({ formData: getInitialState(), isAdvanced: false }),
    }),
    {
      name: 'advanced-report-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
