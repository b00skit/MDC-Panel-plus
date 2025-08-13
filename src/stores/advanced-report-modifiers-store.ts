
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FormState } from './advanced-report-store';


interface AdvancedReportModifiersStore {
    modifiers: Record<string, boolean>;
    presets: FormState['presets'];
    userModified: FormState['userModified'];
    narrative: Partial<FormState['narrative']>;
    setModifiersState: (state: { modifiers: Record<string, boolean>, presets: FormState['presets'], userModified: FormState['userModified'] }) => void;
    setNarrativeField: <K extends keyof FormState['narrative']>(field: K, value: FormState['narrative'][K]) => void;
    setPreset: (preset: keyof FormState['presets'], value: boolean) => void;
    setUserModified: (field: keyof FormState['userModified'], value: boolean) => void;
    reset: () => void;
}

const getInitialState = (): Omit<AdvancedReportModifiersStore, 'setModifiersState' | 'setNarrativeField' | 'setPreset' | 'setUserModified' | 'reset'> => ({
    modifiers: {
        markedUnit: true,
        slicktop: false,
        inUniform: true,
        undercover: false,
        inMetroUniform: false,
        inG3Uniform: false,
        wasSuspectInVehicle: false,
        wasSuspectMirandized: true,
        didSuspectUnderstandRights: true,
        doYouHaveAVideo: false,
        didYouTakePhotographs: false,
        didYouObtainCctvFootage: false,
        thirdPartyVideoFootage: false,
        biometricsAlreadyOnFile: false,
        didYouTransport: true,
        didYouBook: true,
    },
    presets: {
        source: true,
        investigation: true,
        arrest: true,
        photographs: true,
        booking: true,
        evidence: true,
        court: true,
        additional: true,
    },
    userModified: {
        source: false,
        investigation: false,
        arrest: false,
        photographs: false,
        booking: false,
        evidence: false,
        court: false,
        additional: false,
    },
    narrative: {},
});

export const useAdvancedReportModifiersStore = create<AdvancedReportModifiersStore>()(
    persist(
        (set) => ({
            ...getInitialState(),
            setModifiersState: (state) => set({
                modifiers: state.modifiers,
                presets: state.presets,
                userModified: state.userModified
            }),
            setNarrativeField: (field, value) => set(state => ({
                narrative: {
                    ...state.narrative,
                    [field]: value
                }
            })),
            setPreset: (preset, value) => set(state => ({
                presets: {
                    ...state.presets,
                    [preset]: value,
                }
            })),
            setUserModified: (field, value) => set(state => ({
                userModified: {
                    ...state.userModified,
                    [field]: value,
                }
            })),
            reset: () => set(getInitialState()),
        }),
        {
            name: 'advanced-arrest-report-modifiers-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
