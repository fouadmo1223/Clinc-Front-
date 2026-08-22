import { cn } from '@/lib/utils';

const PALETTE = [
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
  'bg-info/10 text-info',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const colorClass = PALETTE[hashString(name) % PALETTE.length];
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
        colorClass,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
