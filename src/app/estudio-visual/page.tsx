"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LayoutGrid, Play } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { vueltaJuzOfAbsolutePage, pageImageUrl } from "@/lib/quran";

function EstudioVisual() {
  const router = useRouter();
  const [pages, setPages] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const markVueltaCompleted = useRepasaStore(s => s.markVueltaCompleted);
  const markPageStudied = useRepasaStore(s => s.markPageStudied);
  
  const globalAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("ESTUDIO_VISUAL_KEY");
    if (data) {
      setPages(JSON.parse(data));
    } else {
      router.push("/repaso-libre/nuevo");
    }
  }, [router]);

  if (pages.length === 0) return null;

  const absolutePage = pages[currentIndex];
  const { juz, vuelta } = vueltaJuzOfAbsolutePage(absolutePage);
  const localPageNumber = (juz - 1) * 20 + (21 - vuelta);

  const handleNext = () => {
    // Marcar como completada en la ruta Otomana
    markVueltaCompleted(juz.toString(), vuelta);
    markPageStudied(absolutePage);
    
    // Detener audio si estaba sonando
    if (globalAudioRef.current) {
      globalAudioRef.current.pause();
    }

    if (currentIndex < pages.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      router.push("/repaso-libre/nuevo");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-gold)]/30 shadow-sm">
        <button
          onClick={() => router.push("/repaso-libre/nuevo")}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center flex-1">
          <h1 className="text-base font-bold flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
            Ruta Otomana
          </h1>
          <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">
            Página {currentIndex + 1} de {pages.length}
          </p>
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Main Content - Image */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)] relative">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/5 to-transparent h-10 pointer-events-none" />
          
          <img
            src={pageImageUrl(juz, vuelta) + "?v=2"}
            alt={`Página del Mushaf Juz ${juz} Vuelta ${vuelta}`}
            className="w-full h-auto object-contain mix-blend-multiply"
          />
          
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[var(--color-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[var(--color-primary)]/20">
            Juz {juz} · Vuelta {vuelta}
          </div>
        </div>
      </main>

      {/* Bottom Controls */}
      <section className="sticky bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-[var(--color-border)] p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          
          {/* Audio Player para KRH */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 ml-1" />
            </div>
            <audio 
              ref={globalAudioRef}
              controls 
              className="w-full h-10 rounded-full" 
              src={`/Coran/${vuelta}V/KRH/P${localPageNumber}.mp4`}
            />
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {currentIndex < pages.length - 1 ? "Me la sé, Siguiente" : "Me la sé, Terminar Ruta"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function EstudioVisualPage() {
  return (
    <Suspense fallback={null}>
      <EstudioVisual />
    </Suspense>
  );
}
