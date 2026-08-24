'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE, Eyebrow } from '../primitives';
import { ConceptIllustration } from '../illustrations';

export function Concept({ copy, onCta }: { copy: LandingCopy['concept']; onCta: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-surface-sunken/40 px-5 py-28 sm:px-8 lg:px-14">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{copy.title}</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{copy.body}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {copy.points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className="rounded-2xl border border-border/60 bg-surface p-5"
              >
                <h3 className="text-sm font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={onCta}
            className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            {copy.cta}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 rtl:group-hover:-translate-x-1" strokeWidth={2} />
          </button>
        </div>

        <motion.div style={{ rotate, scale }} className="relative">
          <ConceptIllustration className="mx-auto w-full max-w-lg" />
        </motion.div>
      </div>
    </section>
  );
}
