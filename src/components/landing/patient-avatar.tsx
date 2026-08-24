'use client';

import { UserRound } from 'lucide-react';

// Neutral, deliberately anonymous palette — distinct from DoctorAvatar's teal/clay identity —
// used to represent a reviewing patient without any photographic/human imagery.
const GRADIENTS = [
  'from-slate-500 to-slate-300',
  'from-zinc-500 to-zinc-300',
  'from-stone-500 to-stone-300',
  'from-neutral-500 to-neutral-300',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function PatientAvatar({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' | 'lg' }) {
  const gradient = GRADIENTS[hashString(id) % GRADIENTS.length];
  const dims = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-9 w-9' : 'h-14 w-14';
  const iconDim = size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${gradient} ${dims} shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] ring-1 ring-black/5`}
    >
      <UserRound className={iconDim + ' text-white/90'} strokeWidth={1.5} />
    </div>
  );
}
