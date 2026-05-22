import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reciter, Verse } from '@/lib/quran';

interface RepasaState {
  completedVueltas: Record<string, number[]>;
  pageStats: Record<string, { listenCount: number; recordCount: number }>;
  reciter: Reciter;
  pageCache: Record<number, Verse[]>;

  markVueltaCompleted: (juzId: string, vueltaId: number) => void;
  toggleVueltaCompleted: (juzId: string, vueltaId: number) => void;
  incrementListen: (pageKey: string) => void;
  incrementRecord: (pageKey: string) => void;
  setReciter: (reciter: Reciter) => void;
  cachePageVerses: (absolutePage: number, verses: Verse[]) => void;
}

export const useRepasaStore = create<RepasaState>()(
  persist(
    (set) => ({
      completedVueltas: {},
      pageStats: {},
      reciter: 'husary',
      pageCache: {},

      markVueltaCompleted: (juzId, vueltaId) => set((state) => {
        const currentJuz = state.completedVueltas[juzId] || [];
        if (currentJuz.includes(vueltaId)) return state;
        return {
          completedVueltas: {
            ...state.completedVueltas,
            [juzId]: [...currentJuz, vueltaId],
          },
        };
      }),

      toggleVueltaCompleted: (juzId, vueltaId) => set((state) => {
        const currentJuz = state.completedVueltas[juzId] || [];
        return {
          completedVueltas: {
            ...state.completedVueltas,
            [juzId]: currentJuz.includes(vueltaId)
              ? currentJuz.filter((v) => v !== vueltaId)
              : [...currentJuz, vueltaId],
          },
        };
      }),

      incrementListen: (pageKey) => set((state) => {
        const cur = state.pageStats[pageKey] || { listenCount: 0, recordCount: 0 };
        return {
          pageStats: { ...state.pageStats, [pageKey]: { ...cur, listenCount: cur.listenCount + 1 } },
        };
      }),

      incrementRecord: (pageKey) => set((state) => {
        const cur = state.pageStats[pageKey] || { listenCount: 0, recordCount: 0 };
        return {
          pageStats: { ...state.pageStats, [pageKey]: { ...cur, recordCount: cur.recordCount + 1 } },
        };
      }),

      setReciter: (reciter) => set({ reciter }),

      cachePageVerses: (absolutePage, verses) => set((state) => ({
        pageCache: { ...state.pageCache, [absolutePage]: verses },
      })),
    }),
    {
      name: 'repasa-storage-v2',
      partialize: (state) => ({
        completedVueltas: state.completedVueltas,
        pageStats: state.pageStats,
        reciter: state.reciter,
        pageCache: state.pageCache,
      }),
    }
  )
);
