'use client';

import { motion } from 'framer-motion';
import { CalendarCheck2, ShieldCheck, TrendingUp } from 'lucide-react';
import { DoctorAvatar } from './doctor-avatar';

const EASE = [0.32, 0.72, 0, 1] as const;

interface HeroVisualDoctor {
  id: string;
  fullName: string;
}

/**
 * Abstract, illustrative hero graphic — a stack of glass "appointment card" panels
 * with avatar-initial chips and floating badges. Deliberately not photographic:
 * satisfies "hero image" with UI-mockup imagery instead of a picture of a person.
 */
export function HeroVisual({
  doctors,
  ratingLabel,
  ratingValue,
  nextAvailableLabel,
  nextAvailableValue,
  verifiedLabel,
}: {
  doctors: HeroVisualDoctor[];
  ratingLabel: string;
  ratingValue: string;
  nextAvailableLabel: string;
  nextAvailableValue: string;
  verifiedLabel: string;
}) {
  const stackDoctors = doctors.slice(0, 4);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem]"
        style={{
          background:
            'radial-gradient(65% 65% at 50% 35%, hsl(var(--primary)/0.16), transparent), radial-gradient(45% 45% at 80% 80%, hsl(27 68% 48% / 0.14), transparent)',
        }}
      />

      {/* Back stacked card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: -9 }}
        transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        className="absolute inset-x-4 top-16 h-[70%] rounded-[2rem] bg-white/40 shadow-xl ring-1 ring-white/50 backdrop-blur-xl"
      />
      {/* Middle stacked card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 8 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        className="absolute inset-x-4 top-10 h-[70%] rounded-[2rem] bg-white/55 shadow-xl ring-1 ring-white/60 backdrop-blur-xl"
      />

      {/* Main glass card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] bg-white/70 p-6 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)] ring-1 ring-white/70 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            <CalendarCheck2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {nextAvailableLabel}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{nextAvailableValue}</span>
        </div>

        <div className="flex items-center">
          {stackDoctors.length > 0 ? (
            stackDoctors.map((d, i) => (
              <div key={d.id} style={{ marginInlineStart: i === 0 ? 0 : -14, zIndex: stackDoctors.length - i }} className="ring-2 ring-white rounded-full">
                <DoctorAvatar id={d.id} fullName={d.fullName} size="md" />
              </div>
            ))
          ) : (
            <div className="h-14 w-14 animate-pulse rounded-full bg-black/10" />
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <TrendingUp className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <span className="text-2xl font-semibold tracking-tight text-foreground">{ratingValue}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{ratingLabel}</p>
        </div>
      </motion.div>

      {/* Floating verified badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.7, ease: EASE },
          scale: { duration: 0.6, delay: 0.7, ease: EASE },
          y: { duration: 5, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay: 0.7 },
        }}
        className="absolute -start-6 top-8 z-20 flex items-center gap-2 rounded-2xl bg-white/80 px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] ring-1 ring-white/70 backdrop-blur-xl"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="text-xs font-semibold text-foreground">{verifiedLabel}</span>
      </motion.div>
    </div>
  );
}
