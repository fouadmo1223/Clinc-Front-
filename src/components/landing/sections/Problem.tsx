'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE, Eyebrow } from '../primitives';
import { ProblemIllustration } from '../illustrations';

export function Problem({ copy }: { copy: LandingCopy['problem'] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const illustrationY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const bgY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-28 sm:px-8 lg:px-14">
      <motion.div
        aria-hidden
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
      >
        <div className="mx-auto h-full max-w-[1400px]">
          <div
            className="absolute end-[6%] top-0 h-[36rem] w-[36rem] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, hsl(215 14% 42% / 0.06), transparent 70%)' }}
          />
        </div>
      </motion.div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div style={{ y: illustrationY }} className="order-2 lg:order-1">
          <ProblemIllustration className="mx-auto w-full max-w-md" />
        </motion.div>

        <div className="order-1 lg:order-2">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{copy.title}</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{copy.body}</p>

          <div className="mt-10 space-y-6 border-t border-border/60 pt-8">
            {copy.points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className="flex gap-4 text-start"
              >
                <span className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground/40">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
