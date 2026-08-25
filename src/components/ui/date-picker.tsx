'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n/locale-context';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Days before this one render disabled and can't be picked — e.g. `new Date()` for a booking flow where the past isn't a valid appointment date. */
  minDate?: Date;
}

const WEEKDAY_LABELS = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  ar: ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'],
};

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => format(new Date(2020, i, 1), 'MMMM'));

/** Wide enough to cover both future booking dates and a patient's date of birth. */
function yearOptions(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 10; y >= current - 120; y--) years.push(y);
  return years;
}

export function DatePicker({ value, onChange, id, className, disabled, minDate }: DatePickerProps) {
  const { locale } = useLocale();
  const [open, setOpen] = React.useState(false);
  const selected = value ? parseISO(value) : undefined;
  const [viewMonth, setViewMonth] = React.useState(selected ?? new Date());

  React.useEffect(() => {
    if (open) setViewMonth(selected ?? new Date());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const gridStart = startOfWeek(startOfMonth(viewMonth));
  const gridEnd = endOfWeek(endOfMonth(viewMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const years = React.useMemo(() => yearOptions(), []);

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
          <span className={cn('tabular-nums', !value && 'text-muted-foreground')}>
            {value ? format(parseISO(value), 'dd/MM/yyyy') : 'dd/mm/yyyy'}
          </span>
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-64 rounded-lg border border-border bg-surface p-3 shadow-popover data-[state=open]:animate-dialog-in"
        >
          <div className="mb-2 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>

            <div className="flex min-w-0 items-center gap-1">
              <select
                aria-label={locale === 'ar' ? 'الشهر' : 'Month'}
                value={viewMonth.getMonth()}
                onChange={(e) => setViewMonth((m) => new Date(m.getFullYear(), Number(e.target.value), 1))}
                className="min-w-0 rounded-md bg-transparent px-1 py-0.5 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              {/* Direct year selection — jumping years shouldn't require stepping through every month. */}
              <select
                aria-label={locale === 'ar' ? 'السنة' : 'Year'}
                value={viewMonth.getFullYear()}
                onChange={(e) => setViewMonth((m) => new Date(Number(e.target.value), m.getMonth(), 1))}
                className="rounded-md bg-transparent px-1 py-0.5 text-sm font-medium tabular-nums hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAY_LABELS[locale].map((d) => (
              <span key={d} className="text-[11px] font-medium text-muted-foreground">
                {d}
              </span>
            ))}
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const active = selected && isSameDay(day, selected);
              const todayFlag = isToday(day);
              const tooEarly = minDate && isBefore(startOfDay(day), startOfDay(minDate));
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={tooEarly}
                  onClick={() => {
                    onChange(format(day, 'yyyy-MM-dd'));
                    setOpen(false);
                  }}
                  className={cn(
                    'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs tabular-nums transition-colors',
                    !inMonth && 'text-muted-foreground/40',
                    inMonth && !active && 'text-foreground hover:bg-secondary',
                    active && 'bg-primary text-primary-foreground',
                    !active && todayFlag && 'ring-1 ring-inset ring-primary/50',
                    tooEarly && 'cursor-not-allowed text-muted-foreground/25 hover:bg-transparent',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {locale === 'ar' ? 'مسح' : 'Clear'}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(format(new Date(), 'yyyy-MM-dd'));
                setOpen(false);
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              {locale === 'ar' ? 'اليوم' : 'Today'}
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
