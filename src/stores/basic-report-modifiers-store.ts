
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Modifier = {
    name: string;
    label: string;
    generateText: () => string;
};

type ModifiersState = Record<string, boolean>;
type PresetsState = Record<string, boolean>;
type UserModifiedState = Record<string, boolean>;
type NarrativeState = Record<string, string>;

interface BasicReportModifiersState {
    modifiers: ModifiersState;
    presets: PresetsState;
    userModified: UserModifiedState;
    narrative: NarrativeState;
    setModifier: (modifier: string, value: boolean) => void;
    setPreset: (preset: string, value: boolean) => void;
    setUserModified: (field: string, value: boolean) => void;
    setNarrativeField: (field: string, value: string) => void;
    reset: () => void;
}

const getInitialState = (): Omit<BasicReportModifiersState, 'setModifier' | 'setPreset' | 'setUserModified' | 'setNarrativeField' | 'reset'> => ({
    modifiers: {
        introduction: true,
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
