'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LogOut, CalendarClock, ClipboardList, FileText, Stethoscope, Download, Plus } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { patientApi } from '@/lib/patient-api';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import type { Appointment, AppointmentStatus, Visit, ClinicDocument, PaginatedResult } from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_VARIANT: Record<AppointmentStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
};

export default function PatientPortalDashboardPage() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { accessToken, patient, hasHydrated, clear } = usePatientAuthStore();

  React.useEffect(() => {
    if (hasHydrated && !accessToken) router.replace(`/portal/${params.slug}/login`);
  }, [hasHydrated, accessToken, params.slug, router]);

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: () => patientApi.get<PaginatedResult<Appointment>>('/patient-portal/appointments'),
    enabled: !!accessToken,
  });
  const { data: visits, isLoading: loadingVisits } = useQuery({
    queryKey: ['portal', 'visits'],
    queryFn: () => patientApi.get<PaginatedResult<Visit>>('/patient-portal/visits'),
    enabled: !!accessToken,
  });
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ['portal', 'documents'],
    queryFn: () => patientApi.get<ClinicDocument[]>('/patient-portal/documents'),
    enabled: !!accessToken,
  });

  if (!hasHydrated || !accessToken || !patient) return null;

  const today = new Date().toISOString().slice(0, 10);
  const items = appointments?.items ?? [];
  const upcoming = items.filter((a) => a.date >= today && a.status !== 'CANCELLED').sort((a, b) => a.date.localeCompare(b.date));
  const past = items.filter((a) => a.date < today || a.status === 'CANCELLED').sort((a, b) => b.date.localeCompare(a.date));

  const handleLogout = () => {
    clear();
    router.replace(`/portal/${params.slug}/login`);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2" title={t.portal.backToSite}>
          <Stethoscope className="h-4.5 w-4.5 text-primary" />
          <span className="text-sm font-semibold">{patient.clinicName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            {t.common.language}
          </button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" />
            {t.portal.logout}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{t.portal.welcome(patient.fullName.split(' ')[0])}</h1>
          <Link href={`/portal/${params.slug}/book`}>
            <Button type="button" size="sm">
              <Plus className="h-3.5 w-3.5" />
              {t.portal.bookAppointment}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4" />
              {t.portal.upcomingAppointments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAppointments ? (
              <Skeleton className="h-16" />
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.portal.noUpcomingAppointments}</p>
            ) : (
              <div className="divide-y divide-border">
                {upcoming.map((a) => (
                  <div key={a._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">
                        {a.date} · {a.startTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.portal.with} {a.doctorName}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[a.status]}>{t.appointments.statuses[a.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4" />
              {t.portal.visits}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVisits ? (
              <Skeleton className="h-16" />
            ) : !visits || visits.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.portal.noVisits}</p>
            ) : (
              <div className="divide-y divide-border">
                {visits.items.map((v) => (
                  <div key={v._id} className="space-y-1 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {v.date} · {t.portal.with} {v.doctorName}
                      </p>
                    </div>
                    {v.diagnosis && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{t.portal.diagnosis}:</span> {v.diagnosis}
                      </p>
                    )}
                    {v.treatmentPlan && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{t.portal.treatmentPlan}:</span> {v.treatmentPlan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {t.portal.documents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDocuments ? (
              <Skeleton className="h-16" />
            ) : !documents || documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.portal.noDocuments}</p>
            ) : (
              <div className="divide-y divide-border">
                {documents.map((d) => (
                  <div key={d._id} className="flex items-center justify-between gap-3 py-2.5">
                    <p className="min-w-0 truncate text-sm font-medium">{d.fileName}</p>
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="ghost" size="sm" aria-label={t.portal.download}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {past.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t.portal.pastAppointments}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {past.map((a) => (
                  <div key={a._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">
                        {a.date} · {a.startTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.portal.with} {a.doctorName}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[a.status]}>{t.appointments.statuses[a.status]}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
