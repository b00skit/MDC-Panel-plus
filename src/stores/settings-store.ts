
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { promises as fs } from 'fs';
import path from 'path';

interface FactionGroup {
    group_name: string;
    group_id: string;
}

interface SettingsState {
  hiddenFactions: string[];
  factionGroups: FactionGroup[];
  toggleFactionVisibility: (groupId: string) => void;
  loadFactionGroups: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hiddenFactions: [],
      factionGroups: [],
      toggleFactionVisibility: (groupId: string) => {
        const { hiddenFactions } = get();
        const newHiddenFactions = hiddenFactions.includes(groupId)
          ? hiddenFactions.filter((id) => id !== groupId)
          : [...hiddenFactions, groupId];
        set({ hiddenFactions: newHiddenFactions });
      },
      loadFactionGroups: async () => {
        // This function will only run on the client, where fs is not available.
        // It's better to fetch this data from an API route or pass it as props.
        // For now, we can simulate an empty load or fetch from a new API endpoint.
        // Let's assume for now this will be populated from the component that uses it.
      },
    }),
    {
      name: 'site-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ hiddenFactions: state.hiddenFactions }),
    }
  )
);
