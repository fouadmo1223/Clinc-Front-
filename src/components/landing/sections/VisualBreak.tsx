'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE } from '../primitives';
import { OrbitIllustration } from '../illustrations';

export function VisualBreak({ copy }: { copy: LandingCopy['visualBreak'] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-[#0b1614] px-5">
      <motion.div style={{ scale, rotate }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <OrbitIllustration className="h-[140vh] w-[140vh] max-w-none opacity-90" />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 60% at 50% 50%, transparent, #0b1614 75%)' }}
      />

      <motion.div style={{ y: textY }} className="relative text-center">
        <motion.h2
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: EASE }}
          className="text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl"
        >
          {copy.title1}
          <br />
          <span className="text-white/50">{copy.title2}</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mx-auto mt-6 max-w-md text-base text-white/60"
        >
          {copy.subtitle}
        </motion.p>
      </motion.div>
    </section>
  );
}
