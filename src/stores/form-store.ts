
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Officer } from './officer-store';

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

interface FormState {
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

const initialState: FormState = {
    general: { date: '', time: '', callSign: '' },
    officers: [],
    arrest: { suspectName: '', narrative: '' },
    location: { district: '', street: '' },
    evidence: { supporting: '', dashcam: '' },
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: initialState,
      
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

      reset: () => set({ formData: initialState }),
    }),
    {
      name: 'arrest-report-form-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
