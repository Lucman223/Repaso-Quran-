"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Mic,
  Square,
  CheckCircle2,
  Loader2,
  WifiOff,
  RotateCcw,
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

export default function PaginaQuran({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id, pageId } = use(params);

  const pageKey = `juz_${id}_pagina_${pageId}`;
  const vueltaId = 21 - parseInt(pageId);
  const absolutePage = (JUZ_STARTING_PAGES[parseInt(id) - 1] ?? 1) + parseInt(pageId) - 1;

  const {
    pageStats,
    pageCache,
    reciter,
    completedVueltas,
    incrementListen,
    incrementRecord,
    markVueltaCompleted,
    toggleVueltaCompleted,
    setReciter,
    cachePageVerses,
  } = useRepasaStore();

  const currentStats = pageStats[pageKey] ?? { listenCount: 0, recordCount: 0 };
  const isVueltaCompleted = (completedVueltas[id] ?? []).includes(vueltaId);

  // Verses
  const [verses, setVerses] = useState<Verse[]>(pageCache[absolutePage] ?? []);
  const [loading, setLoading] = useState(verses.length === 0);
  const [fetchError, setFetchError] = useState(false);

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Fetch verses on mount
  useEffect(() => {
    if (verses.length > 0) {
      setLoading(false);
      return;
    }
    fetchPageVerses(absolutePage)
      .then((data) => {
        setVerses(data);
        cachePageVerses(absolutePage, data);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [absolutePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as Window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "ar-SA";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      setTranscript(t);
    };
    rec.onerror = () => setIsRecording(false);
    recognitionRef.current = rec;
    return () => rec.abort();
  }, []);

  // Audio helpers
  const playVerse = (verseKey: string) => {
    const url = getAyahAudioUrl(verseKey, reciter);
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (repeatMode) {
          audioRef.current?.play();
          setIsPlaying(true);
        }
      };
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onwaiting = () => setAudioLoading(true);
      audioRef.current.oncanplay = () => setAudioLoading(false);
    }

    if (playingKey === verseKey && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current.src = url;
    setPlayingKey(verseKey);
    setAudioLoading(true);
    audioRef.current.play().catch(() => setAudioLoading(false));
    incrementListen(pageKey);
  };

  const toggleRecord = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      incrementRecord(pageKey);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const changeReciter = (r: Reciter) => {
    setReciter(r);
    // Stop current audio when changing reciter
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setPlayingKey(null);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-background)] overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center gap-3 px-4 py-3 bg-[var(--color-background)]/95 backdrop-blur border-b border-[var(--color-border)]">
        <Link
          href={`/juz/${id}`}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">
            Juz {id} · Página {pageId}
          </h1>
          <p className="text-[10px] opacity-50 uppercase tracking-wider">
            Vuelta {vueltaId}
          </p>
        </div>
        {isVueltaCompleted && (
          <span className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-medium bg-[var(--color-primary)]/10 px-2 py-1 rounded-full shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Hecha
          </span>
        )}
      </header>

      {/* Reciter selector */}
      <div className="flex-none flex justify-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        {(Object.keys(RECITERS) as Reciter[]).map((r) => (
          <button
            key={r}
            onClick={() => changeReciter(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              reciter === r
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-background)] opacity-60 hover:opacity-100"
            }`}
          >
            {RECITERS[r].nameEs}
          </button>
        ))}
        <button
          onClick={() => setRepeatMode((v) => !v)}
          title="Repetir aleya"
          className={`ml-auto p-1.5 rounded-full transition-all ${
            repeatMode
              ? "bg-[var(--color-primary)] text-white"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Verse list — scrollable */}
      <main className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-60">
            <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
            <p className="text-sm">Cargando aleyas...</p>
          </div>
        )}

        {fetchError && !loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 p-6 text-center">
            <WifiOff className="w-8 h-8 opacity-40" />
            <p className="text-sm opacity-60">
              No se pudo conectar al servidor. Comprueba tu conexión e intenta de nuevo.
            </p>
          </div>
        )}

        {!loading && !fetchError && verses.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm opacity-50">No hay aleyas en esta página.</p>
          </div>
        )}

        <div className="divide-y divide-[var(--color-border)]">
          {verses.map((verse) => {
            const isThisPlaying = playingKey === verse.verse_key && isPlaying;
            const isThisLoading = playingKey === verse.verse_key && audioLoading;
            return (
              <div
                key={verse.id}
                className={`px-4 py-4 transition-colors ${
                  playingKey === verse.verse_key
                    ? "bg-[var(--color-primary)]/6"
                    : ""
                }`}
              >
                {/* Arabic text */}
                <p
                  dir="rtl"
                  className="font-amiri text-2xl leading-loose text-right text-[var(--color-foreground)]"
                >
                  {verse.text_uthmani}
                  <span className="text-[var(--color-primary)] text-lg mr-1">
                    ﴿{verse.verse_number}﴾
                  </span>
                </p>

                {/* Play button */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => playVerse(verse.verse_key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      isThisPlaying
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {isThisLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isThisPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                    {isThisPlaying ? "Pausar" : "Escuchar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacer so content isn't hidden behind the fixed bar */}
        <div className="h-44" />
      </main>

      {/* Fixed bottom controls */}
      <section className="flex-none fixed bottom-0 left-0 right-0 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {/* Transcript */}
        {(transcript || isRecording) && (
          <div
            dir="rtl"
            className="mb-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] font-amiri text-lg leading-loose text-right min-h-12"
          >
            {transcript || (
              <span className="opacity-30 text-base not-italic">
                Recitando...
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-3 text-xs opacity-50">
          <span>🎧 {currentStats.listenCount} escuchas</span>
          <span>🎤 {currentStats.recordCount} recitaciones</span>
        </div>

        <div className="flex items-center gap-3 max-w-sm mx-auto">
          {/* Mic button */}
          <button
            onClick={toggleRecord}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all active:scale-95 shadow ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            }`}
          >
            {isRecording ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Mic className="w-5 h-5 text-[var(--color-primary)]" />
            )}
          </button>

          {/* Mark completed button */}
          <button
            onClick={() => toggleVueltaCompleted(id, vueltaId)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              isVueltaCompleted
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                : "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/30"
            }`}
          >
            {isVueltaCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Completada · Desmarcar
              </>
            ) : (
              "Marcar vuelta completada"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
