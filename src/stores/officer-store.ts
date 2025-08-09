
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
  alternativeCharacters: Officer[];
  addOfficer: () => void;
  removeOfficer: (id: number) => void;
  updateOfficer: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  setInitialOfficers: () => void;
  addAlternativeCharacter: () => void;
  removeAlternativeCharacter: (id: number) => void;
  updateAlternativeCharacter: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  swapOfficer: (officerId: number, altCharToUse: Officer) => void;
}

const getInitialOfficer = (): Officer => ({
    id: 1,
    name: '',
    rank: '',
    department: '',
    badgeNumber: '',
});

const createEmptyAltCharacter = (): Officer => ({
  id: Date.now(),
  name: '',
  rank: '',
  department: '',
  badgeNumber: '',
});


export const useOfficerStore = create<OfficerState>()(
    persist(
      (set, get) => ({
        officers: [],
        alternativeCharacters: [],
  
        addOfficer: () => {
            set((state) => {
                const isFirstOfficer = state.officers.length === 0;
                if (isFirstOfficer) {
                    const storedOfficer = localStorage.getItem('initial-officer-storage');
                    let defaultOfficer = getInitialOfficer();
                    if (storedOfficer) {
                        try {
                            defaultOfficer = { ...defaultOfficer, ...JSON.parse(storedOfficer) };
                        } catch (e) {
                            console.error("Failed to parse stored officer data");
                        }
                    }
                    return { officers: [defaultOfficer] };
                } else {
                    return {
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
                    };
                }
            });
        },
  
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
            
            const state = get();
            const officerIndex = state.officers.findIndex(o => o.id === id);

            // If updating the first officer, save to local storage for default
            if (officerIndex === 0) {
                const updatedOfficer = state.officers[0];
                if (updatedOfficer) {
                    localStorage.setItem('initial-officer-storage', JSON.stringify(updatedOfficer));
                }
            }
        },

        setInitialOfficers: () => {
            if (typeof window !== 'undefined') {
                const storedOfficer = localStorage.getItem('initial-officer-storage');
                const storedAltChars = localStorage.getItem('alt-characters-storage');

                let defaultOfficer = getInitialOfficer();
                if (storedOfficer) {
                    try {
                        defaultOfficer = JSON.parse(storedOfficer);
                    } catch (e) {
                         console.error("Failed to parse stored officer data");
                    }
                }

                let altChars: Officer[] = [];
                if(storedAltChars) {
                    try {
                        altChars = JSON.parse(storedAltChars);
                    } catch (e) {
                        console.error("Failed to parse alt characters");
                    }
                }
                
                set({ 
                    officers: [defaultOfficer],
                    alternativeCharacters: altChars
                });
            }
        },

        addAlternativeCharacter: () => {
          set((state) => {
            if (state.alternativeCharacters.length < 3) {
              const newState = {
                alternativeCharacters: [...state.alternativeCharacters, createEmptyAltCharacter()]
              };
              localStorage.setItem('alt-characters-storage', JSON.stringify(newState.alternativeCharacters));
              return newState;
            }
            return state;
          });
        },
    
        removeAlternativeCharacter: (id: number) => {
          set((state) => {
            const newState = {
              alternativeCharacters: state.alternativeCharacters.filter((char) => char.id !== id)
            };
            localStorage.setItem('alt-characters-storage', JSON.stringify(newState.alternativeCharacters));
            return newState;
          });
        },
    
        updateAlternativeCharacter: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => {
          set((state) => {
            const newState = {
              alternativeCharacters: state.alternativeCharacters.map((char) =>
                char.id === id ? { ...char, ...updatedFields } : char
              )
            };
            localStorage.setItem('alt-characters-storage', JSON.stringify(newState.alternativeCharacters));
            return newState;
          });
        },

        swapOfficer: (officerId: number, altCharToUse: Officer) => {
            set(state => {
              const officerToSwapIndex = state.officers.findIndex(o => o.id === officerId);
              if (officerToSwapIndex === -1) return state;
      
              const officerToSwap = state.officers[officerToSwapIndex];
      
              // The character that was in the form, to be moved to alternatives
              const newAltCharData = {
                id: altCharToUse.id, // Keep the alt char's original ID
                name: officerToSwap.name,
                rank: officerToSwap.rank,
                department: officerToSwap.department,
                badgeNumber: officerToSwap.badgeNumber,
              };
      
              // The character that will replace the officer in the form
              const newOfficerData = {
                id: officerToSwap.id, // Keep the form officer's original ID
                name: altCharToUse.name,
                rank: altCharToUse.rank,
                department: altCharToUse.department,
                badgeNumber: altCharToUse.badgeNumber,
              };
      
              // Update officers list
              const newOfficers = [...state.officers];
              newOfficers[officerToSwapIndex] = newOfficerData;
      
              // Update alternative characters list
              const newAlternativeCharacters = state.alternativeCharacters.map(ac =>
                ac.id === altCharToUse.id ? newAltCharData : ac
              );
      
              // Persist changes to localStorage if they are defaults
              if (officerToSwapIndex === 0) {
                  localStorage.setItem('initial-officer-storage', JSON.stringify(newOfficerData));
              }
              localStorage.setItem('alt-characters-storage', JSON.stringify(newAlternativeCharacters));
      
              return {
                ...state,
                officers: newOfficers,
                alternativeCharacters: newAlternativeCharacters,
              };
            });
          },
      }),
      {
        name: 'officer-storage',
        storage: createJSONStorage(() => sessionStorage), // Use session storage for non-primary officers
        partialize: (state) => ({ officers: state.officers.slice(1) }), // Only persist non-default officers
      }
    )
  );
  
