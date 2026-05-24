import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reciter, Verse } from '@/lib/quran';

interface RepasaState {
  completedVueltas: Record<string, number[]>;
  pageStats: Record<string, { listenCount: number; recordCount: number }>;
  reciter: Reciter;
  pageCache: Record<number, Verse[]>;
  availableVueltas: number[];
  locale: 'es' | 'tr';

  markVueltaCompleted: (juzId: string, vueltaId: number) => void;
  toggleVueltaCompleted: (juzId: string, vueltaId: number) => void;
  incrementListen: (pageKey: string) => void;
  incrementRecord: (pageKey: string) => void;
  setReciter: (reciter: Reciter) => void;
  cachePageVerses: (absolutePage: number, verses: Verse[]) => void;
  fetchAvailableVueltas: () => Promise<void>;
  setLocale: (locale: 'es' | 'tr') => void;
}

export const useRepasaStore = create<RepasaState>()(
  persist(
    (set, get) => ({
      completedVueltas: {},
      pageStats: {},
      reciter: 'husary',
      pageCache: {},
      availableVueltas: [1, 2], // Valor inicial por defecto
      locale: 'es' as const,

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

      fetchAvailableVueltas: async () => {
        try {
          const res = await fetch('/api/vueltas');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set({ availableVueltas: data });
            }
          }
        } catch (e) {
          console.error("Error al obtener las vueltas desde la API:", e);
        }
      },

      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'repaso-storage-v3', // Nombre actualizado de la plataforma
      partialize: (state) => ({
        completedVueltas: state.completedVueltas,
        pageStats: state.pageStats,
        reciter: state.reciter,
        pageCache: state.pageCache,
        availableVueltas: state.availableVueltas,
        locale: state.locale,
      }),
    }
  )
);
