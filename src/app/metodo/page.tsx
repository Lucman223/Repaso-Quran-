"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Lightbulb, BookMarked } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { METODO_PASOS, TERMINOS, CONSEJOS, traduccion } from "@/lib/contenido";

export default function MetodoPage() {
  const { t, locale } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen premium-gradient">
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-gold)]/30 shadow-sm">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[var(--color-primary)]" />
          {t("metodo.title")}
        </h1>
      </header>

      <main className="flex-1 p-4 pb-12 max-w-2xl mx-auto w-full space-y-8">
        <p className="text-sm opacity-60 leading-relaxed">{t("metodo.intro")}</p>

        {/* Pasos del método otomano */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
            {t("metodo.stepsTitle")}
          </h2>
          <div className="space-y-3">
            {METODO_PASOS.map((paso, i) => (
              <div
                key={paso.id}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-sm">
                    {paso.tituloTr}
                    {traduccion({ es: paso.tituloEs }, locale) && (
                      <span className="font-normal opacity-60">
                        {" · "}{traduccion({ es: paso.tituloEs }, locale)}
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm opacity-75 leading-relaxed pl-10">{paso.tr}</p>
                {traduccion(paso, locale) && (
                  <p className="text-sm opacity-60 leading-relaxed pl-10 mt-1 italic">
                    {traduccion(paso, locale)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Términos del método */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-[var(--color-primary)]">
            <BookMarked className="w-5 h-5" />
            {t("metodo.termsTitle")}
          </h2>
          <div className="grid gap-2">
            {TERMINOS.map((term) => (
              <div
                key={term.id}
                className="flex items-start gap-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-3"
              >
                <span className="font-bold text-sm text-[var(--color-primary)] shrink-0 min-w-[90px]">
                  {term.terminoTr}
                </span>
                <span className="text-sm opacity-75">
                  {term.tr}
                  {traduccion(term, locale) && (
                    <span className="block opacity-70 italic mt-0.5">
                      {traduccion(term, locale)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Consejos prácticos */}
        <section id="consejos" className="scroll-mt-20">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-[var(--color-gold)]">
            <Lightbulb className="w-5 h-5" />
            {t("metodo.tipsTitle")}
          </h2>
          <div className="space-y-3">
            {CONSEJOS.map((consejo, i) => (
              <div
                key={consejo.id}
                className="flex gap-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm opacity-80 leading-relaxed">{consejo.tr}</p>
                  {traduccion(consejo, locale) && (
                    <p className="text-sm opacity-60 leading-relaxed mt-1 italic">
                      {traduccion(consejo, locale)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
