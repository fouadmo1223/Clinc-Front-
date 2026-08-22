'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { toUtcDateString } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, CalendarClock, ClipboardList, UserPlus } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { ReportSummary } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';

function SummaryCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone?: 'success' | 'destructive' | 'primary' }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'destructive' ? 'text-destructive' : 'text-primary';
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary ${toneClass}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { t } = useLocale();
  const [from, setFrom] = React.useState(toUtcDateString(subDays(new Date(), 29)));
  const [to, setTo] = React.useState(toUtcDateString(new Date()));
  const [appliedRange, setAppliedRange] = React.useState({ from, to });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports-summary', appliedRange.from, appliedRange.to],
    queryFn: () => api.get<ReportSummary>(`/reports/summary?from=${appliedRange.from}&to=${appliedRange.to}`),
  });

  const maxRevenue = Math.max(1, ...(summary?.revenueByDay.map((d) => d.revenue) ?? [0]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.reports.title}</h1>
        <p className="text-sm text-muted-foreground">{t.reports.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <div className="space-y-1.5">
          <Label>{t.reports.from}</Label>
          <DatePicker value={from} onChange={setFrom} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label>{t.reports.to}</Label>
          <DatePicker value={to} onChange={setTo} className="w-40" />
        </div>
        <Button variant="secondary" onClick={() => setAppliedRange({ from, to })}>
          {t.reports.apply}
        </Button>
      </div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard icon={TrendingUp} label={t.reports.totalRevenue} value={summary.totalRevenue.toFixed(2)} tone="success" />
            <SummaryCard icon={TrendingDown} label={t.reports.totalExpenses} value={summary.totalExpenses.toFixed(2)} tone="destructive" />
            <SummaryCard icon={Wallet} label={t.reports.netIncome} value={summary.netIncome.toFixed(2)} tone={summary.netIncome >= 0 ? 'success' : 'destructive'} />
            <SummaryCard icon={CalendarClock} label={t.reports.appointmentsCount} value={String(summary.appointmentsCount)} />
            <SummaryCard icon={ClipboardList} label={t.reports.visitsCount} value={String(summary.visitsCount)} />
            <SummaryCard icon={UserPlus} label={t.reports.newPatientsCount} value={String(summary.newPatientsCount)} />
          </div>

          <Card>
            <CardContent className="py-4">
              <h2 className="mb-3 text-sm font-semibold">{t.reports.revenueByDay}</h2>
              {summary.revenueByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.reports.noData}</p>
              ) : (
                <div className="flex h-40 items-end gap-1">
                  {summary.revenueByDay.map((d) => (
                    <div key={d.date} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end">
                      <div
                        className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
                        style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                      />
                      <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
                        {d.date}: {d.revenue.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
