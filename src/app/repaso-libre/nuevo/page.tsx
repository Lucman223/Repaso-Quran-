"use client";

import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  ListVideo,
  LayoutGrid,
  Play,
  Plus,
  Trash2,
  X,
  ChevronLeft
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRepasaStore } from "@/store/useStore";
import { REPASO_LIBRE_KEY, type RepasoLibreConfig } from "@/lib/repasoLibre";
import { JUZ_STARTING_PAGES } from "@/lib/quran";

type Tab = "smart" | "playlists" | "heatmap";

function getPageColor(history: string[] | undefined): string {
  if (!history || history.length === 0) return "bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"; // Gray
  const lastDate = new Date(history[history.length - 1]);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays > 7) return "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800/50"; // Red
  if (diffDays > 3) return "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800/50"; // Yellow
  return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/50"; // Green
}

function NuevoCentroRepaso() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const pageStudyHistory = useRepasaStore(s => s.pageStudyHistory);
  const playlists = useRepasaStore(s => s.playlists);
  const createPlaylist = useRepasaStore(s => s.createPlaylist);
  const deletePlaylist = useRepasaStore(s => s.deletePlaylist);

  const [activeTab, setActiveTab] = useState<Tab>("smart");
  
  // Heatmap State
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  
  // Cart / Selection State
  const [cart, setCart] = useState<number[]>([]);
  const [reps, setReps] = useState(1);
  const [mode, setMode] = useState<"seq" | "page">("seq");
  
  const startReview = (pages: number[], forceReps = reps, forceMode = mode) => {
    if (pages.length === 0) return;
    const config: RepasoLibreConfig = {
      segmentos: pages.map(p => ({ tipo: "absoluta", pagina: p })),
      reps: forceReps,
      mode: forceMode
    };
    sessionStorage.setItem(REPASO_LIBRE_KEY, JSON.stringify(config));
    router.push("/repaso-libre");
  };

  const togglePageInCart = (page: number) => {
    setCart(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page].sort((a,b)=>a-b));
  };

  const handleSmartQueue = () => {
    // Encuentra hasta 10 páginas que no han sido estudiadas nunca, o hace más de 7 días
    const candidates: {page: number, score: number}[] = [];
    for (let i = 1; i <= 604; i++) {
      const hist = pageStudyHistory[i];
      if (!hist || hist.length === 0) {
        candidates.push({page: i, score: 999}); // Max priority
      } else {
        const lastDate = new Date(hist[hist.length - 1]);
        const diffDays = Math.ceil(Math.abs(new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
          candidates.push({page: i, score: diffDays});
        }
      }
    }
    // Sort by score descending
    candidates.sort((a,b) => b.score - a.score);
    const selected = candidates.slice(0, 10).map(c => c.page);
    
    // Si el usuario lo ha estudiado TODO recientemente, elegimos 10 aleatorias para que no se quede vacío
    if (selected.length === 0) {
      for(let i=0; i<10; i++) selected.push(Math.floor(Math.random() * 604) + 1);
    }
    
    startReview(selected, 1, "seq");
  };

  const handleCreatePlaylist = () => {
    if (cart.length === 0) return;
    const name = prompt("Nombre de la nueva lista:");
    if (name) {
      createPlaylist(name, cart);
      setCart([]);
      setActiveTab("playlists");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 bg-[var(--color-background)]/90 backdrop-blur border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 p-4">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[var(--color-primary)]" />
              {t("centro.title")}
            </h1>
            <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-widest">
              {t("centro.subtitle")}
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3 overflow-x-auto">
          {[
            { id: "smart", icon: BrainCircuit, label: t("centro.tabSmart") },
            { id: "playlists", icon: ListVideo, label: t("centro.tabPlaylists") },
            { id: "heatmap", icon: LayoutGrid, label: t("centro.tabHeatmap") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id 
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                  : "bg-[var(--color-card)] border border-[var(--color-border)] opacity-70 hover:opacity-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 pb-48 max-w-xl mx-auto w-full">
        {/* Tab: Inteligente */}
        {activeTab === "smart" && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">{t("centro.smartTitle")}</h2>
              <p className="text-sm opacity-60 max-w-sm mx-auto leading-relaxed">
                {t("centro.smartDesc")}
              </p>
            </div>
            <button 
              onClick={handleSmartQueue}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              {t("centro.smartBtn")}
            </button>
          </div>
        )}

        {/* Tab: Playlists */}
        {activeTab === "playlists" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider opacity-70">
                {t("centro.playlistTitle")}
              </h2>
            </div>
            
            {Object.keys(playlists).length === 0 ? (
              <div className="text-center py-10 opacity-50 text-sm">
                {t("centro.playlistEmpty")}
              </div>
            ) : (
              <div className="grid gap-3">
                {Object.entries(playlists).map(([name, pages]) => (
                  <div key={name} className="flex items-center bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-1 pr-4 overflow-hidden group">
                    <button 
                      onClick={() => startReview(pages)}
                      className="flex-1 flex items-center gap-4 p-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 text-[var(--color-primary)] ml-1" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{name}</h3>
                        <p className="text-xs opacity-60">{pages.length} páginas</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => deletePlaylist(name)}
                      className="p-2 text-red-500 opacity-50 hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Mapa de Calor */}
        {activeTab === "heatmap" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {!selectedJuz ? (
              <>
                <p className="text-[11px] uppercase tracking-wider opacity-60 mb-4 font-semibold text-center">
                  {t("centro.heatmapDesc")}
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                    <button
                      key={j}
                      onClick={() => setSelectedJuz(j)}
                      className="aspect-square flex flex-col items-center justify-center rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors active:scale-95"
                    >
                      <span className="text-[10px] opacity-50 uppercase font-bold">Juz</span>
                      <span className="text-xl font-bold">{j}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedJuz(null)}
                  className="flex items-center gap-2 text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver a Juzs
                </button>
                <h3 className="text-lg font-bold">Juz {selectedJuz}</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {Array.from({length: 20}, (_, i) => {
                    const absPage = (JUZ_STARTING_PAGES[selectedJuz - 1] ?? 1) + i;
                    const isSelected = cart.includes(absPage);
                    const colorClass = getPageColor(pageStudyHistory[absPage]);
                    
                    return (
                      <button
                        key={absPage}
                        onClick={() => togglePageInCart(absPage)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-90 ${colorClass} ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-background)] scale-95 opacity-100 shadow-md' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span className="text-lg font-bold">{i + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Carrito de selección (sólo visible en Heatmap si hay items) */}
      {activeTab === "heatmap" && cart.length > 0 && (
        <section className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-full">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[var(--color-primary)]">
                {cart.length} páginas seleccionadas
              </p>
              <button 
                onClick={() => setCart([])}
                className="text-xs font-semibold opacity-60 hover:opacity-100 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> {t("centro.cartClear")}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 py-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 opacity-70" />
                {t("centro.cartSave")}
              </button>
              <button
                onClick={() => startReview(cart)}
                className="flex-[2] py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {t("centro.cartStart", {n: cart.length})}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function NuevoCentroRepasoPage() {
  return (
    <Suspense fallback={null}>
      <NuevoCentroRepaso />
    </Suspense>
  );
}
