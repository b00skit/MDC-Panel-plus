
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Officer } from './officer-store';
import { useFormStore } from './form-store';

interface PendingRestoreState {
    generatorId: string | null;
    generatorType: 'static' | 'user';
    groupId?: string | null;
    fields: Record<string, any>;
}

interface PaperworkState {
  generatorId: string | null;
  generatorType: 'static' | 'user' | null;
  groupId: string | null;
  formData: Record<string, any> & { officers?: Officer[], general?: any };
  lastFormValues: Record<string, any> | null;
  pendingRestore: PendingRestoreState | null;
  setGeneratorData: (data: { generatorId: string | null; generatorType: 'static' | 'user'; groupId?: string | null }) => void;
  setFormData: (data: Record<string, any>) => void;
  setLastFormValues: (data: Record<string, any>) => void;
  setPendingRestore: (data: PendingRestoreState) => void;
  clearPendingRestore: () => void;
  reset: () => void;
}

const initialState = {
    generatorId: null as string | null,
    generatorType: null as 'static' | 'user' | null,
    groupId: null as string | null,
    formData: {} as Record<string, any>,
    lastFormValues: null as Record<string, any> | null,
    pendingRestore: null as PendingRestoreState | null,
};

export const usePaperworkStore = create<PaperworkState>()(
  persist(
    (set, get) => ({
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
      setLastFormValues: (data) => set({ lastFormValues: data }),
      setPendingRestore: (data) => set({ pendingRestore: data }),
      clearPendingRestore: () => set({ pendingRestore: null }),
      reset: () => set((state) => ({
        ...initialState,
        pendingRestore: state.pendingRestore,
      })),
    }),
    {
      name: 'paperwork-generator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        generatorId: state.generatorId,
        generatorType: state.generatorType,
        groupId: state.groupId,
        formData: state.formData,
        lastFormValues: state.lastFormValues,
        pendingRestore: state.pendingRestore,
      }),
    }
  )
);
