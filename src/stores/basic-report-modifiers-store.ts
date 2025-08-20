
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Modifiers = {
    arrestReportIntroduction: boolean;
};

type Presets = {
    narrative: boolean;
};

type UserModified = {
    narrative: boolean;
};

type Narrative = {
    narrative: string;
};

interface BasicReportModifiersState {
    modifiers: Modifiers;
    presets: Presets;
    userModified: UserModified;
    narrative: Narrative;
    setModifier: <K extends keyof Modifiers>(modifier: K, value: boolean) => void;
    setPreset: <K extends keyof Presets>(preset: K, value: boolean) => void;
    setUserModified: <K extends keyof UserModified>(field: K, value: boolean) => void;
    setNarrativeField: <K extends keyof Narrative>(field: K, value: string) => void;
    reset: () => void;
}

const getInitialState = (): Omit<BasicReportModifiersState, 'setModifier' | 'setPreset' | 'setUserModified' | 'setNarrativeField' | 'reset'> => ({
    modifiers: {
        arrestReportIntroduction: true,
    },
    presets: {
        narrative: true,
    },
    userModified: {
        narrative: false,
    },
    narrative: {
        narrative: '',
    },
});

export const useBasicReportModifiersStore = create<BasicReportModifiersState>()(
    persist(
        (set) => ({
            ...getInitialState(),
            setModifier: (modifier, value) => set(state => ({
                modifiers: { ...state.modifiers, [modifier]: value }
            })),
            setPreset: (preset, value) => set(state => ({
                presets: { ...state.presets, [preset]: value }
            })),
            setUserModified: (field, value) => set(state => ({
                userModified: { ...state.userModified, [field]: value }
            })),
            setNarrativeField: (field, value) => set(state => ({
                narrative: { ...state.narrative, [field]: value }
            })),
            reset: () => set(getInitialState()),
        }),
        {
            name: 'basic-arrest-report-modifiers-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
