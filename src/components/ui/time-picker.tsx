'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

function toMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const ALL_SLOTS = Array.from({ length: (24 * 60) / 15 }, (_, i) => fromMinutes(i * 15));

export interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, id, className, disabled }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open && value && listRef.current) {
      const target = listRef.current.querySelector(`[data-value="${value}"]`);
      target?.scrollIntoView({ block: 'center' });
    }
  }, [open, value]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-sm shadow-xs transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span className="tabular-nums">{value || '--:--'}</span>
          <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-28 rounded-md border border-border bg-surface shadow-popover data-[state=open]:animate-dialog-in"
        >
          {/* stopPropagation: prevents Radix's Dialog scroll-lock (when this picker
              opens inside a modal) from swallowing wheel events meant for this list. */}
          <div ref={listRef} className="max-h-56 overflow-y-auto p-1" onWheel={(e) => e.stopPropagation()}>
            {ALL_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                data-value={slot}
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm tabular-nums transition-colors',
                  slot === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { toMinutes as timeToMinutes, fromMinutes as minutesToTime };
