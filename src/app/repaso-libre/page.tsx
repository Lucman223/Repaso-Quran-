"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
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
  ImageOff,
} from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import {
  getAyahAudioUrl,
  pageImageUrl,
  absolutePageOf,
  juzOfAbsolutePage,
  RECITERS,
  type Reciter,
} from "@/lib/quran";
import {
  resolverSegmento,
  type Segmento,
  type SegmentoResuelto,
} from "@/lib/segmentos";
import { REPASO_LIBRE_KEY, type RepasoLibreConfig } from "@/lib/repasoLibre";
import { useTranslation } from "@/hooks/useTranslation";

type Status = "idle" | "loading" | "playing" | "paused" | "finished";

// Item de la playlist ya resuelto: aleyas a reproducir + páginas a mostrar.
interface PlaylistItem extends SegmentoResuelto {
  seg: Segmento;
}

function RepasoLibrePlayer() {
  const { t } = useTranslation();

  const reciter = useRepasaStore((s) => s.reciter);
  const setReciter = useRepasaStore((s) => s.setReciter);
  const incrementListen = useRepasaStore((s) => s.incrementListen);
  const incrementListenDetailed = useRepasaStore((s) => s.incrementListenDetailed);

  const [config, setConfig] = useState<RepasoLibreConfig | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState("");
  // Páginas cuya imagen falló al cargar → mostrar placeholder.
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const reps = config?.reps ?? 1;
  const mode = config?.mode ?? "seq";

  // Posición imperativa (fuente de verdad del motor de audio).
  const posRef = useRef({ itemIdx: 0, rep: 0, ayahIdx: 0 });
  const playlistRef = useRef<PlaylistItem[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<Status>("idle");

  // Espejo imperativo de la playlist para el motor de audio (evita stale
  // closures sin tocar el ref durante el render).
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const [status, setStatusState] = useState<Status>("idle");
  const [itemIdx, setItemIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [ayahIdx, setAyahIdx] = useState(0);
  const [ayahTotal, setAyahTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const setStatus = (s: Status) => {
    statusRef.current = s;
    setStatusState(s);
  };

  // Cargar y resolver los segmentos al montar.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = sessionStorage.getItem(REPASO_LIBRE_KEY);
        if (!raw) {
          setResolving(false);
          return;
        }
        const cfg = JSON.parse(raw) as RepasoLibreConfig;
        if (cancelled) return;
        setConfig(cfg);

        const resolved: PlaylistItem[] = [];
        for (const seg of cfg.segmentos) {
          const r = await resolverSegmento(seg, { absolutePageOf });
          if (cancelled) return;
          resolved.push({ ...r, seg });
        }
        setPlaylist(resolved);
      } catch (e) {
        setResolveError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncUI = () => {
    const pos = posRef.current;
    setItemIdx(pos.itemIdx);
    setRep(pos.rep);
    setAyahIdx(pos.ayahIdx);
    const item = playlistRef.current[pos.itemIdx];
    setAyahTotal(item ? item.verses.length : 0);
  };

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.onended = () => handleEnded();
      a.onerror = () => {
        if (statusRef.current === "playing" || statusRef.current === "loading") {
          skipItemOnError();
        }
      };
      audioRef.current = a;
    }
    return audioRef.current;
  };

  // Para repaso libre el audio es siempre por aleya: KRH no tiene pista de
  // página completa para páginas arbitrarias, así que si está seleccionado y no
  // hay archivo, cae a un recitador online. Husary/Minshawi cubren todo.
  const effectiveReciter = (): Reciter => {
    const r = useRepasaStore.getState().reciter;
    return r === "krh" ? "husary" : r;
  };

  const playCurrent = async () => {
    const pos = posRef.current;
    const item = playlistRef.current[pos.itemIdx];
    if (!item || item.verses.length === 0) return finish();

    const rec = effectiveReciter();
    const audio = ensureAudio();
    setStatus("loading");
    syncUI();

    try {
      if (pos.ayahIdx >= item.verses.length) pos.ayahIdx = 0;
      const verse = item.verses[pos.ayahIdx];
      audio.src = getAyahAudioUrl(verse.verse_key, rec);
      await audio.play();
      setStatus("playing");
      setErrorMsg("");
      syncUI();
    } catch {
      skipItemOnError();
    }
  };

  const handleEnded = () => {
    const pos = posRef.current;
    const item = playlistRef.current[pos.itemIdx];
    if (!item) return finish();

    if (pos.ayahIdx + 1 < item.verses.length) {
      pos.ayahIdx++;
      playCurrent();
      return;
    }

    // Item completado: registrar la escucha (clave por páginas que cubre).
    const rec = effectiveReciter();
    const pageKey = `libre_${item.pages.join("-")}`;
    incrementListen(pageKey);
    incrementListenDetailed(pageKey, "page", rec);
    advanceItem(false);
  };

  const advanceItem = (skipped: boolean) => {
    const pos = posRef.current;
    pos.ayahIdx = 0;

    if (mode === "page") {
      if (!skipped && pos.rep + 1 < reps) {
        pos.rep++;
      } else {
        pos.rep = 0;
        pos.itemIdx++;
      }
      if (pos.itemIdx >= playlistRef.current.length) return finish();
    } else {
      if (pos.itemIdx + 1 < playlistRef.current.length) {
        pos.itemIdx++;
      } else if (pos.rep + 1 < reps) {
        pos.rep++;
        pos.itemIdx = 0;
      } else {
        return finish();
      }
    }
    playCurrent();
  };

  const skipItemOnError = () => {
    setErrorMsg(t("libre.errorItem"));
    advanceItem(true);
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
      audio.play().then(() => setStatus("playing")).catch(() => skipItemOnError());
    } else {
      posRef.current = { itemIdx: 0, rep: 0, ayahIdx: 0 };
      setErrorMsg("");
      playCurrent();
    }
  };

  const goToItem = (delta: 1 | -1) => {
    const pos = posRef.current;
    const next = pos.itemIdx + delta;
    if (next < 0 || next >= playlistRef.current.length) return;
    pos.itemIdx = next;
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

  const jumpToItem = (i: number) => {
    posRef.current.itemIdx = i;
    posRef.current.ayahIdx = 0;
    if (mode === "page") posRef.current.rep = 0;
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      playCurrent();
    } else {
      syncUI();
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    posRef.current = { itemIdx: 0, rep: 0, ayahIdx: 0 };
    setStatus("idle");
    setErrorMsg("");
    syncUI();
  };

  const changeReciter = (r: Reciter) => {
    setReciter(r);
    posRef.current.ayahIdx = 0;
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      playCurrent();
    } else {
      syncUI();
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
      }
    };
  }, []);

  // Para cada página absoluta del item actual, derivar la vuelta/juz a mostrar.
  // Las imágenes se sirven por vuelta; para un segmento "pagina" usamos su
  // vuelta; para rangos, usamos la vuelta 1 como referencia visual.
  const imageInfoFor = (absolutePage: number, item: PlaylistItem) => {
    const juz = juzOfAbsolutePage(absolutePage);
    const vuelta = item.seg.tipo === "pagina" ? item.seg.vuelta : 1;
    return { juz, vuelta, url: pageImageUrl(juz, vuelta), absolutePage };
  };

  const currentItem = playlist[itemIdx];

  if (resolving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm opacity-60">{t("libre.resolving")}</p>
      </div>
    );
  }

  if (resolveError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <p className="text-sm opacity-70">{t("libre.resolveError")}</p>
        <p className="text-xs opacity-40">{resolveError}</p>
        <Link
          href="/repaso-libre/nuevo"
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
        >
          {t("libre.backToSelection")}
        </Link>
      </div>
    );
  }

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <p className="text-sm opacity-60">{t("libre.empty")}</p>
        <Link
          href="/repaso-libre/nuevo"
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold"
        >
          {t("libre.backToSelection")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen premium-gradient">
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-gold)]/30 shadow-sm">
        <Link
          href="/repaso-libre/nuevo"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[var(--color-primary)]" />
            {t("libre.title")}
          </h1>
          <p className="text-[10px] opacity-50 uppercase tracking-wider">
            {t("multi.selectedCount", { n: playlist.length })}
          </p>
        </div>
        <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full shrink-0">
          {t("multi.repOf", { r: rep + 1, n: reps })}
        </span>
      </header>

      {/* Selector de recitador (KRH se sustituye por audio online en repaso libre) */}
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

      {/* Chips de segmentos */}
      <div className="flex-none flex items-center gap-2 px-4 py-2.5 overflow-x-auto border-b border-[var(--color-border)]">
        {playlist.map((item, i) => (
          <button
            key={i}
            onClick={() => jumpToItem(i)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              i === itemIdx
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : i < itemIdx
                ? "border-[var(--color-primary)]/40 text-[var(--color-primary)] opacity-70"
                : "border-[var(--color-border)] opacity-50"
            }`}
          >
            {item.seg.tipo === "pagina"
              ? `J${item.seg.juz}·V${item.seg.vuelta}`
              : `${item.seg.desde}–${item.seg.hasta}`}
          </button>
        ))}
      </div>

      {/* Imagen(es) del item actual */}
      <main className="flex-1 overflow-y-auto">
        {currentItem && (
          <div className="flex flex-col gap-3 mt-3 px-2">
            {currentItem.pages.map((absPage) => {
              const info = imageInfoFor(absPage, currentItem);
              const broken = brokenImages.has(absPage);
              return (
                <div
                  key={absPage}
                  className="w-full mx-auto max-w-lg premium-card rounded-xl overflow-hidden relative"
                >
                  <div className="relative w-full aspect-[2/3] flex items-center justify-center p-2 bg-white/50">
                    {broken ? (
                      <div className="flex flex-col items-center gap-2 text-center opacity-50">
                        <ImageOff className="w-10 h-10" />
                        <p className="text-xs font-medium">
                          {t("libre.imageMissing", {
                            j: String(info.juz),
                            v: String(info.vuelta),
                          })}
                        </p>
                      </div>
                    ) : (
                      <img
                        key={info.url}
                        src={info.url}
                        alt={t("libre.pageAlt", { p: String(absPage) })}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={() =>
                          setBrokenImages((prev) => {
                            const next = new Set(prev);
                            next.add(absPage);
                            return next;
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-40" />
      </main>

      {/* Controles */}
      <section className="flex-none fixed bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {errorMsg && (
          <p className="text-[11px] text-center text-[var(--color-gold)] font-medium mb-2">
            {errorMsg}
          </p>
        )}

        <div className="flex justify-center gap-5 mb-3 text-xs opacity-60 font-medium">
          <span>{t("multi.pageOf", { i: itemIdx + 1, n: playlist.length })}</span>
          {ayahTotal > 0 && status !== "idle" && status !== "finished" && (
            <span>{t("multi.ayahOf", { i: ayahIdx + 1, n: ayahTotal })}</span>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
          <button
            onClick={stop}
            title={t("multi.stop")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-red-400 transition-all active:scale-95"
          >
            <Square className="w-4 h-4 opacity-60" />
          </button>

          <button
            onClick={() => goToItem(-1)}
            disabled={itemIdx === 0}
            title={t("multi.prevPage")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all active:scale-95 disabled:opacity-30"
          >
            <SkipBack className="w-5 h-5" />
          </button>

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

          <button
            onClick={() => goToItem(1)}
            disabled={itemIdx >= playlist.length - 1}
            title={t("multi.nextPage")}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all active:scale-95 disabled:opacity-30"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="w-10" />
        </div>
      </section>

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
                href="/repaso-libre/nuevo"
                className="flex-1 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-background)] active:scale-95 transition-all"
              >
                {t("libre.backToSelection")}
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

export default function RepasoLibrePage() {
  return (
    <Suspense fallback={null}>
      <RepasoLibrePlayer />
    </Suspense>
  );
}
