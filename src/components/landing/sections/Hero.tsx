'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { LandingCopy } from '@/content/landing-copy';
import type { PublicDoctor } from '@/types/domain';
import { EASE, Magnetic } from '../primitives';
import { HeroVisual } from '../hero-visual';

interface HeroProps {
  copy: LandingCopy['hero'];
  clinicName: string;
  address?: string;
  city?: string;
  doctors: PublicDoctor[];
  ratingValue: string;
  ratingLabel: string;
  onBook: () => void;
  onSeeDoctors: () => void;
}

const LINE_VARIANTS = {
  hidden: { y: '110%' },
  visible: (i: number) => ({ y: 0, transition: { duration: 0.9, delay: 0.12 * i, ease: EASE } }),
};

export function Hero({ copy, clinicName, address, city, doctors, ratingValue, ratingLabel, onBook, onSeeDoctors }: HeroProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { damping: 30, stiffness: 60 });
  const py = useSpring(my, { damping: 30, stiffness: 60 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 24);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 24);
  };

  const lines = [copy.line1, copy.line2, copy.line3];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 pt-32 pb-16 sm:px-8 lg:px-14"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -end-40 top-0 -z-10 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.16), transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'mirror', ease: EASE }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -start-24 bottom-0 -z-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(27 68% 48% / 0.14), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay: 1 }}
      />

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {copy.eyebrow}
          </motion.div>

          <h1 className="font-semibold leading-[0.95] tracking-tight text-foreground">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={LINE_VARIANTS}
                  className="block text-6xl sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92]"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
            className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            {copy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <Magnetic>
              <button
                type="button"
                onClick={onBook}
                className="group flex items-center gap-2 rounded-full bg-primary py-4 ps-7 pe-2.5 text-sm font-semibold text-primary-foreground shadow-[0_24px_50px_-16px_hsl(var(--primary)/0.55)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
              >
                {copy.ctaPrimary}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </span>
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={onSeeDoctors}
              className="text-sm font-semibold text-foreground underline decoration-2 underline-offset-8 decoration-accent/40 transition-colors hover:decoration-accent"
            >
              {copy.ctaSecondary}
            </button>
          </motion.div>

          {address && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
              {address}
              {city ? `, ${city}` : ''} — {clinicName}
            </motion.p>
          )}
        </div>

        <motion.div style={{ x: px, y: py }} className="relative">
          <HeroVisual
            doctors={doctors.map((d) => ({ id: d.id, fullName: d.fullName }))}
            ratingLabel={ratingLabel}
            ratingValue={ratingValue}
            nextAvailableLabel={copy.badgeAvailable}
            nextAvailableValue=""
            verifiedLabel={copy.badgeVerified}
          />
        </motion.div>
      </div>
    </section>
  );
}
