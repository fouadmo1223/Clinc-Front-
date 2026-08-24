'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { EASE, Eyebrow, Reveal } from '../primitives';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-border/60 py-2">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-4 text-start">
        <span className="text-lg font-medium">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-base leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq({ eyebrow, title, faqs }: { eyebrow: string; title: string; faqs: { q: string; a: string }[] }) {
  return (
    <section id="faq" className="px-5 py-28 sm:px-8 lg:px-14">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-[0.7fr_1.3fr]">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
        </Reveal>
        <div>
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
