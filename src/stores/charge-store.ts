
'use client';

import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Charge {
  id: string;
  charge: string;
  type: 'F' | 'M' | 'I' | '?';
  class: { A: boolean; B: boolean; C: boolean };
  offence: { '1': boolean; '2': boolean; '3': boolean };
  time: any;
  maxtime: any;
  points: any;
  fine: any;
  impound: any;
  suspension: any;
  bail: any;
  extra?: string;
  drugs?: Record<string, string>;
}

export interface PenalCode {
  [key: string]: Charge;
}

export interface SelectedCharge {
  uniqueId: number;
  chargeId: string | null;
  class: string | null;
  offense: string | null;
  addition: string | null;
  category: string | null;
}

interface ChargeState {
  penalCode: PenalCode | null;
  charges: SelectedCharge[];
  report: SelectedCharge[];
  setPenalCode: (penalCode: PenalCode) => void;
  addCharge: () => void;
  removeCharge: (uniqueId: number) => void;
  updateCharge: (uniqueId: number, updatedFields: Partial<Omit<SelectedCharge, 'uniqueId'>>) => void;
  setReport: (report: SelectedCharge[]) => void;
  resetCharges: () => void;
}

const initialState = {
    charges: [],
    report: [],
};

export const useChargeStore = create<ChargeState>()(
  persist(
    (set) => ({
      penalCode: null,
      ...initialState,
      setPenalCode: (penalCode) => set({ penalCode }),
      addCharge: () =>
        set((state) => ({
          charges: [
            ...state.charges,
            {
              uniqueId: Date.now(),
              chargeId: null,
              class: null,
              offense: null,
              addition: null,
              category: null,
            },
          ],
        })),
      removeCharge: (uniqueId) =>
        set((state) => ({
          charges: state.charges.filter((charge) => charge.uniqueId !== uniqueId),
        })),
      updateCharge: (uniqueId, updatedFields) =>
        set((state) => ({
          charges: state.charges.map((charge) =>
            charge.uniqueId === uniqueId ? { ...charge, ...updatedFields } : charge
          ),
        })),
       setReport: (report) => set({ report }),
       resetCharges: () => set(initialState),
    }),
    {
      name: 'charge-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['penalCode'].includes(key))
        ),
    }
  )
);
