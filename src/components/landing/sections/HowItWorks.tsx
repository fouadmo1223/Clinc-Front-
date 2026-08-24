'use client';

import * as React from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/gsap';
import type { LandingCopy } from '@/content/landing-copy';
import { Eyebrow } from '../primitives';
import { SearchDoctorIllustration, PickTimeIllustration, ConfirmIllustration, RecordsIllustration } from '../illustrations';

const ILLUSTRATIONS = [SearchDoctorIllustration, PickTimeIllustration, ConfirmIllustration, RecordsIllustration];

export function HowItWorks({ copy }: { copy: LandingCopy['how'] }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const stepRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = React.useState(0);

  useGSAP(
    () => {
      ensureGsap();
      const path = pathRef.current;
      const section = sectionRef.current;
      if (!path || !section) return;

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      const drawTween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.6,
        },
      });

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
        drawTween.scrollTrigger?.kill();
        drawTween.kill();
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
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative hidden lg:block">
            <div className="sticky top-32">
              <svg viewBox="0 0 120 480" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
                <path
                  ref={pathRef}
                  d="M60 20 L60 460"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6 10"
                  opacity="0.5"
                />
              </svg>
              <div className="relative flex h-[480px] flex-col items-center justify-between py-4">
                {copy.steps.map((_, i) => {
                  const Illustration = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0];
                  const isActive = active === i;
                  return (
                    <div
                      key={i}
                      className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border transition-all duration-500"
                      style={{
                        borderColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                        backgroundColor: isActive ? 'hsl(var(--surface))' : 'hsl(var(--surface-sunken))',
                        boxShadow: isActive ? '0 20px 50px -20px hsl(var(--primary)/0.35)' : 'none',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      <Illustration className="h-16 w-16" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-24 lg:gap-32">
            {copy.steps.map((step, i) => {
              const Illustration = ILLUSTRATIONS[i] ?? ILLUSTRATIONS[0];
              return (
                <div
                  key={step.title}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="transition-opacity duration-500"
                  style={{ opacity: active === i ? 1 : 0.45 }}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.07] lg:hidden">
                    <Illustration className="h-11 w-11" />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
