'use client';

import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Officer {
  id: number;
  name: string;
  rank: string;
  department: string;
  badgeNumber: string;
}

interface OfficerState {
  officers: Officer[];
  addOfficer: () => void;
  removeOfficer: (id: number) => void;
  updateOfficer: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  setInitialOfficers: () => void;
}

const getInitialOfficer = (): Officer => ({
    id: 1,
    name: '',
    rank: '',
    department: '',
    badgeNumber: '',
});

export const useOfficerStore = create<OfficerState>()(
    persist(
      (set, get) => ({
        officers: [getInitialOfficer()],
  
        addOfficer: () =>
          set((state) => ({
            officers: [
              ...state.officers,
              {
                id: Date.now(),
                name: '',
                rank: '',
                department: '',
                badgeNumber: '',
              },
            ],
          })),
  
        removeOfficer: (id) =>
          set((state) => ({
            officers: state.officers.filter((officer) => officer.id !== id),
          })),
  
        updateOfficer: (id, updatedFields) => {
            set((state) => ({
                officers: state.officers.map((officer) =>
                  officer.id === id ? { ...officer, ...updatedFields } : officer
                ),
            }));
            
            // If updating the first officer, save to local storage
            const updatedOfficer = get().officers.find(o => o.id === id);
            if(updatedOfficer && get().officers.findIndex(o => o.id === id) === 0){
                localStorage.setItem('initial-officer-storage', JSON.stringify(updatedOfficer));
            }
        },

        setInitialOfficers: () => {
            if (typeof window !== 'undefined') {
                const storedOfficer = localStorage.getItem('initial-officer-storage');
                if (storedOfficer) {
                    try {
                        const parsedOfficer = JSON.parse(storedOfficer);
                        set({ officers: [parsedOfficer, ...get().officers.slice(1)] });
                    } catch (e) {
                         set({ officers: [getInitialOfficer()] });
                    }
                } else {
                     set({ officers: [getInitialOfficer()] });
                }
            }
        },
      }),
      {
        name: 'officer-storage',
        storage: createJSONStorage(() => sessionStorage), // Use session storage for non-primary officers
      }
    )
  );