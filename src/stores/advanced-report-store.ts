
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdvancedReportState {
  isAdvanced: boolean;
  toggleAdvanced: () => void;
  setAdvanced: (isAdvanced: boolean) => void;
}

export const useAdvancedReportStore = create<AdvancedReportState>()(
  persist(
    (set) => ({
      isAdvanced: false,
      toggleAdvanced: () => set((state) => ({ isAdvanced: !state.isAdvanced })),
      setAdvanced: (isAdvanced) => set({ isAdvanced }),
    }),
    {
      name: 'advanced-report-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
