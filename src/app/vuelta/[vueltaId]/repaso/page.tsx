"use client";

import { use, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Loader2,
  Square,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import {
  fetchPageVerses,
  getAyahAudioUrl,
  JUZ_STARTING_PAGES,
  RECITERS,
  type Reciter,
  type Verse,
} from "@/lib/quran";
import { useTranslation } from "@/hooks/useTranslation";

interface PlaylistPage {
  juzNum: number;
  localPageNumber: number;
  absolutePage: number;
  pageKey: string;
}

type Status = "idle" | "loading" | "playing" | "paused" | "finished";

function RepasoPlayer({ vueltaId }: { vueltaId: number }) {
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const reciter = useRepasaStore((s) => s.reciter);
  const setReciter = useRepasaStore((s) => s.setReciter);
  const cachePageVerses = useRepasaStore((s) => s.cachePageVerses);
  const incrementListen = useRepasaStore((s) => s.incrementListen);
  const incrementListenDetailed = useRepasaStore((s) => s.incrementListenDetailed);

  const pageId = 21 - vueltaId;

  const juzList = (searchParams.get("juzs") || "")
    .split(",")
    .map((n) => parseInt(n))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 30);
  const reps = Math.max(1, Math.min(100, parseInt(searchParams.get("reps") || "1") || 1));
  const mode: "seq" | "page" = searchParams.get("mode") === "page" ? "page" : "seq";

  const playlist: PlaylistPage[] = juzList.map((j) => ({
    juzNum: j,
    localPageNumber: (j - 1) * 20 + pageId,
    absolutePage: (JUZ_STARTING_PAGES[j - 1] ?? 1) + pageId - 1,
    pageKey: `juz_${j}_pagina_${pageId}`,
  }));

  // Posición imperativa (fuente de verdad para el motor de audio; el estado
  // de React es solo un espejo para la UI — así evitamos stale closures).
  const posRef = useRef({ pageIdx: 0, rep: 0, ayahIdx: 0 });
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const versesMapRef = useRef<Record<number, Verse[]>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<Status>("idle");

  const [status, setStatusState] = useState<Status>("idle");
  const [pageIdx, setPageIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [ayahIdx, setAyahIdx] = useState(0);
  const [ayahTotal, setAyahTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const setStatus = (s: Status) => {
    statusRef.current = s;
    setStatusState(s);
  };

  const syncUI = () => {
    const pos = posRef.current;
    setPageIdx(pos.pageIdx);
    setRep(pos.rep);
    setAyahIdx(pos.ayahIdx);
    const page = playlistRef.current[pos.pageIdx];
    setAyahTotal(page ? (versesMapRef.current[page.absolutePage]?.length ?? 0) : 0);
  };

  const getVerses = async (absolutePage: number): Promise<Verse[]> => {
    if (versesMapRef.current[absolutePage]) return versesMapRef.current[absolutePage];
    const cached = useRepasaStore.getState().pageCache[absolutePage];
    if (cached && cached.length > 0) {
      versesMapRef.current[absolutePage] = cached;
      return cached;
    }
    const data = await fetchPageVerses(absolutePage);
    versesMapRef.current[absolutePage] = data;
    cachePageVerses(absolutePage, data);
    return data;
  };

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.onended = () => handleEnded();
      a.onerror = () => {
        // Solo saltar si el error llega durante la reproducción activa
        if (statusRef.current === "playing" || statusRef.current === "loading") {
          skipPageOnError();
        }
      };
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const playCurrent = async () => {
    const pos = posRef.current;
    const page = playlistRef.current[pos.pageIdx];
    if (!page) return finish();

    const rec = useRepasaStore.getState().reciter;
    const audio = ensureAudio();
    setStatus("loading");
    syncUI();

    try {
      let url: string;
      if (rec === "krh") {
        url = `/Coran/${vueltaId}V/KRH/P${page.localPageNumber}.mp4`;
      } else {
        const verses = await getVerses(page.absolutePage);
        if (verses.length === 0) throw new Error("Página sin aleyas");
        if (pos.ayahIdx >= verses.length) pos.ayahIdx = 0;
        url = getAyahAudioUrl(verses[pos.ayahIdx].verse_key, rec, vueltaId);
      }
      audio.src = url;
      await audio.play();
      setStatus("playing");
      setErrorMsg("");
      syncUI();
      prefetchNext();
    } catch {
      skipPageOnError();
    }
  };

  // Precargar las aleyas de la siguiente página mientras suena la actual
  const prefetchNext = () => {
    const pos = posRef.current;
    const next = playlistRef.current[pos.pageIdx + 1];
    if (next && useRepasaStore.getState().reciter !== "krh") {
      getVerses(next.absolutePage).catch(() => {});
    }
  };

  const handleEnded = () => {
    const pos = posRef.current;
    const page = playlistRef.current[pos.pageIdx];
    if (!page) return finish();
    const rec = useRepasaStore.getState().reciter;

    if (rec !== "krh") {
      const verses = versesMapRef.current[page.absolutePage] || [];
      if (pos.ayahIdx + 1 < verses.length) {
        pos.ayahIdx++;
        playCurrent();
        return;
      }
    }

    // Página completada: registrar la escucha en las estadísticas
    incrementListen(page.pageKey);
    incrementListenDetailed(page.pageKey, "page", rec);
    advancePage(false);
  };

  const advancePage = (skipped: boolean) => {
    const pos = posRef.current;
    pos.ayahIdx = 0;

    if (mode === "page") {
      // Repetir la misma página hasta agotar las repeticiones
      if (!skipped && pos.rep + 1 < reps) {
        pos.rep++;
      } else {
        pos.rep = 0;
        pos.pageIdx++;
      }
      if (pos.pageIdx >= playlistRef.current.length) return finish();
    } else {
      // Secuencia completa: todas las páginas, luego siguiente repetición
      if (pos.pageIdx + 1 < playlistRef.current.length) {
        pos.pageIdx++;
      } else if (pos.rep + 1 < reps) {
        pos.rep++;
        pos.pageIdx = 0;
      } else {
        return finish();
      }
    }
    playCurrent();
  };

  const skipPageOnError = () => {
    const pos = posRef.current;
    const page = playlistRef.current[pos.pageIdx];
    setErrorMsg(t("multi.errorPage", { p: page ? String(page.localPageNumber) : "?" }));
    advancePage(true);
  };

  const finish = () => {
    audioRef.current?.pause();
    setStatus("finished");
    syncUI();
  };

  const togglePlay = () => {
    const audio = ensureAudio();
    if (statusRef.current === "playing") {
      audio.pause();
      setStatus("paused");
    } else if (statusRef.current === "paused" && audio.src) {
      audio.play().then(() => setStatus("playing")).catch(() => skipPageOnError());
    } else {
      // idle o finished: empezar desde el principio
      posRef.current = { pageIdx: 0, rep: 0, ayahIdx: 0 };
      setErrorMsg("");
      playCurrent();
    }
  };

  const goToPage = (delta: 1 | -1) => {
    const pos = posRef.current;
    const next = pos.pageIdx + delta;
    if (next < 0 || next >= playlistRef.current.length) return;
    pos.pageIdx = next;
    pos.ayahIdx = 0;
    if (mode === "page") pos.rep = 0;
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      playCurrent();
    } else {
      audioRef.current?.pause();
      audioRef.current?.removeAttribute("src");
      setStatus("idle");
      syncUI();
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    posRef.current = { pageIdx: 0, rep: 0, ayahIdx: 0 };
    setStatus("idle");
    setErrorMsg("");
    syncUI();
  };

  const changeReciter = (r: Reciter) => {
    setReciter(r);
    // Reiniciar la página actual con el nuevo recitador
    posRef.current.ayahIdx = 0;
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      playCurrent();
    } else {
      syncUI();
    }
  };

  // Limpieza al salir de la página
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
      }
    };
  }, []);

  const currentPage = playlist[pageIdx];

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <p className="text-sm opacity-60">{t("multi.emptySelection")}</p>
        <p className="text-xs opacity-40">{t("multi.noPagesHint")}</p>
        <Link
          href={`/vuelta/${vueltaId}`}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
        >
          {t("multi.backToVuelta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen premium-gradient">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-gold)]/30 shadow-sm">
        <Link
          href={`/vuelta/${vueltaId}`}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[var(--color-primary)]" />
            {t("multi.title")}
          </h1>
          <p className="text-[10px] opacity-50 uppercase tracking-wider">
            {t("juz.vuelta")} {vueltaId} · {t("multi.selectedCount", { n: playlist.length })}
          </p>
        </div>
        <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full shrink-0">
          {t("multi.repOf", { r: rep + 1, n: reps })}
        </span>
      </header>

      {/* Selector de recitador */}
      <div className="flex-none flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto">
        {(Object.keys(RECITERS) as Reciter[]).map((r) => (
          <button
            key={r}
            onClick={() => changeReciter(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              reciter === r
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-background)] opacity-60 hover:opacity-100"
            }`}
          >
            {RECITERS[r].nameEs}
          </button>
        ))}
      </div>

      {/* Lista de páginas seleccionadas (chips) */}
      <div className="flex-none flex items-center gap-2 px-4 py-2.5 overflow-x-auto border-b border-[var(--color-border)]">
        {playlist.map((p, i) => (
          <button
            key={p.juzNum}
            onClick={() => {
              posRef.current.pageIdx = i;
              posRef.current.ayahIdx = 0;
              if (mode === "page") posRef.current.rep = 0;
              if (statusRef.current === "playing" || statusRef.current === "loading") {
                playCurrent();
              } else {
                syncUI();
              }
            }}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              i === pageIdx
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : i < pageIdx
                ? "border-[var(--color-primary)]/40 text-[var(--color-primary)] opacity-70"
                : "border-[var(--color-border)] opacity-50"
            }`}
          >
            J{p.juzNum} · P{p.localPageNumber}
          </button>
        ))}
      </div>

      {/* Página actual (imagen del Mushaf) */}
      <main className="flex-1 overflow-y-auto">
        {currentPage && (
          <div className="w-full mx-auto max-w-lg premium-card rounded-xl overflow-hidden relative mt-3">
            <div className="relative w-full aspect-[2/3] flex items-center justify-center p-2 bg-white/50">
              {/* key fuerza recargar la imagen al cambiar de página */}
              <img
                key={currentPage.localPageNumber}
                src={`/Coran/${vueltaId}V/P${currentPage.localPageNumber}.png`}
                alt={`Página ${currentPage.localPageNumber} del Mushaf`}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>
        )}
        <div className="h-40" />
      </main>

      {/* Controles fijos inferiores */}
      <section className="flex-none fixed bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {errorMsg && (
          <p className="text-[11px] text-center text-[var(--color-gold)] font-medium mb-2">
            {errorMsg}
          </p>
        )}

        {/* Indicadores de posición */}
        <div className="flex justify-center gap-5 mb-3 text-xs opacity-60 font-medium">
          <span>
            {t("multi.pageOf", { i: pageIdx + 1, n: playlist.length })}
            {currentPage && ` · Juz ${currentPage.juzNum}`}
          </span>
          {reciter !== "krh" && ayahTotal > 0 && status !== "idle" && status !== "finished" && (
            <span>{t("multi.ayahOf", { i: ayahIdx + 1, n: ayahTotal })}</span>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
          {/* Detener */}
          <button
            onClick={stop}
            title={t("multi.stop")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-red-400 transition-all active:scale-95"
          >
            <Square className="w-4 h-4 opacity-60" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => goToPage(-1)}
            disabled={pageIdx === 0}
            title={t("multi.prevPage")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all active:scale-95 disabled:opacity-30"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play / Pausa */}
          <button
            onClick={togglePlay}
            title={status === "playing" ? t("multi.pause") : t("multi.play")}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30 transition-all active:scale-95"
          >
            {status === "loading" ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : status === "playing" ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </button>

          {/* Página siguiente */}
          <button
            onClick={() => goToPage(1)}
            disabled={pageIdx >= playlist.length - 1}
            title={t("multi.nextPage")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all active:scale-95 disabled:opacity-30"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Espaciador simétrico */}
          <div className="w-10" />
        </div>
      </section>

      {/* Modal de repaso completado */}
      {status === "finished" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
            <CheckCircle2 className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2 text-[var(--color-primary)]">
              {t("multi.finished")}
            </h3>
            <p className="text-sm opacity-70 mb-6">
              {t("multi.finishedDesc", { pages: playlist.length, reps })}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/vuelta/${vueltaId}`}
                className="flex-1 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-background)] active:scale-95 transition-all"
              >
                {t("multi.backToVuelta")}
              </Link>
              <button
                onClick={togglePlay}
                className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                {t("multi.restart")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepasoPage({
  params,
}: {
  params: Promise<{ vueltaId: string }>;
}) {
  const { vueltaId } = use(params);
  return (
    <Suspense fallback={null}>
      <RepasoPlayer vueltaId={parseInt(vueltaId)} />
    </Suspense>
  );
}
