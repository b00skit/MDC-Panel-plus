
'use client';

import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface Charge {
  id: string;
  charge: string;
  definition?: string;
  type: 'F' | 'M' | 'I' | '?';
  class: { A: boolean; B: boolean; C: boolean };
  offence: { '1': boolean; '2': boolean; '3': boolean; '4': boolean; '5': boolean };
  time: any;
  maxtime: any;
  points: any;
  fine: any;
  impound: any;
  suspension: any;
  bail: any;
  extra?: string;
  drugs?: Record<string, string>;
  code_enhancement?: string;
  code_enhancement_count?: number;
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

export interface Addition {
    name: string;
    sentence_multiplier: number;
    points_multiplier: number;
}

interface ChargeState {
  penalCode: PenalCode | null;
  additions: Addition[];
  charges: SelectedCharge[];
  report: SelectedCharge[];
  reportInitialized: boolean;
  isParoleViolator: boolean;
  reportIsParoleViolator: boolean;
  setPenalCode: (penalCode: PenalCode) => void;
  setAdditions: (additions: Addition[]) => void;
  addCharge: () => void;
  removeCharge: (uniqueId: number) => void;
  updateCharge: (uniqueId: number, updatedFields: Partial<Omit<SelectedCharge, 'uniqueId'>>) => void;
  setReport: (report: SelectedCharge[]) => void;
  resetCharges: () => void;
  setCharges: (charges: SelectedCharge[]) => void;
  toggleParoleViolator: () => void;
  setParoleViolator: (value: boolean) => void;
  setReportParoleViolator: (value: boolean) => void;
}

const initialState = {
    charges: [],
    report: [],
    reportInitialized: false,
    isParoleViolator: false,
    reportIsParoleViolator: false,
};

export const useChargeStore = create<ChargeState>()(
  persist(
    (set) => ({
      penalCode: null,
      additions: [],
      ...initialState,
      setPenalCode: (penalCode) => set({ penalCode }),
      setAdditions: (additions) => set({ additions }),
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
      setReport: (report) =>
        set((state) => ({
          report,
          reportInitialized: true,
          reportIsParoleViolator: state.isParoleViolator,
        })),
      resetCharges: () => set((state) => ({ ...state, charges: [], isParoleViolator: false })),
      setCharges: (charges) => set({ charges }),
      toggleParoleViolator: () => set(state => ({ isParoleViolator: !state.isParoleViolator })),
      setParoleViolator: (value) => set({ isParoleViolator: value }),
      setReportParoleViolator: (value) => set({ reportIsParoleViolator: value }),
    }),
    {
      name: 'charge-storage', // name of the item in the storage (must be unique)
      getStorage: () => sessionStorage, // (optional) by default, 'localStorage' is used
    }
  )
);
