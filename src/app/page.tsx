"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Settings, Lock, Globe, BarChart2 } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { GuidedTour, type TourStep } from "@/components/GuidedTour";

export default function Home() {
  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);
  const availableVueltas = useRepasaStore((state) => state.availableVueltas);
  const fetchAvailableVueltas = useRepasaStore((state) => state.fetchAvailableVueltas);
  const setLocale = useRepasaStore((state) => state.setLocale);
  const hasSeenHomeTour = useRepasaStore((state) => state.hasSeenHomeTour);
  const markHomeTourSeen = useRepasaStore((state) => state.markHomeTourSeen);
  const resetTours = useRepasaStore((state) => state.resetTours);
  const { t, locale } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAvailableVueltas();
  }, [fetchAvailableVueltas]);

  const steps: TourStep[] = [
    {
      target: "body",
      title: t("onboarding.step1Title"),
      content: t("onboarding.step1Desc"),
    },
    {
      target: "#tour-progress",
      title: t("tour.home.progressTitle"),
      content: t("tour.home.progressDesc"),
    },
    {
      target: "#tour-vueltas",
      title: t("tour.home.vueltasTitle"),
      content: t("tour.home.vueltasDesc"),
    },
    {
      target: "#tour-lang",
      title: t("tour.home.langTitle"),
      content: t("tour.home.langDesc"),
    },
    {
      target: "#tour-stats-btn",
      title: t("tour.home.statsTitle"),
      content: t("tour.home.statsDesc"),
    },
    {
      target: "#tour-guide-btn",
      title: t("tour.home.guideTitle"),
      content: t("tour.home.guideDesc"),
    },
  ];

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
    const isAvailable = availableVueltas.includes(vueltaNum);
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
            {t('home.arabicTitle')}
          </h1>
          <p className="text-[10px] font-semibold opacity-50 uppercase tracking-widest mt-0.5">
            {t('home.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de idioma */}
          <button
            id="tour-lang"
            onClick={() => setLocale(locale === 'es' ? 'tr' : 'es')}
            title={locale === 'es' ? 'Cambiar a Türkçe' : "Español'a geç"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-card)] transition-all"
          >
            <Globe className="w-3.5 h-3.5 opacity-60" />
            {t('lang.toggle')}
          </button>
          <Link
            id="tour-stats-btn"
            href="/stats"
            title="Estadísticas"
            className="p-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
          >
            <BarChart2 className="w-5 h-5 opacity-60" />
          </Link>
          <button
            id="tour-guide-btn"
            onClick={() => {
              resetTours();
              setShowGuide(true);
            }}
            title={t("onboarding.viewGuide")}
            className="p-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
          >
            <Settings className="w-5 h-5 opacity-60" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Progreso total */}
        <div id="tour-progress" className="bg-[var(--color-primary)] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-80 font-medium">{t('home.totalProgress')}</p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-4xl font-bold">{totalProgress}%</span>
              <span className="text-sm opacity-70 mb-1">
                {totalCompleted}/{totalVueltas} {t('home.vueltas')}
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
        <div id="tour-vueltas">
          <h2 className="text-base font-semibold opacity-70 mb-3 uppercase tracking-wider text-xs">
            {t('home.selectVuelta')}
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
                    {t('home.vuelta')} {vuelta.vueltaNum}
                  </span>
                  {!vuelta.isAvailable && <Lock className="w-3.5 h-3.5 opacity-55" />}
                </div>
                <span className="text-[11px] font-medium opacity-60">
                  {vuelta.completedJuzs}/30 {t('home.juzs')}
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

      {isMounted && (
        <GuidedTour
          steps={steps}
          run={!hasSeenHomeTour || showGuide}
          onFinish={() => {
            markHomeTourSeen();
            setShowGuide(false);
          }}
          locale={{
            back: t('onboarding.tourBack'),
            last: t('onboarding.tourLast'),
            next: t('onboarding.tourNext'),
            skip: t('onboarding.tourSkip'),
          }}
        />
      )}
    </div>
  );
}
