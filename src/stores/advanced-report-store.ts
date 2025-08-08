
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
    persons: [],
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
  setFormField: <T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    field: K,
    value: any
  ) => void;
  setFields: (fields: Partial<FormState>) => void;
  addPerson: () => void;
  removePerson: (index: number) => void;
  addOfficer: () => void;
  removeOfficer: (index: number) => void;
  addEvidenceLog: () => void;
  removeEvidenceLog: (index: number) => void;
  reset: (data?: FormState) => void;
}

export const useAdvancedReportStore = create<AdvancedReportState>()(
  persist(
    (set, get) => ({
      isAdvanced: false,
      toggleAdvanced: () => set((state) => ({ isAdvanced: !state.isAdvanced })),
      setAdvanced: (isAdvanced) => set({ isAdvanced }),
      formData: getInitialState(),
      setFormField: (section, field, value) => set(state => {
        const currentSection = state.formData[section];
        if (typeof currentSection === 'object' && currentSection !== null) {
            return {
                formData: {
                    ...state.formData,
                    [section]: {
                        ...currentSection,
                        [field]: value,
                    },
                },
            };
        }
        return {
            formData: {
                ...state.formData,
                [section]: value,
            },
        };
      }),
      setFields: (fields) => set(state => ({
        formData: {
            ...state.formData,
            ...fields,
        }
      })),
      addPerson: () => set(state => ({
        formData: { ...state.formData, persons: [...state.formData.persons, { name: '', sex: '', gang: ''}] }
      })),
      removePerson: (index) => set(state => ({
        formData: { ...state.formData, persons: state.formData.persons.filter((_, i) => i !== index) }
      })),
      addOfficer: () => set(state => ({
        formData: { ...state.formData, officers: [...state.formData.officers, { id: Date.now(), name: '', rank: '', badgeNumber: '', department: '', divDetail: '' }] }
      })),
      removeOfficer: (index) => set(state => ({
        formData: { ...state.formData, officers: state.formData.officers.filter((_, i) => i !== index) }
      })),
      addEvidenceLog: () => set(state => ({
        formData: { ...state.formData, evidenceLogs: [...state.formData.evidenceLogs, { logNumber: '', description: '', quantity: '1'}] }
      })),
      removeEvidenceLog: (index) => set(state => ({
        formData: { ...state.formData, evidenceLogs: state.formData.evidenceLogs.filter((_, i) => i !== index) }
      })),
      reset: (data) => set({ formData: data || getInitialState() }),
    }),
    {
      name: 'advanced-report-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
