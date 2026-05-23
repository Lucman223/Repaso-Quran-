"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";

export default function VueltaPage({
  params,
}: {
  params: Promise<{ vueltaId: string }>;
}) {
  const { vueltaId } = use(params);
  const vId = parseInt(vueltaId);

  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);

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
          <h1 className="text-lg font-bold">Vuelta {vueltaId}</h1>
          <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-widest">
            Método Osmanlı · {completedCount}/30 Juzs completados
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            {progress}%
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        <p className="text-sm opacity-60 leading-relaxed mb-5">
          Lista de los 30 Juzs para repasar en la **Vuelta {vueltaId}**. Selecciona cualquiera para ir a su página.
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {juzs.map((item) => (
            <Link
              href={`/vuelta/${vId}/juz/${item.juzNum}`}
              key={item.juzNum}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                item.isCompleted
                  ? "bg-[var(--color-card)] border-[var(--color-primary)]/40 opacity-90"
                  : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                    item.isCompleted
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
                  <p className="text-xs opacity-50">Juz {item.juzNum} · Pág. {item.localPageNumber}</p>
                </div>
              </div>

              {item.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 opacity-30 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
