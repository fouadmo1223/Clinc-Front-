'use client';

import * as React from 'react';
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

export function RecordsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <rect x="22" y="30" width="60" height="76" rx="14" fill="hsl(var(--primary))" fillOpacity="0.1" />
      <rect x="36" y="14" width="60" height="76" rx="14" fill="hsl(var(--primary))" />
      <rect x="48" y="30" width="36" height="7" rx="3.5" fill="white" fillOpacity="0.9" />
      <rect x="48" y="44" width="36" height="6" rx="3" fill="white" fillOpacity="0.5" />
      <rect x="48" y="56" width="24" height="6" rx="3" fill="white" fillOpacity="0.5" />
      <circle cx="80" cy="82" r="20" fill="hsl(27 68% 48%)" />
      <path d="M70 82l7 7 13-14" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Editorial illustration for the Problem section: a phone stuck mid-ring next to a
 *  drifting paper stack and a clock burning time — visual shorthand for "the old way". */
export function ProblemIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <circle cx="240" cy="210" r="190" fill="hsl(215 14% 42%)" fillOpacity="0.05" />

      {/* Paper stack */}
      <g opacity="0.9">
        <rect x="56" y="220" width="140" height="100" rx="10" fill="white" stroke="hsl(220 13% 82%)" strokeWidth="2" transform="rotate(-6 126 270)" />
        <rect x="70" y="206" width="140" height="100" rx="10" fill="white" stroke="hsl(220 13% 82%)" strokeWidth="2" transform="rotate(-2 140 256)" />
        <rect x="84" y="192" width="140" height="100" rx="10" fill="white" stroke="hsl(220 13% 80%)" strokeWidth="2" />
        <rect x="100" y="210" width="80" height="8" rx="4" fill="hsl(220 13% 85%)" />
        <rect x="100" y="226" width="100" height="8" rx="4" fill="hsl(220 13% 88%)" />
        <rect x="100" y="242" width="60" height="8" rx="4" fill="hsl(220 13% 88%)" />
      </g>

      {/* Clock */}
      <g>
        <circle cx="330" cy="140" r="58" fill="white" stroke="hsl(var(--primary))" strokeWidth="6" />
        <path d="M330 108v34l24 16" stroke="hsl(27 68% 48%)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="330" cy="140" r="5" fill="hsl(var(--primary))" />
      </g>

      {/* Ringing phone */}
      <g>
        <rect x="230" y="250" width="86" height="140" rx="20" fill="hsl(var(--primary))" />
        <rect x="248" y="270" width="50" height="80" rx="8" fill="white" fillOpacity="0.92" />
        <circle cx="273" cy="366" r="6" fill="white" fillOpacity="0.7" />
        <path
          d="M320 260c14-10 14-30 0-40M336 246c22-18 22-52 0-70"
          stroke="hsl(27 68% 48%)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>

      <circle cx="120" cy="140" r="6" fill="hsl(27 68% 48%)" fillOpacity="0.5" />
      <circle cx="390" cy="300" r="5" fill="hsl(var(--primary))" fillOpacity="0.4" />
    </svg>
  );
}

/** Split-composition illustration for the Concept section: a live-calendar ring
 *  connected to verified-doctor nodes and a records badge — "the connected clinic". */
export function ConceptIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 460" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      <circle cx="230" cy="230" r="200" fill="hsl(var(--primary))" fillOpacity="0.06" />
      <circle cx="230" cy="230" r="150" stroke="hsl(var(--primary))" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 10" fill="none" />

      {/* Connecting lines */}
      <path d="M230 230L120 140M230 230L340 130M230 230L340 330M230 230L120 320" stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="2" />

      {/* Central live-calendar disc */}
      <circle cx="230" cy="230" r="72" fill="hsl(var(--primary))" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={200 + col * 22}
            y={205 + row * 22}
            width="14"
            height="14"
            rx="4"
            fill={row === 1 && col === 1 ? 'hsl(27 68% 48%)' : 'white'}
            fillOpacity={row === 1 && col === 1 ? 1 : 0.55}
          />
        )),
      )}

      {/* Doctor nodes */}
      {[
        { x: 120, y: 140, fill: 'hsl(174 46% 40%)' },
        { x: 340, y: 130, fill: 'hsl(27 68% 48%)' },
        { x: 340, y: 330, fill: 'hsl(215 28% 30%)' },
        { x: 120, y: 320, fill: 'hsl(174 40% 55%)' },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="30" fill="white" />
          <circle cx={n.x} cy={n.y} r="30" fill={n.fill} fillOpacity="0.15" />
          <circle cx={n.x} cy={n.y} r="22" fill={n.fill} />
        </g>
      ))}

      {/* Verified badge */}
      <g>
        <circle cx="230" cy="80" r="24" fill="white" stroke="hsl(27 68% 48%)" strokeWidth="3" />
        <path d="M220 80l7 7 13-14" stroke="hsl(27 68% 48%)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/** Full-viewport visual-break illustration — light strokes on a dark ground, a slow
 *  orbit of pulse rings representing continuous, always-available care. */
