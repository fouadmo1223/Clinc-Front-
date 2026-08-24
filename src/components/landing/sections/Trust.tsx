'use client';

import { motion } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import { AnimatedCounter, EASE } from '../primitives';

interface TrustProps {
  copy: LandingCopy['trust'];
  avgRating: number;
  doctorCount: number;
  specialties: string[];
}

export function Trust({ copy, avgRating, doctorCount, specialties }: TrustProps) {
  const stats = [
    { display: avgRating > 0 ? avgRating.toFixed(1) : '—', value: 0, label: copy.stat1 },
    { value: doctorCount, suffix: '+', label: copy.stat2 },
    { value: 500, suffix: '+', label: copy.stat3 },
    { value: 5, suffix: '+', label: copy.stat4 },
  ];

  const marqueeItems = specialties.length > 0 ? [...specialties, ...specialties, ...specialties] : [];

  return (
    <section className="border-y border-border/60 bg-surface-sunken/50 py-14">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{copy.label}</p>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className="text-center"
            >
              <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {s.display ?? <AnimatedCounter value={s.value} suffix={s.suffix} />}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {marqueeItems.length > 0 && (
        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-r from-surface-sunken to-transparent rtl:bg-gradient-to-l" />
          <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-l from-surface-sunken to-transparent rtl:bg-gradient-to-r" />
          <motion.div
            className="flex w-max items-center gap-4"
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeItems.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="shrink-0 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground/80"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}
