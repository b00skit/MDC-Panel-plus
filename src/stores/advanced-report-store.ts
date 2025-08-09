
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
    },
    narrativePresets: Record<string, boolean>;
    evidenceLogs: EvidenceLog[];
}

const getInitialState = (): FormState => ({
    arrestee: {
        name: '', sex: '', hair: '', eyes: '', residence: '', age: '', height: '',
        descent: '', clothing: '', oddities: '', alias: '', gang: ''
    },
    persons: [{ name: '', sex: '', gang: '' }],
    incident: {
        date: '', time: '', locationDistrict: '', locationStreet: ''
    },
    officers: [],
    modifiers: {
        markedUnit: true,
        slicktop: true,
        inUniform: true,
        inMetroUniform: false,
        inG3Uniform: false,
        wasSuspectInVehicle: false,
        wasSuspectMirandized: true,
        didSuspectUnderstandRights: true,
        doYouHaveAVideo: true,
        didYouTakePhotographs: true,
        didYouObtainCctvFootage: false,
        thirdPartyVideoFootage: false,
        biometricsAlreadyOnFile: false,
        didYouTransport: true,
        didYouBook: true,
    },
    narrative: {
        source: '', investigation: '', arrest: '', photographs: '', booking: '', evidence: '',
        court: '', additional: '', vehicleColor: '', vehicleModel: '', vehiclePlate: '',
        dicvsLink: '', cctvLink: '', photosLink: '', thirdPartyLink: '', plea: 'Guilty'
    },
    narrativePresets: {
        source: true,
        investigation: true,
        arrest: true,
        photographs: true,
        booking: true,
        evidence: true,
        court: true,
        additional: true,
    },
    evidenceLogs: [],
});


interface AdvancedReportState {
  isAdvanced: boolean;
  toggleAdvanced: () => void;
  setAdvanced: (isAdvanced: boolean) => void;
  formData: FormState;
  setFields: (fields: Partial<FormState>) => void;
  reset: (data?: FormState) => void;
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
      reset: (data) => set({ formData: data || getInitialState() }),
    }),
    {
      name: 'advanced-report-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

    
