
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FactionGroup {
    group_name: string;
    group_id: string;
    hidden?: boolean;
}

interface SettingsState {
  hiddenFactions: string[];
  hiddenLegacy: boolean;
  factionGroups: FactionGroup[];
  toggleFactionVisibility: (groupId: string) => void;
  setFactionGroups: (groups: FactionGroup[]) => void;
  toggleLegacyForms: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hiddenFactions: [],
      hiddenLegacy: false,
      factionGroups: [],
      toggleFactionVisibility: (groupId: string) => {
        const { hiddenFactions } = get();
        const newHiddenFactions = hiddenFactions.includes(groupId)
          ? hiddenFactions.filter((id) => id !== groupId)
          : [...hiddenFactions, groupId];
        set({ hiddenFactions: newHiddenFactions });
      },
      setFactionGroups: (groups) => set({ factionGroups: groups }),
      toggleLegacyForms: () => set(state => ({ hiddenLegacy: !state.hiddenLegacy })),
    }),
    {
      name: 'site-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        hiddenFactions: state.hiddenFactions,
        hiddenLegacy: state.hiddenLegacy 
      }),
    }
  )
);
