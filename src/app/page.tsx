"use client";

import Link from "next/link";
import { BookOpen, Settings, Lock } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { AVAILABLE_VUELTAS } from "@/lib/quran";

export default function Home() {
  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);

  const totalCompleted = Object.values(completedVueltasMap).reduce(
    (sum, vueltas) => sum + vueltas.length,
    0
  );
  const totalVueltas = 30 * 20;
  const totalProgress = Math.round((totalCompleted / totalVueltas) * 100);

  const vueltas = Array.from({ length: 20 }, (_, i) => {
    const vueltaNum = i + 1;
    const completedJuzs = Object.keys(completedVueltasMap).filter(
      (juzId) => (completedVueltasMap[juzId] || []).includes(vueltaNum)
    ).length;
    const isAvailable = AVAILABLE_VUELTAS.includes(vueltaNum);
    const progress = Math.round((completedJuzs / 30) * 100);
    return {
      vueltaNum,
      completedJuzs,
      isAvailable,
      progress,
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[var(--color-background)]/90 backdrop-blur border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] font-amiri tracking-wider">
            رَاجِع
          </h1>
          <p className="text-[10px] font-semibold opacity-50 uppercase tracking-widest mt-0.5">
            Repasa
          </p>
        </div>
        <button className="p-2 rounded-full hover:bg-[var(--color-card)] transition-colors">
          <Settings className="w-5 h-5 opacity-60" />
        </button>
      </header>

      <main className="flex-1 p-4 pb-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Progreso total */}
        <div className="bg-[var(--color-primary)] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-80 font-medium">Progreso total</p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-4xl font-bold">{totalProgress}%</span>
              <span className="text-sm opacity-70 mb-1">
                {totalCompleted}/{totalVueltas} vueltas
              </span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
          <BookOpen className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10" />
        </div>

        {/* Grid de Vueltas */}
        <div>
          <h2 className="text-base font-semibold opacity-70 mb-3 uppercase tracking-wider text-xs">
            Selecciona una Vuelta
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {vueltas.map((vuelta) => (
              <Link
                href={vuelta.isAvailable ? `/vuelta/${vuelta.vueltaNum}` : "#"}
                key={vuelta.vueltaNum}
                className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center gap-2 transition-all group ${
                  vuelta.isAvailable
                    ? "hover:border-[var(--color-primary)] active:scale-95"
                    : "opacity-40 cursor-default"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-primary)] group-hover:scale-105 transition-transform">
                    Vuelta {vuelta.vueltaNum}
                  </span>
                  {!vuelta.isAvailable && <Lock className="w-3.5 h-3.5 opacity-55" />}
                </div>
                <span className="text-[11px] font-medium opacity-60">
                  {vuelta.completedJuzs}/30 Juzs
                </span>
                <div className="w-full bg-[var(--color-border)] h-1 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-[var(--color-primary)] h-full rounded-full transition-all"
                    style={{ width: `${vuelta.progress}%` }}
                  />
                </div>
                <span className="text-[10px] opacity-50">
                  {vuelta.progress}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
