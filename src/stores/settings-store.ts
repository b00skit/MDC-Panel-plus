
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FactionGroup {
    group_name: string;
    group_id: string;
    hidden?: boolean;
    url?: boolean;
}

export interface PredefinedCallsign {
  id: number;
  value: string;
}

interface SettingsState {
  hiddenFactions: string[];
  showHiddenGroups: Record<string, boolean>;
  factionGroups: FactionGroup[];
  predefinedCallsigns: PredefinedCallsign[];
  defaultCallsignId: number | null;
  analyticsOptOut: boolean;
  toggleFactionVisibility: (groupId: string) => void;
  setFactionGroups: (groups: FactionGroup[]) => void;
  toggleHiddenGroupVisibility: (groupId: string) => void;
  addCallsign: () => void;
  removeCallsign: (id: number) => void;
  updateCallsign: (id: number, value: string) => void;
  setDefaultCallsignId: (id: number | null) => void;
  toggleAnalytics: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hiddenFactions: [],
      showHiddenGroups: {},
      factionGroups: [],
      predefinedCallsigns: [],
      defaultCallsignId: null,
      analyticsOptOut: false,
      toggleFactionVisibility: (groupId: string) => {
        const { hiddenFactions } = get();
        const newHiddenFactions = hiddenFactions.includes(groupId)
          ? hiddenFactions.filter((id) => id !== groupId)
          : [...hiddenFactions, groupId];
        set({ hiddenFactions: newHiddenFactions });
      },
      setFactionGroups: (groups) => set({ factionGroups: groups }),
      toggleHiddenGroupVisibility: (groupId: string) => {
        set(state => ({
            showHiddenGroups: {
                ...state.showHiddenGroups,
                [groupId]: !state.showHiddenGroups[groupId]
            }
        }));
      },
      addCallsign: () => {
        set(state => ({
            predefinedCallsigns: [
                ...state.predefinedCallsigns,
                { id: Date.now(), value: '' }
            ]
        }));
      },
      removeCallsign: (id: number) => {
        set(state => ({
            predefinedCallsigns: state.predefinedCallsigns.filter(c => c.id !== id),
            defaultCallsignId: state.defaultCallsignId === id ? null : state.defaultCallsignId,
        }));
      },
      updateCallsign: (id: number, value: string) => {
        set(state => ({
            predefinedCallsigns: state.predefinedCallsigns.map(c => 
                c.id === id ? { ...c, value } : c
            ),
        }));
      },
      setDefaultCallsignId: (id: number | null) => {
        set({ defaultCallsignId: id });
      },
      toggleAnalytics: () => {
        set(state => ({ analyticsOptOut: !state.analyticsOptOut }));
      }
    }),
    {
      name: 'site-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        hiddenFactions: state.hiddenFactions,
        showHiddenGroups: state.showHiddenGroups,
        predefinedCallsigns: state.predefinedCallsigns,
        defaultCallsignId: state.defaultCallsignId,
        analyticsOptOut: state.analyticsOptOut,
      }),
    }
  )
);
