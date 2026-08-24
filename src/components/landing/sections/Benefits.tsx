'use client';

import { motion } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import { AnimatedCounter, EASE, Eyebrow, FloatingBlob } from '../primitives';

export function Benefits({
  copy,
  avgRating,
  doctorCount,
  patientLabel,
  doctorLabel,
  ratingLabel,
  yearsLabel,
}: {
  copy: LandingCopy['benefits'];
  avgRating: number;
  doctorCount: number;
  patientLabel: string;
  doctorLabel: string;
  ratingLabel: string;
  yearsLabel: string;
}) {
  return (
    <section className="relative overflow-hidden px-5 py-32 sm:px-8 lg:px-14">
      <FloatingBlob className="start-[8%] top-10 h-72 w-72 bg-primary/8" />
      <FloatingBlob className="end-[4%] bottom-0 h-64 w-64 bg-accent/10" delay={1.2} />

      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-lg">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{copy.body}</p>
        </div>

        <div className="relative mt-20 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="sm:col-span-7"
          >
            <span className="mb-3 block h-1.5 w-10 rounded-full bg-primary" />
            <p className="text-[5.5rem] font-semibold leading-none tracking-tight text-primary sm:text-[8rem]">
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">{ratingLabel}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="self-end sm:col-span-5"
          >
            <span className="mb-3 block h-1.5 w-10 rounded-full bg-accent" />
            <p className="text-7xl font-semibold leading-none tracking-tight text-accent sm:text-8xl">
              <AnimatedCounter value={doctorCount} suffix="+" />
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">{doctorLabel}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="sm:col-span-5"
          >
            <span className="mb-3 block h-1.5 w-10 rounded-full bg-primary" />
            <p className="text-5xl font-semibold leading-none tracking-tight text-primary sm:text-6xl">
              <AnimatedCounter value={500} suffix="+" />
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">{patientLabel}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="self-end sm:col-span-7 sm:text-end"
          >
            <span className="mb-3 block h-1.5 w-10 rounded-full bg-accent sm:ms-auto" />
            <p className="text-6xl font-semibold leading-none tracking-tight text-accent sm:text-7xl">
              <AnimatedCounter value={5} suffix="+" />
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">{yearsLabel}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
