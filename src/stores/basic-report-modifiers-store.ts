
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Modifier = {
    name: string;
    label: string;
    text?: string;
    requires?: string[];
};

type ModifiersState = Record<string, boolean>;
type PresetsState = Record<string, boolean>;
type UserModifiedState = Record<string, boolean>;

interface BasicReportModifiersState {
    modifiers: ModifiersState;
    presets: PresetsState;
    userModified: UserModifiedState;
    setModifier: (modifier: string, value: boolean) => void;
    setPreset: (preset: string, value: boolean) => void;
    setUserModified: (field: string, value: boolean) => void;
    reset: () => void;
}

const getInitialState = (): Omit<BasicReportModifiersState, 'setModifier' | 'setPreset' | 'setUserModified' | 'reset'> => ({
    modifiers: {
        callOfService: false,
        booking: false,
    },
    presets: {
        narrative: true,
    },
    userModified: {
        narrative: false,
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
            reset: () => set(getInitialState()),
        }),
        {
            name: 'basic-arrest-report-modifiers-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
