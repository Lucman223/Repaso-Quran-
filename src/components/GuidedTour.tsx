"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

export interface TourStep {
  target: string;   // CSS selector o "body" para centrado
  title: string;
  content: string;
}

interface TourProps {
  steps: TourStep[];
  run: boolean;
  onFinish: () => void;
  locale?: {
    next?: string;
    back?: string;
    skip?: string;
    last?: string;
  };
}

interface Rect { top: number; left: number; width: number; height: number }

const PADDING = 10;

export function GuidedTour({ steps, run, onFinish, locale }: TourProps) {
  const [current, setCurrent] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[current];
  const isCentered = !step || step.target === "body";
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  useEffect(() => {
    if (!run) return;
    setCurrent(0);
  }, [run]);

  useEffect(() => {
    if (!run || isCentered) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Update rect after scroll
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }, 350);
    } else {
      setTargetRect(null);
    }
  }, [current, run, step, isCentered]);

  if (!run || steps.length === 0) return null;

  const handleNext = () => {
    if (isLast) onFinish();
    else setCurrent((c) => c + 1);
  };
  const handleBack = () => setCurrent((c) => c - 1);
  const handleSkip = () => onFinish();

  // Compute tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered || !targetRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
        width: "min(90vw, 340px)",
        maxHeight: "90vh",
        overflowY: "auto",
      };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const tooltipWidth = Math.min(vw * 0.9, 340);
    const estimatedHeight = 220; // Estimación más conservadora

    let left = targetRect.left;
    if (left + tooltipWidth > vw - PADDING) {
      left = vw - tooltipWidth - PADDING;
    }
    if (left < PADDING) {
      left = PADDING;
    }

    const below = targetRect.top + targetRect.height + PADDING;
    const above = targetRect.top - PADDING - estimatedHeight;
    
    let top = above > 60 ? above : below;

    // Evitar que se salga por abajo
    if (top + estimatedHeight > vh - PADDING) {
      if (above > PADDING) {
        top = above; // Preferimos arriba si cabe
      } else {
        // Si no cabe ni arriba ni abajo, lo anclamos al fondo visible
        top = vh - estimatedHeight - PADDING;
      }
    }
    
    // Evitar que se salga por arriba
    if (top < PADDING) {
      top = PADDING;
    }

    return {
      position: "fixed",
      top,
      left,
      zIndex: 10001,
      width: `${tooltipWidth}px`,
      maxHeight: "90vh",
      overflowY: "auto",
    };
  };

  return (
    <>
      {/* Overlay */}
      {isCentered || !targetRect ? (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
          onClick={handleSkip}
        />
      ) : (
        <>
          {/* Top */}
          <div
            className="fixed left-0 right-0 top-0 bg-black/60 z-[10000]"
            style={{ height: Math.max(0, targetRect.top - PADDING) }}
          />
          {/* Bottom */}
          <div
            className="fixed left-0 right-0 bottom-0 bg-black/60 z-[10000]"
            style={{ top: targetRect.top + targetRect.height + PADDING }}
          />
          {/* Left */}
          <div
            className="fixed top-0 bottom-0 left-0 bg-black/60 z-[10000]"
            style={{
              top: Math.max(0, targetRect.top - PADDING),
              height: targetRect.height + PADDING * 2,
              width: Math.max(0, targetRect.left - PADDING),
            }}
          />
          {/* Right */}
          <div
            className="fixed top-0 bottom-0 bg-black/60 z-[10000]"
            style={{
              top: Math.max(0, targetRect.top - PADDING),
              height: targetRect.height + PADDING * 2,
              left: targetRect.left + targetRect.width + PADDING,
              right: 0,
            }}
          />
          {/* Highlight ring */}
          <div
            className="fixed z-[10000] rounded-xl ring-2 ring-[var(--color-primary)] ring-offset-2 pointer-events-none"
            style={{
              top: targetRect.top - PADDING,
              left: targetRect.left - PADDING,
              width: targetRect.width + PADDING * 2,
              height: targetRect.height + PADDING * 2,
            }}
          />
        </>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="text-sm font-bold text-[var(--color-primary)] leading-snug flex-1">
            {step.title}
          </h3>
          <button
            onClick={handleSkip}
            className="p-1 rounded-full opacity-40 hover:opacity-70 transition-opacity shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm opacity-70 leading-relaxed mb-5">{step.content}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 bg-[var(--color-primary)]"
                  : i < current
                  ? "w-1.5 bg-[var(--color-primary)]/40"
                  : "w-1.5 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-background)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {locale?.back ?? "Atrás"}
            </button>
          )}
          <button
            onClick={handleSkip}
            className="px-3 py-2 rounded-xl text-xs font-semibold opacity-50 hover:opacity-80 transition-opacity ml-auto"
          >
            {locale?.skip ?? "Saltar"}
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            {isLast ? (locale?.last ?? "Empezar") : (locale?.next ?? "Siguiente")}
            {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </>
  );
}
