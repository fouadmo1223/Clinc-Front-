'use client';

import { motion } from 'framer-motion';
import { Star, Stethoscope, Users, CalendarClock } from 'lucide-react';
import type { LandingCopy } from '@/content/landing-copy';
import { AnimatedCounter, Stars } from '../primitives';

interface TrustProps {
  copy: LandingCopy['trust'];
  avgRating: number;
  doctorCount: number;
  specialties: string[];
}

const panelVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const cellVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

export function Trust({ copy, avgRating, doctorCount, specialties }: TrustProps) {
  const stats = [
    { icon: Star, display: avgRating > 0 ? avgRating.toFixed(1) : '—', value: 0, label: copy.stat1, rating: true },
    { icon: Stethoscope, value: doctorCount, suffix: '+', label: copy.stat2 },
    { icon: Users, value: 500, suffix: '+', label: copy.stat3 },
    { icon: CalendarClock, value: 5, suffix: '+', label: copy.stat4 },
  ];

  const marqueeItems = specialties.length > 0 ? [...specialties, ...specialties, ...specialties] : [];

  return (
    <section className="border-y border-border/60 bg-surface-sunken/50 py-14">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{copy.label}</p>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={panelVariants}
          className="relative mt-9 grid grid-cols-2 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse"
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={cellVariants} className="flex flex-col items-center gap-2.5 px-6 py-9 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {s.display ?? <AnimatedCounter value={s.value} suffix={s.suffix} />}
                </p>
                {s.rating && <Stars value={avgRating} />}
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
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
