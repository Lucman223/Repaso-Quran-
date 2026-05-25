"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Music, BarChart2 } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { RECITERS, Reciter } from "@/lib/quran";

export default function StatsPage() {
  const listenStats = useRepasaStore((state) => state.listenStats) || {};
  const { t } = useTranslation();

  const entries = Object.entries(listenStats);

  const pages = entries.filter(([_, data]) => data.type === 'page');
  const ayahs = entries.filter(([_, data]) => data.type === 'ayah');

  const getTotalCount = (counts: Record<string, number>) => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  };

  const renderSection = (title: string, data: typeof pages, icon: React.ReactNode) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-[var(--color-primary)]">
          {icon} {title}
        </h2>
        <div className="grid gap-3">
          {data.map(([targetId, stat]) => {
            const total = getTotalCount(stat.counts);
            return (
              <div key={targetId} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b border-[var(--color-border)] pb-2">
                  <span className="font-bold text-base">{targetId}</span>
                  <span className="text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full">
                    {total} {t('stats.total')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(stat.counts).map(([reciter, count]) => (
                    <div key={reciter} className="flex flex-col items-center bg-[var(--color-background)] rounded-lg p-2 border border-[var(--color-border)]">
                      <span className="text-[10px] uppercase font-bold opacity-50 mb-1">{RECITERS[reciter as Reciter]?.nameEs || reciter}</span>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen premium-gradient">
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-gold)]/30 shadow-sm">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
          title={t('stats.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[var(--color-primary)]" />
          {t('stats.title')}
        </h1>
      </header>

      <main className="flex-1 p-4 pb-12 max-w-2xl mx-auto w-full">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <BarChart2 className="w-12 h-12 opacity-20 mb-4" />
            <p className="text-sm opacity-60 leading-relaxed max-w-sm">{t('stats.empty')}</p>
          </div>
        ) : (
          <>
            {renderSection(t('stats.byPage'), pages, <BookOpen className="w-5 h-5" />)}
            {renderSection(t('stats.byAyah'), ayahs, <Music className="w-5 h-5" />)}
          </>
        )}
      </main>
    </div>
  );
}
