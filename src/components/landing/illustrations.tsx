'use client';

import { motion } from 'framer-motion';

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Flat, geometric illustrations — deliberately not photographic and without any
 * human figures, so they satisfy "add real images" while staying fully clear of
 * the project's no-photographic-people rule for doctors/patients.
 */

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 420" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <defs>
        <linearGradient id="heroBlob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.14" />
          <stop offset="100%" stopColor="hsl(27 68% 48%)" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="deviceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <motion.path
        d="M210 40c86 0 156 70 156 156s-70 156-156 156S54 282 54 196 124 40 210 40Z"
        fill="url(#heroBlob)"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: EASE }}
        style={{ transformOrigin: '210px 196px' }}
      />

      {/* Device card: appointment screen */}
      <g>
        <rect x="118" y="96" width="184" height="230" rx="24" fill="url(#deviceGrad)" />
        <rect x="140" y="128" width="140" height="18" rx="9" fill="white" fillOpacity="0.9" />
        <rect x="140" y="156" width="90" height="10" rx="5" fill="white" fillOpacity="0.55" />

        {/* mini calendar grid */}
        <rect x="140" y="186" width="140" height="94" rx="14" fill="white" fillOpacity="0.95" />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={152 + col * 30}
              y={198 + row * 20}
              width="18"
              height="12"
              rx="3"
              fill={row === 1 && col === 2 ? 'hsl(27 68% 48%)' : 'hsl(var(--primary))'}
              fillOpacity={row === 1 && col === 2 ? 1 : 0.15}
            />
          )),
        )}

        {/* checkmark badge */}
        <circle cx="270" cy="300" r="22" fill="hsl(27 68% 48%)" />
        <path d="M260 300l7 7 14-15" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Stethoscope arc */}
      <motion.path
        d="M96 150c-10 30-6 60 18 76 20 13 44 6 50-14"
        stroke="hsl(var(--primary))"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: EASE }}
      />
      <circle cx="96" cy="150" r="9" fill="hsl(var(--primary))" />
      <circle cx="164" cy="212" r="12" fill="none" stroke="hsl(var(--primary))" strokeWidth="7" />

      {/* Heart-rate pulse line */}
      <motion.path
        d="M64 356h44l14-30 18 54 16-40 12 16h60"
        stroke="hsl(27 68% 48%)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE }}
      />

      {/* Floating cross badge */}
      <motion.g
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay: 0.4 }}
      >
        <circle cx="336" cy="120" r="26" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
        <path d="M336 108v24M324 120h24" stroke="hsl(27 68% 48%)" strokeWidth="5" strokeLinecap="round" />
      </motion.g>

      {/* Decorative dots */}
      <circle cx="88" cy="90" r="5" fill="hsl(27 68% 48%)" fillOpacity="0.6" />
      <circle cx="352" cy="230" r="4" fill="hsl(var(--primary))" fillOpacity="0.5" />
      <circle cx="70" cy="260" r="4" fill="hsl(var(--primary))" fillOpacity="0.4" />
    </svg>
  );
}

export function SearchDoctorIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <rect x="18" y="18" width="70" height="86" rx="14" fill="hsl(var(--primary))" fillOpacity="0.1" />
      <rect x="30" y="32" width="46" height="8" rx="4" fill="hsl(var(--primary))" />
      <rect x="30" y="46" width="30" height="6" rx="3" fill="hsl(var(--primary))" fillOpacity="0.4" />
      <rect x="30" y="60" width="46" height="6" rx="3" fill="hsl(var(--primary))" fillOpacity="0.25" />
      <rect x="30" y="72" width="36" height="6" rx="3" fill="hsl(var(--primary))" fillOpacity="0.25" />
      <circle cx="82" cy="78" r="22" fill="white" stroke="hsl(27 68% 48%)" strokeWidth="6" />
      <line x1="98" y1="94" x2="112" y2="108" stroke="hsl(27 68% 48%)" strokeWidth="7" strokeLinecap="round" />
      <path d="M72 78a10 10 0 0 1 10-10" stroke="hsl(27 68% 48%)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function PickTimeIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <rect x="16" y="24" width="88" height="80" rx="16" fill="hsl(var(--primary))" fillOpacity="0.1" />
      <rect x="16" y="24" width="88" height="24" rx="16" fill="hsl(var(--primary))" />
      <rect x="34" y="14" width="8" height="20" rx="4" fill="hsl(var(--primary))" />
      <rect x="78" y="14" width="8" height="20" rx="4" fill="hsl(var(--primary))" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={30 + col * 16}
            y={62 + row * 16}
            width="10"
            height="10"
            rx="3"
            fill={row === 1 && col === 2 ? 'hsl(27 68% 48%)' : 'hsl(var(--primary))'}
            fillOpacity={row === 1 && col === 2 ? 1 : 0.18}
          />
        )),
      )}
    </svg>
  );
}

export function ConfirmIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <rect x="16" y="26" width="88" height="68" rx="16" fill="hsl(var(--primary))" fillOpacity="0.1" />
      <path d="M16 34l44 28 44-28" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="86" cy="86" r="26" fill="hsl(27 68% 48%)" />
      <path d="M74 86l8 8 18-18" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
