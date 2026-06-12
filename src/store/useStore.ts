import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reciter, Verse } from '@/lib/quran';
import { getAccessToken } from '@/lib/firebase';

type PageStats = Record<string, { listenCount: number; recordCount: number }>;
type ListenStats = Record<string, { type: 'page' | 'ayah'; counts: Record<string, number> }>;

interface RepasaState {
  completedVueltas: Record<string, number[]>;
  pageStats: PageStats;
  listenStats: ListenStats;
  reciter: Reciter;
  pageCache: Record<number, Verse[]>;
  availableVueltas: number[];
  locale: 'es' | 'tr';
  hasSeenHomeTour: boolean;
  hasSeenJuzTour: boolean;

  markVueltaCompleted: (juzId: string, vueltaId: number) => void;
  toggleVueltaCompleted: (juzId: string, vueltaId: number) => void;
  incrementListen: (pageKey: string) => void;
  incrementListenDetailed: (targetId: string, type: 'page' | 'ayah', reciter: string) => void;
  incrementRecord: (pageKey: string) => void;
  setReciter: (reciter: Reciter) => void;
  cachePageVerses: (absolutePage: number, verses: Verse[]) => void;
  fetchAvailableVueltas: () => Promise<void>;
  loadProgressFromServer: () => Promise<void>;
  setLocale: (locale: 'es' | 'tr') => void;
  markHomeTourSeen: () => void;
  markJuzTourSeen: () => void;
  resetTours: () => void;
}

const syncToServer = async (state: Pick<RepasaState, 'completedVueltas' | 'pageStats' | 'listenStats'>) => {
  if (typeof window === 'undefined') return;
  const token = await getAccessToken();
  if (!token) return;
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        completedVueltas: state.completedVueltas,
        pageStats: state.pageStats,
        listenStats: state.listenStats
      })
    });
  } catch (e) {
    console.error("Error al sincronizar progreso con el servidor:", e);
  }
};

// Fusiona el progreso remoto con el local sin perder nada: unión de vueltas
// completadas y máximo de cada contador (lo hecho offline no se pisa).
const mergeProgress = (
  local: Pick<RepasaState, 'completedVueltas' | 'pageStats' | 'listenStats'>,
  remote: { completedVueltas?: Record<string, number[]>; pageStats?: PageStats; listenStats?: ListenStats }
) => {
  const completedVueltas: Record<string, number[]> = { ...local.completedVueltas };
  for (const [juzId, vueltas] of Object.entries(remote.completedVueltas || {})) {
    if (!Array.isArray(vueltas)) continue;
    completedVueltas[juzId] = Array.from(new Set([...(completedVueltas[juzId] || []), ...vueltas]));
  }

  const pageStats: PageStats = { ...local.pageStats };
  for (const [key, stats] of Object.entries(remote.pageStats || {})) {
    const cur = pageStats[key] || { listenCount: 0, recordCount: 0 };
    pageStats[key] = {
      listenCount: Math.max(cur.listenCount, stats?.listenCount || 0),
      recordCount: Math.max(cur.recordCount, stats?.recordCount || 0),
    };
  }

  const listenStats: ListenStats = { ...local.listenStats };
  for (const [targetId, remoteTarget] of Object.entries(remote.listenStats || {})) {
    const curTarget = listenStats[targetId] || { type: remoteTarget.type, counts: {} };
    const counts: Record<string, number> = { ...curTarget.counts };
    for (const [reciter, count] of Object.entries(remoteTarget.counts || {})) {
      counts[reciter] = Math.max(counts[reciter] || 0, count || 0);
    }
    listenStats[targetId] = { ...curTarget, counts };
  }

  return { completedVueltas, pageStats, listenStats };
};

export const useRepasaStore = create<RepasaState>()(
  persist(
    (set, get) => ({
      completedVueltas: {},
      pageStats: {},
      listenStats: {},
      reciter: 'husary',
      pageCache: {},
      availableVueltas: [1, 2], // Valor inicial por defecto
      locale: 'es' as const,
      hasSeenHomeTour: false,
      hasSeenJuzTour: false,

      markVueltaCompleted: (juzId, vueltaId) => set((state) => {
        const currentJuz = state.completedVueltas[juzId] || [];
        if (currentJuz.includes(vueltaId)) return state;
        const updated = {
          completedVueltas: {
            ...state.completedVueltas,
            [juzId]: [...currentJuz, vueltaId],
          },
        };
        setTimeout(() => syncToServer({ ...state, ...updated }), 0);
        return updated;
      }),

      toggleVueltaCompleted: (juzId, vueltaId) => set((state) => {
        const currentJuz = state.completedVueltas[juzId] || [];
        const updated = {
          completedVueltas: {
            ...state.completedVueltas,
            [juzId]: currentJuz.includes(vueltaId)
              ? currentJuz.filter((v) => v !== vueltaId)
              : [...currentJuz, vueltaId],
          },
        };
        setTimeout(() => syncToServer({ ...state, ...updated }), 0);
        return updated;
      }),

      incrementListen: (pageKey) => set((state) => {
        const cur = state.pageStats[pageKey] || { listenCount: 0, recordCount: 0 };
        const updated = {
          pageStats: { ...state.pageStats, [pageKey]: { ...cur, listenCount: cur.listenCount + 1 } },
        };
        setTimeout(() => syncToServer({ ...state, ...updated }), 0);
        return updated;
      }),

      incrementListenDetailed: (targetId, type, reciter) => set((state) => {
        const listenStats = state.listenStats || {};
        const currentTarget = listenStats[targetId] || { type, counts: {} };
        const currentCount = currentTarget.counts[reciter] || 0;
        const updated = {
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
        setTimeout(() => syncToServer({ ...state, ...updated }), 0);
        return updated;
      }),

      incrementRecord: (pageKey) => set((state) => {
        const cur = state.pageStats[pageKey] || { listenCount: 0, recordCount: 0 };
        const updated = {
          pageStats: { ...state.pageStats, [pageKey]: { ...cur, recordCount: cur.recordCount + 1 } },
        };
        setTimeout(() => syncToServer({ ...state, ...updated }), 0);
        return updated;
      }),

      setReciter: (reciter) => set({ reciter }),

      cachePageVerses: (absolutePage, verses) => set((state) => ({
        pageCache: { ...state.pageCache, [absolutePage]: verses },
      })),

      loadProgressFromServer: async () => {
        const token = await getAccessToken();
        if (!token) return;
        try {
          const res = await fetch('/api/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) return;
          const remote = await res.json();
          const merged = mergeProgress(get(), remote);
          set(merged);
          // Subir el resultado fusionado para que el servidor también quede al día
          syncToServer(merged);
        } catch (e) {
          console.error("Error al cargar el progreso desde el servidor:", e);
        }
      },

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

      markHomeTourSeen: () => set({ hasSeenHomeTour: true }),
      markJuzTourSeen: () => set({ hasSeenJuzTour: true }),
      resetTours: () => set({ hasSeenHomeTour: false, hasSeenJuzTour: false }),
    }),
    {
      name: 'repaso-storage-v3', // Nombre actualizado de la plataforma
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
      }),
    }
  )
);
