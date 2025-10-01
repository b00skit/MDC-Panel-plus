
'use client';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SelectedCharge } from './charge-store';

export interface ArchivedPaperworkGenerator {
    id: string;
    type: 'static' | 'user';
    groupId?: string | null;
    title?: string;
    description?: string;
    icon?: string;
}

export interface ArchivedReport {
    id: number;
    paperworkType: 'arrest-report' | 'paperwork-generator';
    type?: 'basic' | 'advanced';
    fields: any;
    charges?: SelectedCharge[];
    generator?: ArchivedPaperworkGenerator;
}

interface ArchiveState {
    reports: ArchivedReport[];
    archiveReport: (reportData: Omit<ArchivedReport, 'id'>) => void;
    deleteReport: (id: number) => void;
    clearArchive: () => void;
}

export const useArchiveStore = create<ArchiveState>()(
    persist(
        (set, get) => ({
            reports: [],
            archiveReport: (reportData) => {
                const newReport: ArchivedReport = {
                    id: Date.now(),
                    ...reportData,
                };
                set((state) => ({
                    // Add to the beginning of the array and keep the last 50 reports
                    reports: [newReport, ...state.reports].slice(0, 50),
                }));
            },
            deleteReport: (id) => {
                set((state) => ({
                    reports: state.reports.filter((report) => report.id !== id),
                }));
            },
            clearArchive: () => {
                set({ reports: [] });
            }
        }),
        {
            name: 'report-archive-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
