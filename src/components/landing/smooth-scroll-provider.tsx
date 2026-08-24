'use client';

import * as React from 'react';
import Lenis from 'lenis';
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/gsap';

let activeLenis: Lenis | null = null;

/** The live Lenis instance, if smooth scroll is active (null under prefers-reduced-motion). */
export function getLenis(): Lenis | null {
  return activeLenis;
}

/**
 * Drives the whole landing page's scroll physics: Lenis for the inertial feel,
 * synced into GSAP's ticker so every ScrollTrigger in the tree stays in lockstep
 * with the smoothed scroll position instead of the raw (jumpy) native one.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const gs = ensureGsap();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    activeLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gs.ticker.add(tick);
    gs.ticker.lagSmoothing(0);

    return () => {
      gs.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);

  return <>{children}</>;
}
