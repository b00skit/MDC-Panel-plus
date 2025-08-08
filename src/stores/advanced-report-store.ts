
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Officer } from './officer-store';

type Person = {
    name: string;
    sex: string;
    gang: string;
};

type FormOfficer = Omit<Officer, 'id'> & { id?: number; callSign?: string, divDetail?: string };


interface FormState {
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
        booking: string;
        evidence: string;
        court: string;
        additional: string;
    }
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
    modifiers: {},
    narrative: {
        source: '', investigation: '', arrest: '', booking: '', evidence: '',
        court: '', additional: ''
    }
});


interface AdvancedReportState {
  isAdvanced: boolean;
  toggleAdvanced: () => void;
  setAdvanced: (isAdvanced: boolean) => void;
  formData: FormState;
  setFormField: <T extends keyof FormState>(section: T, field: keyof FormState[T], value: any) => void;
  setFields: (fields: Partial<FormState>) => void;
  addPerson: () => void;
  removePerson: (index: number) => void;
  addOfficer: () => void;
  removeOfficer: (index: number) => void;
  reset: (data?: FormState) => void;
}

export const useAdvancedReportStore = create<AdvancedReportState>()(
  persist(
    (set, get) => ({
      isAdvanced: false,
      toggleAdvanced: () => set((state) => ({ isAdvanced: !state.isAdvanced })),
      setAdvanced: (isAdvanced) => set({ isAdvanced }),
      formData: getInitialState(),
      setFormField: (section, field, value) => set(state => ({
        formData: {
            ...state.formData,
            [section]: {
                ...state.formData[section],
                [field]: value,
            }
        }
      })),
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
      reset: (data) => set({ formData: data || getInitialState() }),
    }),
    {
      name: 'advanced-report-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
