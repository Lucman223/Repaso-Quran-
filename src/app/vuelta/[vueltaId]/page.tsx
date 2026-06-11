"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, ListChecks, X, CheckSquare, Square } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function VueltaPage({
  params,
}: {
  params: Promise<{ vueltaId: string }>;
}) {
  const { vueltaId } = use(params);
  const vId = parseInt(vueltaId);
  const router = useRouter();

  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);
  const fetchAvailableVueltas = useRepasaStore((state) => state.fetchAvailableVueltas);
  const { t } = useTranslation();

  // Modo de selección para el repaso múltiple
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [reps, setReps] = useState(3);
  const [repeatMode, setRepeatMode] = useState<"seq" | "page">("seq");

  useEffect(() => {
    fetchAvailableVueltas();
  }, [fetchAvailableVueltas]);

  // Generar los 30 Juzs
  const juzs = Array.from({ length: 30 }, (_, i) => {
    const juzNum = i + 1;
    const isCompleted = (completedVueltasMap[String(juzNum)] || []).includes(vId);

    // pageId correspondiente para esta vuelta: pageId = 21 - vueltaId
    const pageId = 21 - vId;
    const localPageNumber = (juzNum - 1) * 20 + pageId;

    return {
      juzNum,
      arabicTitle: `الجزء ${juzNum}`,
      isCompleted,
      localPageNumber,
    };
  });

  const completedCount = juzs.filter((j) => j.isCompleted).length;
  const progress = Math.round((completedCount / 30) * 100);

  const toggleSelected = (juzNum: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(juzNum)) next.delete(juzNum);
      else next.add(juzNum);
      return next;
    });
  };

  const startMultiReview = () => {
    if (selected.size === 0) return;
    const juzParam = Array.from(selected).sort((a, b) => a - b).join(",");
    router.push(`/vuelta/${vId}/repaso?juzs=${juzParam}&reps=${reps}&mode=${repeatMode}`);
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
          <h1 className="text-lg font-bold">{t('home.vuelta')} {vueltaId}</h1>
          <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-widest">
            {t('vuelta.method', { completed: completedCount })}
          </p>
        </div>
        {/* Botón de repaso múltiple */}
        <button
          onClick={() => {
            setSelectMode((v) => !v);
            setSelected(new Set());
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            selectMode
              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
          }`}
        >
          {selectMode ? <X className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
          {selectMode ? t('multi.cancel') : t('multi.selectPages')}
        </button>
        {!selectMode && (
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--color-primary)]">
              {progress}%
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        {selectMode ? (
          <div className="flex items-center justify-between mb-5 gap-3">
            <p className="text-sm opacity-60 leading-relaxed">{t('multi.hint')}</p>
            <button
              onClick={() =>
                setSelected(
                  selected.size === 30
                    ? new Set()
                    : new Set(juzs.map((j) => j.juzNum))
                )
              }
              className="shrink-0 text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              {selected.size === 30 ? t('multi.selectNone') : t('multi.selectAll')}
            </button>
          </div>
        ) : (
          <p className="text-sm opacity-60 leading-relaxed mb-5">
            {t('vuelta.description', { n: String(vId) })}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {juzs.map((item) => {
            const isSelected = selected.has(item.juzNum);
            const cardContent = (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                      (selectMode ? isSelected : item.isCompleted)
                        ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                        : "bg-[var(--color-border)]/60 opacity-60"
                    }`}
                  >
                    {item.juzNum}
                  </div>
                  <div>
                    <p className="font-amiri text-lg text-[var(--color-primary)] leading-none mb-0.5">
                      {item.arabicTitle}
                    </p>
                    <p className="text-xs opacity-50">{t('vuelta.juz')} {item.juzNum} · {t('vuelta.page')} {item.localPageNumber}</p>
                  </div>
                </div>

                {selectMode ? (
                  isSelected ? (
                    <CheckSquare className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 opacity-30 shrink-0" />
                  )
                ) : item.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 opacity-30 shrink-0" />
                )}
              </>
            );

            const cardClass = `flex items-center justify-between p-4 rounded-xl border transition-all ${
              selectMode && isSelected
                ? "bg-[var(--color-primary)]/8 border-[var(--color-primary)]"
                : item.isCompleted
                ? "bg-[var(--color-card)] border-[var(--color-primary)]/40 opacity-90"
                : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/60"
            }`;

            return selectMode ? (
              <button
                key={item.juzNum}
                onClick={() => toggleSelected(item.juzNum)}
                className={`${cardClass} text-left cursor-pointer active:scale-[0.99]`}
              >
                {cardContent}
              </button>
            ) : (
              <Link
                href={`/vuelta/${vId}/juz/${item.juzNum}`}
                key={item.juzNum}
                className={cardClass}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>

        {/* Espacio para que la barra inferior no tape las últimas tarjetas */}
        {selectMode && <div className="h-48" />}
      </main>

      {/* Barra inferior de configuración del repaso múltiple */}
      {selectMode && (
        <section className="fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-background)] border-t border-[var(--color-border)] px-4 pt-3 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold opacity-70">
                {t('multi.selectedCount', { n: selected.size })}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-[10px] opacity-60 uppercase font-medium">
                  {t('multi.times')}
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

            {/* Modo de repetición */}
            <div className="flex gap-2">
              {([
                { key: "seq", label: t('multi.modeSeq'), desc: t('multi.modeSeqDesc') },
                { key: "page", label: t('multi.modePage'), desc: t('multi.modePageDesc') },
              ] as const).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setRepeatMode(m.key)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    repeatMode === m.key
                      ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] opacity-60 hover:opacity-100"
                  }`}
                >
                  {m.label}
                  <span className="block text-[10px] font-normal opacity-60 mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>

            <button
              onClick={startMultiReview}
              disabled={selected.size === 0}
              className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-md shadow-[var(--color-primary)]/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('multi.start')}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
