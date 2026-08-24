'use client';

import * as React from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

export const EASE = [0.32, 0.72, 0, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, tone = 'primary' }: { children: React.ReactNode; tone?: 'primary' | 'inverted' }) {
  if (tone === 'inverted') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
        <Sparkles className="h-3 w-3" strokeWidth={1.5} />
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
      <Sparkles className="h-3 w-3" strokeWidth={1.5} />
      {children}
    </span>
  );
}

export function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 24, stiffness: 90 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  React.useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function FloatingBlob({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className ?? ''}`}
      animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
      transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay }}
    />
  );
}

/** Wraps a CTA so it gently pulls toward the cursor within its own bounds, then springs back. */
export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 14, stiffness: 150, mass: 0.4 });
  const springY = useSpring(y, { damping: 14, stiffness: 150, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}

export function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${dim} ${i < Math.round(value) ? 'fill-warning text-warning' : 'text-border'}`} strokeWidth={1.5} />
      ))}
    </div>
  );
}
