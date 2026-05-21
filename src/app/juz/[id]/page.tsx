"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";

export default function JuzPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);
  const completedVueltas = completedVueltasMap[id] || [];

  const vueltas = Array.from({ length: 20 }, (_, i) => {
    const vueltaNum = i + 1;
    const pageId = 21 - vueltaNum;
    const isCompleted = completedVueltas.includes(vueltaNum);
    // Each vuelta is unlocked: either it's already done, or it's the next one
    const isNext = vueltaNum === completedVueltas.length + 1;
    const isLocked = vueltaNum > completedVueltas.length + 1 && !isCompleted;
    return { vueltaNum, pageId, isCompleted, isNext, isLocked };
  });

  const progress = Math.round((completedVueltas.length / 20) * 100);

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
          <h1 className="text-lg font-bold">Juz {id}</h1>
          <p className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-widest">
            Método Osmanlı · {completedVueltas.length}/20 vueltas
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
          Empieza por la última página del Juz (vuelta 1) y avanza hacia la primera (vuelta 20).
        </p>

        <div className="space-y-2">
          {vueltas.map((item) => (
            <Link
              href={item.isLocked ? "#" : `/juz/${id}/pagina/${item.pageId}`}
              key={item.vueltaNum}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                item.isCompleted
                  ? "bg-[var(--color-card)] border-[var(--color-primary)]/40 opacity-90"
                  : item.isNext
                  ? "bg-[var(--color-primary)]/8 border-[var(--color-primary)] shadow-sm"
                  : item.isLocked
                  ? "bg-[var(--color-card)] border-[var(--color-border)] opacity-40 cursor-default"
                  : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                    item.isCompleted
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                      : item.isNext
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-border)]/60 opacity-60"
                  }`}
                >
                  {item.vueltaNum}
                </div>
                <div>
                  <p className="font-medium text-sm">Vuelta {item.vueltaNum}</p>
                  <p className="text-xs opacity-50">Página {item.pageId}</p>
                </div>
              </div>

              {item.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
              ) : item.isLocked ? (
                <Lock className="w-4 h-4 opacity-30" />
              ) : (
                <Circle className="w-5 h-5 opacity-30" />
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
