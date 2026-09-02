"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Settings, Lock, Globe, BarChart2, ListMusic, Sparkles, Star, ChevronLeft, ChevronRight, CalendarClock, BookMarked, Flame, Plus, Minus, Check } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { citaDelDia, traduccion } from "@/lib/contenido";
import { GuidedTour, type TourStep } from "@/components/GuidedTour";
import { getRecommendedPagesToReview, getNextMemorizationTarget, getMemorizationStreak, getLecturaStreak } from "@/lib/repetition";
import { TOTAL_MUSHAF_PAGES, vueltaJuzOfAbsolutePage } from "@/lib/quran";
import { getTodayDateString } from "@/lib/dateUtils";

export default function Home() {
  const completedVueltasMap = useRepasaStore((state) => state.completedVueltas);
  const availableVueltas = useRepasaStore((state) => state.availableVueltas);
  const fetchAvailableVueltas = useRepasaStore((state) => state.fetchAvailableVueltas);
  const setLocale = useRepasaStore((state) => state.setLocale);
  const hasSeenHomeTour = useRepasaStore((state) => state.hasSeenHomeTour);
  const markHomeTourSeen = useRepasaStore((state) => state.markHomeTourSeen);
  const resetTours = useRepasaStore((state) => state.resetTours);
  const pageStudyHistory = useRepasaStore((state) => state.pageStudyHistory);
  const lecturaCurrentPage = useRepasaStore((state) => state.lecturaCurrentPage);
  const lecturaDailyGoal = useRepasaStore((state) => state.lecturaDailyGoal);
  const lecturaHistory = useRepasaStore((state) => state.lecturaHistory);
  const adjustLecturaPage = useRepasaStore((state) => state.adjustLecturaPage);
  const setLecturaDailyGoal = useRepasaStore((state) => state.setLecturaDailyGoal);
  
  const { t, locale } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Trigger para refrescar la cita motivacional dinámicamente
  const [now, setNow] = useState(new Date());
  // Offset manual para navegar entre las citas
  const [citaOffset, setCitaOffset] = useState(0);
  const [selectedVuelta, setSelectedVuelta] = useState(1);

  const [recommendedPages, setRecommendedPages] = useState<number[]>([]);
  const [pagesStudiedToday, setPagesStudiedToday] = useState<number[]>([]);

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
      const today = getTodayDateString(new Date());
      setPagesStudiedToday(Object.keys(pageStudyHistory).map(Number).filter(p => pageStudyHistory[p].includes(today)));
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

  const selectedVueltaData = vueltas.find((v) => v.vueltaNum === selectedVuelta);

  // Utilidad para convertir página absoluta a enlace de Vuelta/Juz
  const getPageLink = (absolutePage: number) => {
    const { vuelta, juz } = vueltaJuzOfAbsolutePage(absolutePage);
    return `/vuelta/${vuelta}/juz/${juz}`;
  };

  // ---- Seguimiento diario ----
  const todayStr = getTodayDateString(now);
  const lecturaToday = lecturaHistory[todayStr] || 0;
  const lecturaGoalMet = lecturaToday >= lecturaDailyGoal;
  const lecturaStreak = isMounted ? getLecturaStreak(lecturaHistory) : 0;
  const memoStreak = isMounted ? getMemorizationStreak(pageStudyHistory) : 0;
  const memoTarget = isMounted ? getNextMemorizationTarget(completedVueltasMap, pageStudyHistory) : null;

  const visibleReviewPages = Array.from(new Set([...recommendedPages, ...pagesStudiedToday]))
    .filter(p => p !== memoTarget?.inProgressPage?.absolutePage && (!memoTarget?.readyToStart || p !== memoTarget?.absolutePage))
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[var(--color-background)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] font-amiri tracking-wider">
            {t('home.arabicTitle')}
          </h1>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
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
            href="/suplicas"
            title="Súplicas (Duas)"
            className="p-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
          >
            <BookOpen className="w-5 h-5 opacity-60" />
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
        
        {/* 1. Cita motivadora del día */}
        {isMounted && (
          <div className="relative group">
            <Link
              href="/motivacion"
              className="block bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
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

        {/* 2. Memorización diaria (Método Otomano) */}
        {isMounted && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-emerald-700">
              <CalendarClock className="w-5 h-5" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Memorización diaria</h2>
            </div>
            <p className="text-[11px] opacity-50 mb-4">Método Otomano · ritmo 1 página / 2 días</p>

            {visibleReviewPages.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 mb-2">Repaso e historial de hoy</p>
                <div className="flex flex-wrap gap-2">
                  {visibleReviewPages.map(page => {
                    const { juz, vuelta } = vueltaJuzOfAbsolutePage(page);
                    const localPage = (juz - 1) * 20 + (21 - vuelta);
                    const isDoneToday = pagesStudiedToday.includes(page);
                    return (
                      <Link
                        key={page}
                        href={getPageLink(page)}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          isDoneToday
                            ? 'bg-emerald-100/50 border-emerald-200 text-emerald-700 opacity-80 hover:opacity-100 hover:border-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-500 text-emerald-800'
                        }`}
                      >
                        Pág {localPage}
                        {isDoneToday && <Check className="w-3 h-3" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {memoTarget ? (
              <div className={`rounded-xl px-3 py-2.5 border mb-3 ${memoTarget.readyToStart ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-60 mb-1">
                  {memoTarget.readyToStart ? 'Página nueva de hoy' : 'Consolidando página actual'}
                </p>
                {memoTarget.readyToStart ? (
                  <Link href={`/vuelta/${memoTarget.vuelta}/juz/${memoTarget.juz}`} className="text-sm font-bold text-emerald-800 hover:underline">
                    Juz {memoTarget.juz} · Pág {(memoTarget.juz - 1) * 20 + (21 - memoTarget.vuelta)} →
                  </Link>
                ) : (
                  <Link href={`/vuelta/${memoTarget.inProgressPage?.vuelta}/juz/${memoTarget.inProgressPage?.juz}`} className="text-sm font-medium text-slate-700 hover:text-emerald-700 hover:underline flex items-center gap-1">
                    Pág {memoTarget.inProgressPage ? (memoTarget.inProgressPage.juz - 1) * 20 + (21 - memoTarget.inProgressPage.vuelta) : "?"} — dale un día más antes de avanzar →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm opacity-60 mb-3">¡Has memorizado todas las vueltas disponibles! 🎉</p>
            )}

            {memoStreak > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-auto">
                <Flame className="w-3.5 h-3.5" /> {memoStreak} días seguidos
              </span>
            )}
          </div>
        )}

        {/* 3. Lectura diaria (Jatma completa) */}
        {isMounted && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sky-700">
                <BookMarked className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Lectura diaria</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={TOTAL_MUSHAF_PAGES}
                  value={lecturaDailyGoal}
                  onChange={(e) => setLecturaDailyGoal(Number(e.target.value) || 1)}
                  className="w-11 text-xs font-semibold text-center border border-slate-200 rounded-md py-0.5 focus:outline-none focus:border-sky-400"
                />
                <span className="text-[10px] opacity-50">pág/día</span>
              </div>
            </div>
            <p className="text-[11px] opacity-50 mb-4">Jatma completa · de principio a fin</p>

            <div className="mb-3">
              <div className="flex items-end justify-between mb-1">
                <span className="text-2xl font-bold text-slate-800">Pág {lecturaCurrentPage}</span>
                <span className="text-xs opacity-50">de {TOTAL_MUSHAF_PAGES}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.round((lecturaCurrentPage / TOTAL_MUSHAF_PAGES) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 mb-4">
              <span className="flex items-center gap-1 text-xs font-semibold text-sky-800">
                Hoy: {lecturaToday}/{lecturaDailyGoal}
                {lecturaGoalMet && <Check className="w-3.5 h-3.5" />}
              </span>
              {lecturaStreak > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
                  <Flame className="w-3.5 h-3.5" /> {lecturaStreak}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => adjustLecturaPage(-1)}
                className="p-2 rounded-lg border border-slate-200 hover:border-sky-400 transition-colors"
                title="Restar 1 página"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => adjustLecturaPage(lecturaDailyGoal)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-sky-600 text-white hover:bg-sky-700 transition-colors active:scale-[0.98]"
              >
                Marcar {lecturaDailyGoal} leídas hoy
              </button>
              <button
                onClick={() => adjustLecturaPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:border-sky-400 transition-colors"
                title="Sumar 1 página"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {lecturaCurrentPage < TOTAL_MUSHAF_PAGES && (
              <Link
                href={getPageLink(lecturaCurrentPage + 1)}
                className="text-center text-xs font-semibold text-sky-700 hover:underline mt-3"
              >
                Ir a la página {lecturaCurrentPage + 1} →
              </Link>
            )}
          </div>
        )}



        {/* Progreso total */}
        <div id="tour-progress" className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-emerald-50 font-medium">{t('home.totalProgress')}</p>
            <div className="flex items-end gap-3 mt-1 mb-4">
              <span className="text-4xl font-bold">{totalProgress}%</span>
              <span className="text-sm text-emerald-100 mb-1">
                {totalCompleted}/{totalVueltas} {t('home.vueltas')}
              </span>
            </div>
            <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
          <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
        </div>

        {/* Selector de Vueltas (desplegable) */}
        <div id="tour-vueltas">
          <h2 className="text-base font-semibold opacity-70 mb-3 uppercase tracking-wider text-xs">
            {t('home.selectVuelta')}
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label htmlFor="vuelta-select" className="block text-[10px] uppercase font-semibold opacity-50 mb-1.5">
                  {t('home.vuelta')}
                </label>
                <select
                  id="vuelta-select"
                  value={selectedVuelta}
                  onChange={(e) => setSelectedVuelta(Number(e.target.value))}
                  className="w-full bg-[var(--color-background)] border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-400"
                >
                  {vueltas.map((vuelta) => (
                    <option key={vuelta.vueltaNum} value={vuelta.vueltaNum}>
                      {t('home.vuelta')} {vuelta.vueltaNum} · {vuelta.completedJuzs}/30 {t('home.juzs')} ({vuelta.progress}%){!vuelta.isAvailable ? ' 🔒' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={selectedVueltaData?.isAvailable ? `/vuelta/${selectedVuelta}` : "#"}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-center transition-all whitespace-nowrap ${
                  selectedVueltaData?.isAvailable
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-default"
                }`}
              >
                Abrir →
              </Link>
            </div>
            {selectedVueltaData && (
              <div className="mt-4">
                <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-primary)] h-full rounded-full transition-all"
                    style={{ width: `${selectedVueltaData.progress}%` }}
                  />
                </div>
                {!selectedVueltaData.isAvailable && (
                  <p className="text-[11px] opacity-50 mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Todavía no tienes el contenido de esta vuelta subido.
                  </p>
                )}
              </div>
            )}
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
