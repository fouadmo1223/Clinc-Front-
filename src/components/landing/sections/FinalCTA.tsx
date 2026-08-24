'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE, Magnetic } from '../primitives';

export function FinalCTA({ copy, onCta }: { copy: LandingCopy['finalCta']; onCta: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[#0b1614] px-5 py-32 text-center sm:px-8">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 55% at 50% 30%, hsl(27 68% 48% / 0.16), transparent)' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: EASE }}
      />

      {[
        { top: '18%', start: '12%', size: 14, delay: 0 },
        { top: '65%', start: '18%', size: 8, delay: 0.8 },
        { top: '25%', start: '82%', size: 10, delay: 1.4 },
        { top: '70%', start: '78%', size: 16, delay: 0.4 },
      ].map((d, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{ top: d.top, insetInlineStart: d.start, width: d.size, height: d.size }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay: d.delay }}
        />
      ))}

      <div className="relative mx-auto max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">{copy.eyebrow}</span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-6 text-5xl font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {copy.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mx-auto mt-6 max-w-md text-base text-white/60"
        >
          {copy.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          className="mt-10"
        >
          <Magnetic>
            <button
              type="button"
              onClick={onCta}
              className="group inline-flex items-center gap-2 rounded-full bg-white py-4 ps-7 pe-2.5 text-sm font-semibold text-[#0b1614] shadow-[0_30px_70px_-20px_rgba(255,255,255,0.25)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            >
              {copy.cta}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1614]/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
