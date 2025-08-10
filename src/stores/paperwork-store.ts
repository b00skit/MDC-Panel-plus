
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PaperworkState {
  generatorId: string | null;
  formData: Record<string, any>;
  setGeneratorId: (id: string) => void;
  setFormData: (data: Record<string, any>) => void;
  reset: () => void;
}

const initialState = {
    generatorId: null,
    formData: {},
};

export const usePaperworkStore = create<PaperworkState>()(
  persist(
    (set) => ({
      ...initialState,
      setGeneratorId: (id) => set({ generatorId: id }),
      setFormData: (data) => set({ formData: data }),
      reset: () => set(initialState),
    }),
    {
      name: 'paperwork-generator-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
