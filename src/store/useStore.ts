import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOTAL_MUSHAF_PAGES, type Reciter, type Verse } from '@/lib/quran';
import { getTodayDateString } from '@/lib/dateUtils';

type PageStats = Record<string, { listenCount: number; recordCount: number }>;
type ListenStats = Record<string, { type: 'page' | 'ayah'; counts: Record<string, number> }>;

// Forma del estado guardado en localStorage
type PersistedState = {
  completedVueltas: Record<string, number[]>;
  pageStats: PageStats;
  listenStats: ListenStats;
  reciter: Reciter;
  pageCache: Record<number, Verse[]>;
  availableVueltas: number[];
  locale: 'es' | 'tr';
  hasSeenHomeTour: boolean;
  hasSeenJuzTour: boolean;
  // NUEVO: Historial de estudio de páginas. Mapea número de página absoluto a fechas de estudio (YYYY-MM-DD)
  pageStudyHistory: Record<number, string[]>;
  // Lectura secuencial (Jatma completa): última página leída, meta diaria y páginas leídas por día
  lecturaCurrentPage: number;
  lecturaDailyGoal: number;
  lecturaHistory: Record<string, number>;
  // Playlists de repaso
  playlists: Record<string, number[]>;
};

interface RepasaState extends PersistedState {
  markVueltaCompleted: (juzId: string, vueltaId: number) => void;
  toggleVueltaCompleted: (juzId: string, vueltaId: number) => void;
  incrementListen: (pageKey: string) => void;
  incrementListenDetailed: (targetId: string, type: 'page' | 'ayah', reciter: string) => void;
  incrementRecord: (pageKey: string) => void;
  setReciter: (reciter: Reciter) => void;
  cachePageVerses: (absolutePage: number, verses: Verse[]) => void;
  fetchAvailableVueltas: () => Promise<void>;
  setLocale: (locale: 'es' | 'tr') => void;
  markHomeTourSeen: () => void;
  markJuzTourSeen: () => void;
  resetTours: () => void;
  markPageStudied: (absolutePage: number) => void;
  adjustLecturaPage: (delta: number) => void;
  setLecturaDailyGoal: (goal: number) => void;
  createPlaylist: (name: string, pages: number[]) => void;
  deletePlaylist: (name: string) => void;
}

export const useRepasaStore = create<RepasaState>()(
  persist(
    (set, get) => ({
      completedVueltas: {},
      pageStats: {},
      listenStats: {},
      reciter: 'husary',
      pageCache: {},
      availableVueltas: [1, 2], // Valor inicial por defecto
      locale: 'tr' as const,
      hasSeenHomeTour: false,
      hasSeenJuzTour: false,
      pageStudyHistory: {},
      lecturaCurrentPage: 0,
      lecturaDailyGoal: 10,
      lecturaHistory: {},
      playlists: {},

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

      incrementListenDetailed: (targetId, type, reciter) => set((state) => {
        const listenStats = state.listenStats || {};
        const currentTarget = listenStats[targetId] || { type, counts: {} };
        const currentCount = currentTarget.counts[reciter] || 0;
        return {
          listenStats: {
            ...listenStats,
            [targetId]: {
              ...currentTarget,
              counts: {
                ...currentTarget.counts,
                [reciter]: currentCount + 1,
              },
            },
          },
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
        // Al ser 100% local ahora, podemos definir esto estáticamente o mantener la api si hace falta.
        // Asumo que para uso personal, tienes todas disponibles, pero por ahora devolvemos estático.
        set({ availableVueltas: Array.from({length: 20}, (_, i) => i + 1) });
      },

      setLocale: (locale) => set({ locale }),

      markHomeTourSeen: () => set({ hasSeenHomeTour: true }),
      markJuzTourSeen: () => set({ hasSeenJuzTour: true }),
      resetTours: () => set({ hasSeenHomeTour: false, hasSeenJuzTour: false }),

      markPageStudied: (absolutePage: number) => set((state) => {
        const today = getTodayDateString();
        const currentHistory = state.pageStudyHistory[absolutePage] || [];
        if (currentHistory.includes(today)) return state; // Ya marcada hoy
        
        return {
          pageStudyHistory: {
            ...state.pageStudyHistory,
            [absolutePage]: [...currentHistory, today]
          }
        };
      }),

      adjustLecturaPage: (delta: number) => set((state) => {
        const newPage = Math.max(0, Math.min(TOTAL_MUSHAF_PAGES, state.lecturaCurrentPage + delta));
        const actualDelta = newPage - state.lecturaCurrentPage;
        if (actualDelta === 0) return state;
        const today = getTodayDateString();
        const todayCount = state.lecturaHistory[today] || 0;
        const newTodayCount = Math.max(0, todayCount + actualDelta);
        return {
          lecturaCurrentPage: newPage,
          lecturaHistory: { ...state.lecturaHistory, [today]: newTodayCount },
        };
      }),

      setLecturaDailyGoal: (goal: number) => set({
        lecturaDailyGoal: Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, Math.round(goal))),
      }),

      createPlaylist: (name: string, pages: number[]) => set((state) => ({
        playlists: { ...state.playlists, [name]: pages },
      })),

      deletePlaylist: (name: string) => set((state) => {
        const newPlaylists = { ...state.playlists };
        delete newPlaylists[name];
        return { playlists: newPlaylists };
      }),
    }),
    {
      name: 'repaso-storage-v4', // Incrementamos versión para el rediseño personal
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as PersistedState;
        let migrated = state;
        if (version < 2) {
          // Si migramos desde una versión anterior, añadimos el campo nuevo
          migrated = { ...migrated, pageStudyHistory: {} };
        }
        if (version < 3) {
          migrated = {
            ...migrated,
            lecturaCurrentPage: migrated.lecturaCurrentPage ?? 0,
            lecturaDailyGoal: migrated.lecturaDailyGoal ?? 10,
            lecturaHistory: migrated.lecturaHistory ?? {},
          };
        }
        if (version < 4) {
          migrated = {
            ...migrated,
            playlists: migrated.playlists ?? {},
          };
        }
        return migrated;
      },
      partialize: (state) => ({
        completedVueltas: state.completedVueltas,
        pageStats: state.pageStats,
        listenStats: state.listenStats,
        reciter: state.reciter,
        pageCache: state.pageCache,
        availableVueltas: state.availableVueltas,
        locale: state.locale,
        hasSeenHomeTour: state.hasSeenHomeTour,
        hasSeenJuzTour: state.hasSeenJuzTour,
        pageStudyHistory: state.pageStudyHistory,
        lecturaCurrentPage: state.lecturaCurrentPage,
        lecturaDailyGoal: state.lecturaDailyGoal,
        lecturaHistory: state.lecturaHistory,
        playlists: state.playlists,
      }),
    }
  )
);
