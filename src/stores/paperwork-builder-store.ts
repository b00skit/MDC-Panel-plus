
'use client';
import create from 'zustand';

export type Field = {
    id: string;
    type: 'text' | 'textarea' | 'dropdown' | 'officer' | 'general';
    name: string;
    label?: string;
    placeholder?: string;
    options?: string[];
};

interface PaperworkBuilderState {
    formData: {
        title: string;
        description: string;
        icon: string;
        form: Field[];
        output: string;
    };
    setField: (field: keyof PaperworkBuilderState['formData'], value: any) => void;
    addFormField: (field: Field) => void;
    removeFormField: (index: number) => void;
    updateFormField: (index: number, updatedField: Partial<Field>) => void;
    setFormFields: (fields: Field[]) => void;
    reset: () => void;
}

const getInitialState = () => ({
    title: '',
    description: '',
    icon: '',
    form: [],
    output: '',
});

export const usePaperworkBuilderStore = create<PaperworkBuilderState>((set) => ({
    formData: getInitialState(),
    setField: (field, value) => set(state => ({
        formData: { ...state.formData, [field]: value }
    })),
    addFormField: (field) => set(state => ({
        formData: { ...state.formData, form: [...state.formData.form, field] }
    })),
    removeFormField: (index) => set(state => ({
        formData: {
            ...state.formData,
            form: state.formData.form.filter((_, i) => i !== index),
        }
    })),
    updateFormField: (index, updatedField) => set(state => {
        const newForm = [...state.formData.form];
        const fieldToUpdate = newForm[index];

        if (fieldToUpdate.type === 'general') updatedField.name = 'general';
        else if (fieldToUpdate.type === 'officer') updatedField.name = 'officer';

        newForm[index] = { ...fieldToUpdate, ...updatedField };
        return { formData: { ...state.formData, form: newForm } };
    }),
    setFormFields: (fields) => set(state => ({
        formData: { ...state.formData, form: fields }
    })),
    reset: () => set({ formData: getInitialState() }),
}));
