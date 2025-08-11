
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Officer } from './officer-store';
import { useFormStore } from './form-store';

interface PaperworkState {
  generatorId: string | null;
  generatorType: 'static' | 'user' | null;
  formData: Record<string, any> & { officers?: Officer[], general?: any };
  setGeneratorData: (data: { generatorId: string, generatorType: 'static' | 'user' }) => void;
  setFormData: (data: Record<string, any>) => void;
  reset: () => void;
}

const initialState = {
    generatorId: null,
    generatorType: null,
    formData: {},
};

export const usePaperworkStore = create<PaperworkState>()(
  persist(
    (set) => ({
      ...initialState,
      setGeneratorData: (data) => set({ generatorId: data.generatorId, generatorType: data.generatorType }),
      setFormData: (data) => set((state) => ({
        formData: {
          ...state.formData,
          ...data,
        }
      })),
      reset: () => set(initialState),
    }),
    {
      name: 'paperwork-generator-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
