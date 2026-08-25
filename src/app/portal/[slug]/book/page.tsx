'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Stethoscope } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { toUtcDateString } from '@/lib/utils';
import type { Doctor, Branch, AvailabilityResult, Appointment } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function PatientPortalBookPage() {
  return (
    <React.Suspense fallback={null}>
      <PatientPortalBookPageInner />
    </React.Suspense>
  );
}

function PatientPortalBookPageInner() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { accessToken, hasHydrated } = usePatientAuthStore();
  const BackIcon = locale === 'ar' ? ArrowRight : ArrowLeft;

  const [selectedDoctorId, setSelectedDoctorId] = React.useState(searchParams.get('doctorId') ?? '');
  const doctorId = selectedDoctorId;
  const [branchId, setBranchId] = React.useState('');
  const [date, setDate] = React.useState(toUtcDateString(new Date()));
  const [startTime, setStartTime] = React.useState('');
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace(`/portal/${params.slug}/login?next=/portal/${params.slug}/book?doctorId=${doctorId}`);
    }
  }, [hasHydrated, accessToken, params.slug, doctorId, router]);

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['portal', 'doctors'],
    queryFn: () => patientApi.get<Doctor[]>('/patient-portal/doctors'),
    enabled: !!accessToken,
  });
  const doctor = doctors?.find((d) => d._id === doctorId);

  const { data: branches } = useQuery({
    queryKey: ['portal', 'branches'],
    queryFn: () => patientApi.get<Branch[]>('/patient-portal/branches'),
    enabled: !!accessToken,
  });
  const branchName = (id: string) => branches?.find((b) => b._id === id)?.name ?? id;

  React.useEffect(() => {
    setBranchId(doctor && doctor.branchIds.length > 0 ? doctor.branchIds[0] : '');
  }, [doctor?._id]);

  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ['portal', 'availability', doctorId, branchId, date],
    queryFn: () =>
      patientApi.get<AvailabilityResult>(
        `/patient-portal/availability?doctorId=${doctorId}&branchId=${branchId}&date=${date}`,
      ),
    enabled: !!accessToken && !!doctorId && !!branchId && !!date,
  });

  React.useEffect(() => setStartTime(''), [branchId, date]);

  const bookMutation = useMutation({
    mutationFn: () =>
      patientApi.post<Appointment>('/patient-portal/appointments', {
        doctorId,
        branchId,
        date,
        startTime,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      toast.success(t.portal.bookingConfirmed);
      router.push(`/portal/${params.slug}`);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  if (!hasHydrated || !accessToken) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Stethoscope className="h-4 w-4" />
          {t.portal.backToSite}
        </Link>
        <button
          type="button"
          onClick={() => router.push(`/portal/${params.slug}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="h-4 w-4" />
          {t.portal.backToDashboard}
        </button>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <h1 className="text-lg font-semibold tracking-tight">{t.portal.bookAppointment}</h1>

        {loadingDoctors ? (
          <Skeleton className="h-64" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {doctor ? `${doctor.fullName} · ${locale === 'ar' ? doctor.specialtyAr : doctor.specialty}` : t.portal.bookAppointment}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!searchParams.get('doctorId') && (
                <div className="space-y-1.5">
                  <Label>{t.doctors.title}</Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(doctors ?? []).map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {doctor && (
                <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.portal.selectBranch}</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {doctor.branchIds.map((bId) => (
                        <SelectItem key={bId} value={bId}>
                          {branchName(bId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t.portal.selectDate}</Label>
                  <DatePicker value={date} onChange={setDate} minDate={new Date()} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t.portal.selectTime}</Label>
                {loadingAvailability ? (
                  <Skeleton className="h-20" />
                ) : !availability || availability.slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.portal.noSlotsAvailable}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availability.slots.map((s) => (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setStartTime(s.start)}
                        className={`rounded-md border px-2 py-1.5 text-xs font-medium tabular-nums transition-colors ${
                          startTime === s.start
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-surface hover:bg-secondary'
                        }`}
                      >
                        {s.start}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t.portal.reasonOptional}</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.portal.reasonPlaceholder} />
              </div>

              <Button
                type="button"
                className="w-full"
                loading={bookMutation.isPending}
                disabled={!startTime}
                onClick={() => bookMutation.mutate()}
              >
                {t.portal.confirmBooking}
              </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