export function OrbitIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 800" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      {[120, 220, 320, 420].map((r, i) => (
        <circle key={r} cx="400" cy="400" r={r} stroke="white" strokeOpacity={0.14 - i * 0.02} strokeWidth="1" fill="none" />
      ))}
      <circle cx="400" cy="400" r="60" fill="hsl(27 68% 48%)" fillOpacity="0.9" />
      <circle cx="400" cy="400" r="60" stroke="white" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      {[
        { angle: 20, r: 220 },
        { angle: 140, r: 320 },
        { angle: 250, r: 220 },
        { angle: 320, r: 420 },
      ].map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = 400 + n.r * Math.cos(rad);
        const y = 400 + n.r * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 10 : 7} fill="white" fillOpacity="0.85" />;
      })}
    </svg>
  );
}

/** Compact badge icon used in the Features rail — six distinct hand-drawn glyphs
 *  sharing one visual language (rounded tile + two-tone accent stroke). */
export function FeatureGlyph({ variant, className }: { variant: 0 | 1 | 2 | 3 | 4 | 5; className?: string }) {
  const paths: React.ReactNode[] = [
    // 0 — real-time booking: calendar + bolt
    <React.Fragment key="0">
      <rect x="10" y="14" width="44" height="40" rx="10" fill="currentColor" fillOpacity="0.12" />
      <rect x="10" y="14" width="44" height="14" rx="10" fill="currentColor" />
      <path d="M34 30l-10 16h8l-2 12 12-18h-8l2-10z" fill="hsl(27 68% 48%)" />
    </React.Fragment>,
    // 1 — verified doctors: shield check
    <React.Fragment key="1">
      <path d="M32 8l20 8v14c0 15-8 24-20 30-12-6-20-15-20-30V16z" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 8l20 8v14c0 15-8 24-20 30-12-6-20-15-20-30V16z" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M23 32l7 7 12-14" stroke="hsl(27 68% 48%)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </React.Fragment>,
    // 2 — digital records: layered docs
    <React.Fragment key="2">
      <rect x="14" y="20" width="30" height="38" rx="6" fill="currentColor" fillOpacity="0.15" />
      <rect x="22" y="10" width="30" height="38" rx="6" fill="currentColor" />
      <rect x="29" y="20" width="16" height="4" rx="2" fill="white" fillOpacity="0.8" />
      <rect x="29" y="28" width="16" height="4" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="29" y="36" width="10" height="4" rx="2" fill="white" fillOpacity="0.5" />
    </React.Fragment>,
    // 3 — smart reminders: bell + wave
    <React.Fragment key="3">
      <path d="M32 10c9 0 15 7 15 16v10l6 8H11l6-8V26c0-9 6-16 15-16z" fill="currentColor" fillOpacity="0.14" />
      <path d="M32 10c9 0 15 7 15 16v10l6 8H11l6-8V26c0-9 6-16 15-16z" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M26 50a6 6 0 0012 0" stroke="hsl(27 68% 48%)" strokeWidth="4" strokeLinecap="round" fill="none" />
    </React.Fragment>,
    // 4 — private by design: lock
    <React.Fragment key="4">
      <rect x="16" y="28" width="32" height="26" rx="8" fill="currentColor" fillOpacity="0.14" />
      <rect x="16" y="28" width="32" height="26" rx="8" stroke="currentColor" strokeWidth="3" fill="none" />
      <path d="M22 28v-6a10 10 0 0120 0v6" stroke="currentColor" strokeWidth="3.5" fill="none" />
      <circle cx="32" cy="41" r="4" fill="hsl(27 68% 48%)" />
    </React.Fragment>,
    // 5 — multi-specialty: grid of tiles
    <React.Fragment key="5">
      {[0, 1].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={14 + col * 20}
            y={12 + row * 20}
            width="16"
            height="16"
            rx="5"
            fill={row === col ? 'hsl(27 68% 48%)' : 'currentColor'}
            fillOpacity={row === col ? 1 : 0.16}
          />
        )),
      )}
    </React.Fragment>,
  ];

  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
      {paths[variant]}
    </svg>
  );
}
