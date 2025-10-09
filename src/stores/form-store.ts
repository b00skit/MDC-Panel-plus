
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Officer } from './officer-store';
import { useSettingsStore } from './settings-store';

interface GeneralState {
    date: string;
    time: string;
    callSign: string;
}

interface ArrestState {
    suspectName: string;
    narrative: string;
}

interface LocationState {
    district: string;
    street: string;
}

interface EvidenceState {
    supporting: string;
    dashcam: string;
}

export interface FormState {
    general: GeneralState;
    officers: Officer[];
    arrest: ArrestState;
    location: LocationState;
    evidence: EvidenceState;
}

interface FormStore {
  formData: FormState;
  setFormField: <T extends keyof FormState, K extends keyof FormState[T]>(
    section: T,
    field: K,
    value: FormState[T][K]
  ) => void;
  setAll: (data: Partial<FormState>) => void;
  reset: () => void;
}

const getInitialState = (): FormState => {
    const { predefinedCallsigns, defaultCallsignId } = useSettingsStore.getState();
    const defaultCallsign = predefinedCallsigns.find(c => c.id === defaultCallsignId)?.value || '';

    return {
        general: { date: '', time: '', callSign: defaultCallsign },
        officers: [],
        arrest: { suspectName: '', narrative: '' },
        location: { district: '', street: '' },
        evidence: { supporting: '', dashcam: '' },
    };
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: getInitialState(),
      
      setFormField: (section, field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [section]: {
              ...state.formData[section],
              [field]: value,
            },
          },
        })),

      setAll: (data) => set(state => ({ 
        formData: {
            ...state.formData,
            ...data
        }
      })),

      reset: () => set({ formData: getInitialState() }),
    }),
    {
      name: 'basic-arrest-report-form-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
