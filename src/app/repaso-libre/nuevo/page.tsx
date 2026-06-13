"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, FileText, ListMusic, Play } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { AVAILABLE_VUELTAS, localPageNumber, absolutePageOf } from "@/lib/quran";
import { labelSegmento, type Segmento } from "@/lib/segmentos";
import { REPASO_LIBRE_KEY, type RepasoLibreConfig } from "@/lib/repasoLibre";

// Valida una clave de aleya "sura:aleya" (rango razonable, sin verificar
// existencia exacta — eso lo hace el resolvedor al reproducir).
function isValidVerseKey(k: string): boolean {
  const m = k.trim().match(/^(\d{1,3}):(\d{1,3})$/);
  if (!m) return false;
  const sura = Number(m[1]);
  const ayah = Number(m[2]);
  return sura >= 1 && sura <= 114 && ayah >= 1;
}

export default function NuevoRepasoLibrePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [reps, setReps] = useState(3);
  const [mode, setMode] = useState<"seq" | "page">("seq");

  // Formulario "añadir página"
  const [juz, setJuz] = useState(1);
  const [vuelta, setVuelta] = useState(AVAILABLE_VUELTAS[0] ?? 1);

  // Formulario "añadir rango de aleyas"
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rangoError, setRangoError] = useState("");

  const addPagina = () => {
    setSegmentos((prev) => [...prev, { tipo: "pagina", juz, vuelta }]);
  };

  const addRango = () => {
    if (!isValidVerseKey(desde) || !isValidVerseKey(hasta)) {
      setRangoError(t("libre.rangeInvalid"));
      return;
    }
    setRangoError("");
    setSegmentos((prev) => [
      ...prev,
      { tipo: "rango", desde: desde.trim(), hasta: hasta.trim() },
    ]);
    setDesde("");
    setHasta("");
  };

  const removeSeg = (i: number) => {
    setSegmentos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const start = () => {
    if (segmentos.length === 0) return;
    const config: RepasoLibreConfig = { segmentos, reps, mode };
    sessionStorage.setItem(REPASO_LIBRE_KEY, JSON.stringify(config));
    router.push("/repaso-libre");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-[var(--color-background)]/90 backdrop-blur border-b border-[var(--color-border)]">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-[var(--color-primary)]" />
            {t("libre.newTitle")}
          </h1>
          <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-widest">
            {t("libre.newSubtitle")}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 pb-48 max-w-xl mx-auto w-full space-y-6">
        {/* Añadir página */}
        <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
            {t("libre.addPageTitle")}
          </h2>
          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="block text-[10px] uppercase font-semibold opacity-60 mb-1">
                {t("vuelta.juz")}
              </span>
              <select
                value={juz}
                onChange={(e) => setJuz(Number(e.target.value))}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {t("vuelta.juz")} {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1">
              <span className="block text-[10px] uppercase font-semibold opacity-60 mb-1">
                {t("home.vuelta")}
              </span>
              <select
                value={vuelta}
                onChange={(e) => setVuelta(Number(e.target.value))}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]"
              >
                {AVAILABLE_VUELTAS.map((v) => (
                  <option key={v} value={v}>
                    {t("home.vuelta")} {v}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={addPagina}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("libre.add")}
            </button>
          </div>
          {/* Previsualización: qué página del Mushaf es la combinación juz+vuelta */}
          <p className="text-[11px] opacity-60 mt-2">
            {t("libre.pagePreview", {
              local: String(localPageNumber(juz, vuelta)),
              abs: String(absolutePageOf(juz, vuelta)),
            })}
          </p>
        </section>

        {/* Añadir rango de aleyas */}
        <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-[var(--color-primary)]" />
            {t("libre.addRangeTitle")}
          </h2>
          <p className="text-[11px] opacity-50 mb-3">{t("libre.addRangeHint")}</p>
          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="block text-[10px] uppercase font-semibold opacity-60 mb-1">
                {t("libre.from")}
              </span>
              <input
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                placeholder="2:6"
                inputMode="numeric"
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <label className="flex-1">
              <span className="block text-[10px] uppercase font-semibold opacity-60 mb-1">
                {t("libre.to")}
              </span>
              <input
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                placeholder="2:16"
                inputMode="numeric"
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-[var(--color-primary)]"
              />
            </label>
            <button
              onClick={addRango}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("libre.add")}
            </button>
          </div>
          {rangoError && (
            <p className="text-[11px] text-red-500 mt-2">{rangoError}</p>
          )}
        </section>

        {/* Lista de segmentos añadidos */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
            {t("libre.listTitle", { n: segmentos.length })}
          </h2>
          {segmentos.length === 0 ? (
            <p className="text-sm opacity-50 text-center py-8">
              {t("libre.listEmpty")}
            </p>
          ) : (
            <div className="space-y-2">
              {segmentos.map((seg, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        {seg.tipo === "pagina"
                          ? `${t("vuelta.juz")} ${seg.juz} · ${t("home.vuelta")} ${seg.vuelta}`
                          : `${seg.desde} – ${seg.hasta}`}
                      </p>
                      <p className="text-[10px] opacity-50 uppercase">
                        {seg.tipo === "pagina"
                          ? `${t("libre.typePage")} · ${t("vuelta.page")} ${localPageNumber(seg.juz, seg.vuelta)}`
                          : `${t("libre.typeRange")} · ${labelSegmento(seg)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSeg(i)}
                    className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                    title={t("libre.remove")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Barra inferior: config + lanzar */}
      <section className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold opacity-70">
              {t("multi.selectedCount", { n: segmentos.length })}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] opacity-60 uppercase font-medium">
                {t("multi.times")}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={reps}
                onChange={(e) =>
                  setReps(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                }
                className="w-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {([
              { key: "seq", label: t("multi.modeSeq"), desc: t("multi.modeSeqDesc") },
              { key: "page", label: t("multi.modePage"), desc: t("multi.modePageDesc") },
            ] as const).map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  mode === m.key
                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] opacity-60 hover:opacity-100"
                }`}
              >
                {m.label}
                <span className="block text-[10px] font-normal opacity-60 mt-0.5">
                  {m.desc}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={start}
            disabled={segmentos.length === 0}
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-md shadow-[var(--color-primary)]/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            {t("libre.start")}
          </button>
        </div>
      </section>
    </div>
  );
}
