
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Officer } from './officer-store';
import { useFormStore } from './form-store';

interface PaperworkState {
  generatorId: string | null;
  generatorType: 'static' | 'user' | null;
  groupId: string | null;
  formData: Record<string, any> & { officers?: Officer[], general?: any };
  setGeneratorData: (data: { generatorId: string; generatorType: 'static' | 'user', groupId?: string | null }) => void;
  setFormData: (data: Record<string, any>) => void;
  reset: () => void;
}

const initialState = {
    generatorId: null,
    generatorType: null,
    groupId: null,
    formData: {},
};

export const usePaperworkStore = create<PaperworkState>()(
  persist(
    (set) => ({
      ...initialState,
      setGeneratorData: (data) => set({ 
          generatorId: data.generatorId, 
          generatorType: data.generatorType,
          groupId: data.groupId || null 
      }),
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
