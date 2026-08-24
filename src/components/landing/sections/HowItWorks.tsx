'use client';

import * as React from 'react';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ensureGsap, ScrollTrigger } from '@/lib/gsap';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE, Eyebrow } from '../primitives';
import { SearchDoctorIllustration, PickTimeIllustration, ConfirmIllustration, RecordsIllustration } from '../illustrations';

const ILLUSTRATIONS = [SearchDoctorIllustration, PickTimeIllustration, ConfirmIllustration, RecordsIllustration];

export function HowItWorks({ copy }: { copy: LandingCopy['how'] }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stepRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = React.useState(0);

  useGSAP(
    () => {
      ensureGsap();
      const section = sectionRef.current;
      if (!section) return;

      const triggers = stepRefs.current.map((el, i) => {
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });

      return () => {
        triggers.forEach((tr) => tr?.kill());
      };
    },
    { scope: sectionRef, dependencies: [copy.steps.length] },
  );

  return (
    <section id="how" ref={sectionRef} className="relative px-5 py-28 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-xl">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">{copy.title}</h2>
          <p className="mt-4 text-xl text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative hidden lg:block">
            <div className="sticky top-32 flex items-center gap-6">
              {/* Progress rail: one dot per step, filled up to the active step */}
              <div className="relative flex h-80 w-2 shrink-0 flex-col items-center justify-between rounded-full bg-border/60">
                <motion.div
                  className="absolute inset-x-0 top-0 rounded-full bg-primary"
                  animate={{ height: `${((active + 1) / copy.steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
                {copy.steps.map((_, i) => (
                  <span
                    key={i}
                    className="relative z-10 h-2 w-2 rounded-full transition-colors duration-500"
                    style={{ backgroundColor: i <= active ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                  />
                ))}
              </div>

              {/* Single crossfading illustration tied to the active step */}
              <div className="relative flex h-80 w-80 items-center justify-center rounded-[2rem] border border-border bg-surface shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)]">
                <AnimatePresence mode="wait">
                  {(() => {
                    const Illustration = ILLUSTRATIONS[active] ?? ILLUSTRATIONS[0];
                    return (
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        <Illustration className="h-48 w-48" />
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
                <span className="absolute bottom-5 text-sm font-semibold tabular-nums text-muted-foreground">
                  {String(active + 1).padStart(2, '0')} / {String(copy.steps.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-24 lg:gap-0">
            {copy.steps.map((step, i) => {
              const Illustration = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0];
              return (
                <div
                  key={step.title}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="transition-opacity duration-500 lg:flex lg:min-h-[70vh] lg:flex-col lg:justify-center"
                  style={{ opacity: active === i ? 1 : 0.45 }}
                >
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/[0.07] lg:hidden">
                    <Illustration className="h-14 w-14" />
                  </div>
                  <span className="text-lg font-bold tabular-nums text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-4xl font-semibold sm:text-5xl">{step.title}</h3>
                  <p className="mt-4 max-w-md text-xl leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
