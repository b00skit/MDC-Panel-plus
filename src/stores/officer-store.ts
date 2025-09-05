
'use client';

import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Officer {
  id: number;
  name: string;
  rank: string;
  department: string;
  badgeNumber: string;
  callSign?: string;
  divDetail?: string;
}

interface OfficerState {
  officers: Officer[];
  alternativeCharacters: Officer[];
  predefinedOfficers: Officer[];
  addOfficer: () => void;
  removeOfficer: (id: number) => void;
  updateOfficer: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  setInitialOfficers: () => void;
  addAlternativeCharacter: () => void;
  removeAlternativeCharacter: (id: number) => void;
  updateAlternativeCharacter: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  swapOfficer: (officerId: number, altCharToUse: Officer) => void;
  setPredefinedOfficers: () => void;
  addPredefinedOfficer: () => void;
  removePredefinedOfficer: (id: number) => void;
  updatePredefinedOfficer: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => void;
  clearPredefinedOfficers: () => void;
  reset: () => void;
}

const getInitialOfficer = (): Officer => ({
    id: 1,
    name: '',
    rank: '',
    department: '',
    badgeNumber: '',
    callSign: '',
    divDetail: '',
});

const createEmptyAltCharacter = (): Officer => ({
  id: Date.now(),
  name: '',
  rank: '',
  department: '',
  badgeNumber: '',
  callSign: '',
  divDetail: '',
});

export const useOfficerStore = create<OfficerState>()(
    persist(
      (set, get) => ({
        officers: [],
        alternativeCharacters: [],
        predefinedOfficers: [],
  
        addOfficer: () => {
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
            }));
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
            if (officerIndex === 0 && state.predefinedOfficers.length === 0) {
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
                const storedPredefined = localStorage.getItem('predefined-officers-storage');

                let defaultOfficer = getInitialOfficer();
                if (storedOfficer) {
                    try { defaultOfficer = JSON.parse(storedOfficer); } 
                    catch (e) { console.error("Failed to parse stored officer data"); }
                }

                let altChars: Officer[] = [];
                if(storedAltChars) {
                    try { altChars = JSON.parse(storedAltChars); } 
                    catch (e) { console.error("Failed to parse alt characters"); }
                }

                let predefined: Officer[] = [];
                if(storedPredefined) {
                    try { predefined = JSON.parse(storedPredefined); }
                    catch (e) { console.error("Failed to parse predefined officers"); }
                }
                
                const initialOfficers = predefined.length > 0 ? [...predefined] : [defaultOfficer];
                
                set({ 
                    officers: initialOfficers,
                    alternativeCharacters: altChars,
                    predefinedOfficers: predefined,
                });
            }
        },

        setPredefinedOfficers: () => {
            if(typeof window !== 'undefined') {
                const storedPredefined = localStorage.getItem('predefined-officers-storage');
                if (storedPredefined) {
                    try {
                        set({ predefinedOfficers: JSON.parse(storedPredefined) });
                    } catch (e) {
                        console.error("Failed to parse predefined officers");
                    }
                }
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
              const newAltCharData: Officer = { ...officerToSwap, id: altCharToUse.id };
              const newOfficerData: Officer = { ...altCharToUse, id: officerToSwap.id };
      
              const newOfficers = [...state.officers];
              newOfficers[officerToSwapIndex] = newOfficerData;
      
              const newAlternativeCharacters = state.alternativeCharacters.map(ac =>
                ac.id === altCharToUse.id ? newAltCharData : ac
              );

              // If predefined officers are active, update them as well
              const newPredefinedOfficers = state.predefinedOfficers.map(po =>
                po.id === officerId ? newOfficerData : po
              );
              if(state.predefinedOfficers.length > 0) {
                  localStorage.setItem('predefined-officers-storage', JSON.stringify(newPredefinedOfficers));
              }
      
              // Update local storage for single officer setup if it's the primary officer
              if (officerToSwapIndex === 0 && state.predefinedOfficers.length === 0) {
                  localStorage.setItem('initial-officer-storage', JSON.stringify(newOfficerData));
              }
              localStorage.setItem('alt-characters-storage', JSON.stringify(newAlternativeCharacters));
      
              return {
                ...state,
                officers: newOfficers,
                predefinedOfficers: newPredefinedOfficers,
                alternativeCharacters: newAlternativeCharacters,
              };
            });
          },

          addPredefinedOfficer: () => {
            set((state) => {
                const newOfficer = { id: Date.now(), name: '', rank: '', department: '', badgeNumber: '' };
                const updatedList = [...state.predefinedOfficers, newOfficer];
                localStorage.setItem('predefined-officers-storage', JSON.stringify(updatedList));
                return { predefinedOfficers: updatedList };
            });
          },

          removePredefinedOfficer: (id: number) => {
            set((state) => {
                const updatedList = state.predefinedOfficers.filter(o => o.id !== id);
                localStorage.setItem('predefined-officers-storage', JSON.stringify(updatedList));
                return { predefinedOfficers: updatedList };
            });
          },
          
          updatePredefinedOfficer: (id: number, updatedFields: Partial<Omit<Officer, 'id'>>) => {
            set((state) => {
                const updatedList = state.predefinedOfficers.map(o =>
                    o.id === id ? { ...o, ...updatedFields } : o
                );
                localStorage.setItem('predefined-officers-storage', JSON.stringify(updatedList));
                return { predefinedOfficers: updatedList };
            });
          },

          clearPredefinedOfficers: () => {
            localStorage.removeItem('predefined-officers-storage');
            set({ predefinedOfficers: [] });
            // Re-run initial setup to fall back to default single officer
            get().setInitialOfficers();
          },
          
          reset: () => set({ officers: [], alternativeCharacters: [], predefinedOfficers: [] }),
      }),
      {
        name: 'officer-storage',
        storage: createJSONStorage(() => sessionStorage), 
        partialize: (state) => ({ officers: state.officers }),
      }
    )
  );

