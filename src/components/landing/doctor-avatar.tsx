'use client';

import { Stethoscope } from 'lucide-react';

// Curated gradient pairs — deliberately abstract (no photographic/human imagery for doctor
// profiles), picked from the app's existing teal/clay identity plus a few complementary tones.
const GRADIENTS = [
  'from-teal-700 to-teal-500',
  'from-amber-600 to-orange-500',
  'from-slate-700 to-slate-500',
  'from-emerald-700 to-emerald-500',
  'from-stone-700 to-stone-500',
  'from-cyan-700 to-cyan-500',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Same deterministic gradient a doctor's avatar uses — for cards that want a matching accent. */
export function getDoctorGradient(id: string): string {
  return GRADIENTS[hashString(id) % GRADIENTS.length];
}

function initials(fullName: string): string {
  const parts = fullName.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function DoctorAvatar({ id, fullName, size = 'md' }: { id: string; fullName: string; size?: 'sm' | 'md' | 'lg' }) {
  const gradient = GRADIENTS[hashString(id) % GRADIENTS.length];
  const dims = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'sm' ? 'h-9 w-9 text-[10px]' : 'h-14 w-14 text-sm';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${gradient} ${dims} font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-black/5`}
    >
      <Stethoscope className="absolute h-[60%] w-[60%] -rotate-12 text-white/15" strokeWidth={1.5} />
      <span className="relative">{initials(fullName)}</span>
    </div>
  );
}
