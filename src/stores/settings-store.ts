
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FactionGroup {
    group_name: string;
    group_id: string;
    hidden?: boolean;
    url?: boolean;
    order?: number;
}

export interface PredefinedCallsign {
  id: number;
  value: string;
}

export type BackgroundLogoOption = 'sanAndreasSeal' | 'lspd' | 'lssd';

interface SettingsState {
  hiddenFactions: string[];
  showHiddenGroups: Record<string, boolean>;
  factionGroups: FactionGroup[];
  predefinedCallsigns: PredefinedCallsign[];
  defaultCallsignId: number | null;
  analyticsOptOut: boolean;
  experimentalFeatures: string[];
  backgroundLogo: BackgroundLogoOption;
  toggleFactionVisibility: (groupId: string) => void;
  setFactionGroups: (groups: FactionGroup[]) => void;
  toggleHiddenGroupVisibility: (groupId: string) => void;
  addCallsign: () => void;
  removeCallsign: (id: number) => void;
  updateCallsign: (id: number, value: string) => void;
  setDefaultCallsignId: (id: number | null) => void;
  toggleAnalytics: () => void;
  toggleExperimentalFeature: (feature: string) => void;
  setBackgroundLogo: (logo: BackgroundLogoOption) => void;
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
      experimentalFeatures: [],
      backgroundLogo: 'sanAndreasSeal',
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
      },
      toggleExperimentalFeature: (feature: string) => {
        set(state => {
            const currentFeatures = state.experimentalFeatures;
            const newFeatures = currentFeatures.includes(feature)
                ? currentFeatures.filter(f => f !== feature)
                : [...currentFeatures, feature];
            return { experimentalFeatures: newFeatures };
        });
      },
      setBackgroundLogo: (logo: BackgroundLogoOption) => {
        set({ backgroundLogo: logo });
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
        experimentalFeatures: state.experimentalFeatures,
        backgroundLogo: state.backgroundLogo,
      }),
    }
  )
);
