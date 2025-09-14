
'use client';
import create from 'zustand';

export type Field = {
    id: string;
    type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general' | 'section' | 'hidden' | 'toggle' | 'datalist' | 'charge' | 'group' | 'input_group';
    name?: string;
    label?: string;
    placeholder?: string;
    options?: string[];
    title?: string;
    value?: string;
    dataOn?: string;
    dataOff?: string;
    defaultValue?: boolean;
    required?: boolean;
    stipulation?: {
      field: string;
      value: any;
    },
    stipulations?: {
      field: string;
      value: any;
    }[],
    fields?: Field[]; // For group type
    // Charge field specific config
    showClass?: boolean;
    showOffense?: boolean;
    showAddition?: boolean;
    showCategory?: boolean;
    allowedTypes?: { F?: boolean, M?: boolean, I?: boolean };
    allowedIds?: string;
    customFields?: Field[];
    previewFields?: {
        sentence?: boolean;
        fine?: boolean;
        impound?: boolean;
        suspension?: boolean;
    };
    copyableCharge?: boolean;
};

export type ConditionalVariable = {
    conditionField: string;
    operator: 'is_checked' | 'is_not_checked' | 'equals' | 'not_equals';
    conditionValue?: string;
    variableName: string;
    outputText: string;
};


interface PaperworkBuilderState {
    formData: {
        title: string;
        description: string;
        icon: string;
        form: Field[];
        conditionals?: ConditionalVariable[];
        output: string;
    };
    setField: (field: keyof PaperworkBuilderState['formData'], value: any) => void;
    setFormFields: (fields: Field[]) => void;
    reset: () => void;
}

const getInitialState = (): PaperworkBuilderState['formData'] => ({
    title: '',
    description: '',
    icon: 'Puzzle',
    form: [],
    conditionals: [],
    output: '',
});

export const usePaperworkBuilderStore = create<PaperworkBuilderState>((set) => ({
    formData: getInitialState(),
    setField: (field, value) => set(state => ({
        formData: { ...state.formData, [field]: value }
    })),
    setFormFields: (fields) => set(state => ({
        formData: { ...state.formData, form: fields }
    })),
    reset: () => set({ formData: getInitialState() }),
}));

    
