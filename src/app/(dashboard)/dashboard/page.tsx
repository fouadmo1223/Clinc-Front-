'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { CalendarClock, Users, Wallet, ClipboardCheck, Clock } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus, QueueEntry, ReportSummary, PaginatedResult, Visit } from '@/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_VARIANT: Record<AppointmentStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
};

function KpiCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone?: 'success' | 'primary' }) {
  const toneClass = tone === 'success' ? 'text-success' : 'text-primary';
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

export default function DashboardOverviewPage() {
  const { user, isReady } = useRequireAuth();
  const { t } = useLocale();

  const today = format(new Date(), 'yyyy-MM-dd');
  const monthAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd');

  const { data: todayAppointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['dashboard', 'appointments-today', today],
    queryFn: () => api.get<PaginatedResult<Appointment>>(`/appointments?date=${today}&limit=100`),
    enabled: isReady,
  });

  const { data: queueToday, isLoading: loadingQueue } = useQuery({
    queryKey: ['dashboard', 'queue-today', today],
    queryFn: () => api.get<QueueEntry[]>(`/queue?date=${today}`),
    enabled: isReady,
  });

  const { data: visitsToday, isLoading: loadingVisits } = useQuery({
    queryKey: ['dashboard', 'visits-today', today],
    queryFn: () => api.get<PaginatedResult<Visit>>(`/visits?from=${today}&to=${today}&limit=100`),
    enabled: isReady,
  });

  const { data: todaySummary, isLoading: loadingTodaySummary } = useQuery({
    queryKey: ['dashboard', 'summary-today', today],
    queryFn: () => api.get<ReportSummary>(`/reports/summary?from=${today}&to=${today}`),
    enabled: isReady,
  });

  const { data: monthSummary, isLoading: loadingMonthSummary } = useQuery({
    queryKey: ['dashboard', 'summary-30d', monthAgo, today],
    queryFn: () => api.get<ReportSummary>(`/reports/summary?from=${monthAgo}&to=${today}`),
    enabled: isReady,
  });

  if (!isReady || !user) return null;

  const waitingCount = queueToday?.filter((q) => q.status === 'WAITING').length ?? 0;
  const completedVisitsToday = visitsToday?.items.filter((v) => v.status === 'COMPLETED').length ?? 0;
  const upcomingToday = [...(todayAppointments?.items ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const maxRevenue = Math.max(1, ...(monthSummary?.revenueByDay.map((d) => d.revenue) ?? [0]));

  const kpisLoading = loadingAppointments || loadingQueue || loadingVisits || loadingTodaySummary;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.dashboard.greeting(user.fullName.split(' ')[0])}</h1>
        <p className="text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      {kpisLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard icon={CalendarClock} label={t.dashboard.todayAppointments} value={String(todayAppointments?.total ?? 0)} />
          <KpiCard icon={Users} label={t.dashboard.patientsWaiting} value={String(waitingCount)} />
          <KpiCard icon={Wallet} label={t.dashboard.todayRevenue} value={(todaySummary?.totalRevenue ?? 0).toFixed(2)} tone="success" />
          <KpiCard icon={ClipboardCheck} label={t.dashboard.completedVisitsToday} value={String(completedVisitsToday)} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Card>
          <CardContent className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t.dashboard.todaysSchedule}</h2>
              <Link href="/appointments" className="text-xs font-medium text-primary hover:underline">
                {t.dashboard.viewAllAppointments}
              </Link>
            </div>
            {loadingAppointments ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-11" />
                ))}
              </div>
            ) : upcomingToday.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">{t.dashboard.noAppointmentsToday}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingToday.map((appt) => (
                  <div key={appt._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-sm font-medium tabular-nums">{appt.startTime}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{appt.patientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{appt.doctorName}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[appt.status]}>{t.appointments.statuses[appt.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t.dashboard.last30Days}</h2>
              <Link href="/reports" className="text-xs font-medium text-primary hover:underline">
                {t.dashboard.viewFullReport}
              </Link>
            </div>
            {loadingMonthSummary || !monthSummary ? (
              <Skeleton className="h-40" />
            ) : (
              <>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.reports.totalRevenue}</p>
                    <p className="text-sm font-semibold tabular-nums text-success">{monthSummary.totalRevenue.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.reports.totalExpenses}</p>
                    <p className="text-sm font-semibold tabular-nums text-destructive">{monthSummary.totalExpenses.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.reports.netIncome}</p>
                    <p className={`text-sm font-semibold tabular-nums ${monthSummary.netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {monthSummary.netIncome.toFixed(0)}
                    </p>
                  </div>
                </div>
                {monthSummary.revenueByDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.reports.noData}</p>
                ) : (
                  <div className="flex h-24 items-end gap-0.5">
                    {monthSummary.revenueByDay.map((d) => (
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
