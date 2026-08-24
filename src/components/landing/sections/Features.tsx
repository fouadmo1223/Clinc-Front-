'use client';

import * as React from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsap, gsap } from '@/lib/gsap';
import type { LandingCopy } from '@/content/landing-copy';
import { Eyebrow } from '../primitives';
import { FeatureGlyph } from '../illustrations';

/**
 * Vertical scroll drives a pinned, horizontally-scrubbed feature rail (GSAP
 * ScrollTrigger). The track itself is forced dir="ltr" so the translate math
 * stays simple regardless of page direction. To still read correctly in
 * Arabic — card 01 starting at the right, revealing 02/03/... toward the
 * left as the user scrolls — the render order is reversed and the tween
 * runs in the opposite direction (starts fully offset, animates back to 0)
 * for RTL instead of flipping the whole subtree's direction.
 */
export function Features({ copy, dir }: { copy: LandingCopy['features']; dir: 'ltr' | 'rtl' }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const isRtl = dir === 'rtl';

  useGSAP(
    () => {
      ensureGsap();
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const section = sectionRef.current;
      if (!track || !viewport || !section) return;

      const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      // Always reset first — otherwise switching locale without a reload leaves the
      // track at whatever x the previous direction's setup last applied.
      gsap.set(track, { x: isRtl ? () => -getDistance() : 0 });

      const tween = gsap.to(track, {
        x: () => (isRtl ? 0 : -getDistance()),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance() + window.innerHeight * 0.35}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [isRtl] },
  );

  const orderedItems = isRtl ? [...copy.items].map((item, i) => ({ item, i })).reverse() : copy.items.map((item, i) => ({ item, i }));

  return (
    <section id="features" ref={sectionRef} className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{copy.title}</h2>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div ref={viewportRef} className="mt-16 overflow-hidden" dir="ltr">
        <div ref={trackRef} className="flex w-max gap-6 px-5 sm:px-8 lg:px-14">
          {orderedItems.map(({ item: f, i }) => (
            <div
              key={f.title}
              dir={dir}
              className="flex w-[80vw] shrink-0 flex-col justify-between rounded-[2rem] border border-border/60 bg-surface p-8 sm:w-[420px] sm:p-10"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.07] text-primary">
                <FeatureGlyph variant={i as 0 | 1 | 2 | 3 | 4 | 5} className="h-10 w-10" />
              </div>
              <div className="mt-10">
                <h3 className="text-2xl font-semibold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
              <span className="mt-10 block text-7xl font-semibold tabular-nums text-border">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
