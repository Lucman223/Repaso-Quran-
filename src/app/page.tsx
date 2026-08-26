"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Settings, Lock, Globe, BarChart2, ListMusic, Sparkles, Star, ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { citaDelDia, traduccion } from "@/lib/contenido";
import { GuidedTour, type TourStep } from "@/components/GuidedTour";
import { getRecommendedPagesToReview } from "@/lib/repetition";
import { juzOfAbsolutePage, JUZ_STARTING_PAGES } from "@/lib/quran";

export default function Home() {
  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);
  const availableVueltas = useRepasaStore((state) => state.availableVueltas);
  const fetchAvailableVueltas = useRepasaStore((state) => state.fetchAvailableVueltas);
  const setLocale = useRepasaStore((state) => state.setLocale);
  const hasSeenHomeTour = useRepasaStore((state) => state.hasSeenHomeTour);
  const markHomeTourSeen = useRepasaStore((state) => state.markHomeTourSeen);
  const resetTours = useRepasaStore((state) => state.resetTours);
  const pageStudyHistory = useRepasaStore((state) => state.pageStudyHistory);
  
  const { t, locale } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Trigger para refrescar la cita motivacional dinámicamente
  const [now, setNow] = useState(new Date());
  // Offset manual para navegar entre las citas
  const [citaOffset, setCitaOffset] = useState(0);

  const [recommendedPages, setRecommendedPages] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    fetchAvailableVueltas();

    // Actualizar `now` cada minuto para que la cita rote en vivo
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [fetchAvailableVueltas]);

  useEffect(() => {
    if (isMounted) {
      setRecommendedPages(getRecommendedPagesToReview(pageStudyHistory));
    }
  }, [isMounted, pageStudyHistory]);

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

  // Cita motivadora que cambia según la hora
  const cita = citaDelDia(now, citaOffset);

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

  // Utilidad para convertir página absoluta a enlace de Vuelta/Juz
  const getPageLink = (absolutePage: number) => {
    const juz = juzOfAbsolutePage(absolutePage);
    const juzStart = JUZ_STARTING_PAGES[juz - 1];
    const pageIdInJuz = absolutePage - juzStart + 1;
    const vuelta = 21 - pageIdInJuz;
    return `/vuelta/${vuelta}/juz/${juz}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[var(--color-background)]/90 backdrop-blur border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] font-amiri tracking-wider">
            {t('home.arabicTitle')}
          </h1>
          <p className="text-[10px] font-semibold opacity-50 uppercase tracking-widest mt-0.5">
            Mi Espacio Personal
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
            href="/repaso-libre/nuevo"
            title={t('libre.newTitle')}
            className="p-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
          >
            <ListMusic className="w-5 h-5 opacity-60" />
          </Link>
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

      <main className="flex-1 p-4 md:p-8 pb-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Recordatorio de repasos (Nuevo Sistema) */}
        {isMounted && recommendedPages.length > 0 && (
          <div className="bg-amber-600/10 border border-amber-600/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400">
              <CalendarClock className="w-5 h-5" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Tu Repaso de Hoy</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedPages.map(page => (
                <Link 
                  key={page} 
                  href={getPageLink(page)}
                  className="px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-lg text-sm font-semibold transition-colors"
                >
                  Pág {page}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cita motivadora del día */}
        {isMounted && (
          <div className="relative group">
            <Link
              href="/motivacion"
              className="block bg-[var(--color-card)] border border-[var(--color-gold)]/30 rounded-2xl p-5 relative overflow-hidden hover:border-[var(--color-gold)]/60 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">
                  {t('motivacion.dailyLabel')}
                </span>
              </div>
              {cita.ar && (
                <p dir="rtl" className="font-amiri text-xl leading-loose text-[var(--color-primary)] mb-2">
                  {cita.ar}
                </p>
              )}
              <p className="text-sm leading-relaxed text-[var(--color-foreground)] font-medium pr-12">
                “{cita.tr}”
              </p>
              {traduccion(cita, locale) && (
                <p className="text-sm leading-relaxed opacity-70 mt-1.5 italic pr-12">
                  {traduccion(cita, locale)}
                </p>
              )}
              <p className="text-xs opacity-50 mt-2">— {cita.kaynak}</p>
              <Star className="absolute -right-3 -bottom-3 w-20 h-20 opacity-[0.04] transition-opacity group-hover:opacity-[0.07]" />
            </Link>
            
            {/* Controles de avance manual superpuestos */}
            <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCitaOffset((prev) => prev - 1);
                }}
                className="p-1.5 rounded-full bg-[var(--color-background)]/80 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors backdrop-blur-sm border border-[var(--color-border)]"
                title="Mensaje anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCitaOffset((prev) => prev + 1);
                }}
                className="p-1.5 rounded-full bg-[var(--color-background)]/80 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors backdrop-blur-sm border border-[var(--color-border)]"
                title="Siguiente mensaje"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
