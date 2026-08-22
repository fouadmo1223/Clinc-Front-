'use client';

import * as React from 'react';
import { useLocale } from '@/lib/i18n/locale-context';
import type { WorkingHours } from '@/types/domain';
import { TimePicker } from '@/components/ui/time-picker';
import { Switch } from '@/components/ui/switch';

function defaultWeek(): WorkingHours[] {
  return Array.from({ length: 7 }, (_, day) => ({ day, openTime: '09:00', closeTime: '17:00', isClosed: false }));
}

export interface WorkingHoursEditorProps {
  value: WorkingHours[];
  onChange: (value: WorkingHours[]) => void;
}

/** Always renders/emits all 7 days (0=Sunday..6=Saturday), backfilling any missing day with sane defaults. */
export function WorkingHoursEditor({ value, onChange }: WorkingHoursEditorProps) {
  const { t } = useLocale();

  const week = React.useMemo(() => {
    const byDay = new Map(value.map((w) => [w.day, w]));
    return defaultWeek().map((fallback) => byDay.get(fallback.day) ?? fallback);
  }, [value]);

  const updateDay = (day: number, patch: Partial<WorkingHours>) => {
    const next = week.map((w) => (w.day === day ? { ...w, ...patch } : w));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {week.map((w) => (
        <div key={w.day} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
          <span className="w-24 shrink-0 text-sm font-medium">{t.schedule.days[w.day]}</span>
          <Switch
            checked={!w.isClosed}
            onCheckedChange={(checked: boolean) => updateDay(w.day, { isClosed: !checked })}
            aria-label={`${t.schedule.days[w.day]} ${t.schedule.closed}`}
          />
          {w.isClosed ? (
            <span className="text-sm text-muted-foreground">{t.schedule.closed}</span>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <TimePicker value={w.openTime} onChange={(v) => updateDay(w.day, { openTime: v })} className="w-28" />
              <span className="text-sm text-muted-foreground">—</span>
              <TimePicker value={w.closeTime} onChange={(v) => updateDay(w.day, { closeTime: v })} className="w-28" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
