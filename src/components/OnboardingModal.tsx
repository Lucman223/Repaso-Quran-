"use client";

import { useState } from "react";
import { BookOpen, LayoutGrid, Headphones, Repeat2, Mic, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const STEPS = [
  { icon: BookOpen, key: "step1" },
  { icon: LayoutGrid, key: "step2" },
  { icon: Headphones, key: "step3" },
  { icon: Repeat2, key: "step4" },
  { icon: Mic, key: "step5" },
] as const;

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)]">
      {/* Skip button */}
      <div className="flex justify-end p-4 pt-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold opacity-50 hover:opacity-80 transition-opacity border border-[var(--color-border)]"
        >
          <X className="w-3.5 h-3.5" />
          {t("onboarding.skip")}
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
            <Icon className="w-12 h-12 text-[var(--color-primary)]" />
          </div>
          {/* Step number */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
            {step + 1}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3 max-w-sm">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] leading-snug">
            {t(`onboarding.${current.key}Title`)}
          </h2>
          <p className="text-base opacity-70 leading-relaxed">
            {t(`onboarding.${current.key}Desc`)}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-4">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-6 bg-[var(--color-primary)]"
                : i < step
                ? "w-2 bg-[var(--color-primary)]/40"
                : "w-2 bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 px-6 pb-8">
        {!isFirst ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm border border-[var(--color-border)] hover:bg-[var(--color-card)] transition-colors"
          >
            {t("onboarding.prev")}
          </button>
        ) : (
          <div className="flex-1" />
        )}

        <button
          onClick={isLast ? onClose : () => setStep((s) => s + 1)}
          className="flex-2 flex-grow-[2] py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[var(--color-primary)]/20"
        >
          {isLast ? t("onboarding.start") : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
}
