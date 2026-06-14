"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, ScrollText, Quote, GraduationCap, Lightbulb } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CITAS, pick, type TipoCita } from "@/lib/contenido";

const SECCIONES: { tipo: TipoCita; icon: React.ReactNode; tituloKey: string }[] = [
  { tipo: "ayet", icon: <BookOpen className="w-5 h-5" />, tituloKey: "motivacion.ayetler" },
  { tipo: "hadis", icon: <ScrollText className="w-5 h-5" />, tituloKey: "motivacion.hadisler" },
  { tipo: "soz", icon: <Quote className="w-5 h-5" />, tituloKey: "motivacion.sozler" },
];

export default function MotivacionPage() {
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
        <h1 className="text-base font-bold">{t("motivacion.title")}</h1>
      </header>

      <main className="flex-1 p-4 pb-12 max-w-2xl mx-auto w-full space-y-8">
        <p className="text-sm opacity-60 leading-relaxed">{t("motivacion.intro")}</p>

        {/* Accesos a método y consejos */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/metodo"
            className="flex items-center gap-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-primary)] transition-all"
          >
            <GraduationCap className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
            <span className="text-sm font-semibold">{t("metodo.title")}</span>
          </Link>
          <Link
            href="/metodo#consejos"
            className="flex items-center gap-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-primary)] transition-all"
          >
            <Lightbulb className="w-5 h-5 text-[var(--color-gold)] shrink-0" />
            <span className="text-sm font-semibold">{t("metodo.tipsTitle")}</span>
          </Link>
        </div>

        {SECCIONES.map((sec) => {
          const items = CITAS.filter((c) => c.tipo === sec.tipo);
          if (items.length === 0) return null;
          return (
            <section key={sec.tipo}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-[var(--color-primary)]">
                {sec.icon} {t(sec.tituloKey)}
              </h2>
              <div className="space-y-3">
                {items.map((cita) => (
                  <div
                    key={cita.id}
                    className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm"
                  >
                    <p className="text-sm leading-relaxed font-medium">
                      “{pick(cita, locale)}”
                    </p>
                    <p className="text-xs opacity-50 mt-2">— {cita.kaynak}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
