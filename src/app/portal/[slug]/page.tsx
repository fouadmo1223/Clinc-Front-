'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { LogOut, CalendarClock, ClipboardList, FileText, Stethoscope, Download, Plus, Pencil, Upload, CalendarX2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import type { Appointment, AppointmentStatus, Visit, ClinicDocument, PaginatedResult } from '@/types/domain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const STATUS_VARIANT: Record<AppointmentStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
};

interface OwnProfile {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

function EditProfileDialog({ patientId }: { patientId: string }) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [emergencyContactName, setEmergencyContactName] = React.useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = React.useState('');

  const { data: me } = useQuery({
    queryKey: ['portal', 'me'],
    queryFn: () => patientApi.get<OwnProfile>('/patient-portal/me'),
    enabled: open,
  });

  React.useEffect(() => {
    if (!me) return;
    setFullName(me.fullName ?? '');
    setEmail(me.email ?? '');
    setDateOfBirth(me.dateOfBirth ? me.dateOfBirth.slice(0, 10) : '');
    setAddress(me.address ?? '');
    setEmergencyContactName(me.emergencyContactName ?? '');
    setEmergencyContactPhone(me.emergencyContactPhone ?? '');
  }, [me]);

  const updateMutation = useMutation({
    mutationFn: () =>
      patientApi.patch('/patient-portal/me', {
        fullName,
        email: email || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: address || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
      }),
    onSuccess: () => {
      toast.success(t.portal.profileUpdated);
      queryClient.invalidateQueries({ queryKey: ['portal', 'me'] });
      setOpen(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" />
          {t.portal.editProfile}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.portal.editProfile}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullName">{t.patients.fullName}</Label>
            <Input id="edit-fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">{t.patients.email}</Label>
            <Input id="edit-email" type="email" dir="ltr" className="text-start" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-dob">{t.patients.dateOfBirth}</Label>
            <Input id="edit-dob" type="date" dir="ltr" className="text-start" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">{t.patients.address}</Label>
            <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-ecn">{t.patients.emergencyContactName}</Label>
              <Input id="edit-ecn" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-ecp">{t.patients.emergencyContactPhone}</Label>
              <Input id="edit-ecp" dir="ltr" className="text-start" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
            {t.portal.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelAppointmentDialog({ appointment, onCancelled }: { appointment: Appointment; onCancelled: () => void }) {
  const { t } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');

  const cancelMutation = useMutation({
    mutationFn: () => patientApi.post(`/patient-portal/appointments/${appointment._id}/cancel`, { reason: reason || undefined }),
    onSuccess: () => {
      toast.success(t.portal.appointmentCancelled);
      setOpen(false);
      onCancelled();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={t.appointments.cancelAction}>
          <CalendarX2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.appointments.cancelTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason">{t.appointments.cancelReason}</Label>
          <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t.appointments.keepAppointment}
          </Button>
          <Button type="button" variant="destructive" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
            {t.appointments.confirmCancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PatientPortalDashboardPage() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { accessToken, patient, hasHydrated, clear } = usePatientAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return patientApi.upload('/patient-portal/documents', formData);
    },
    onSuccess: () => {
      toast.success(t.portal.documentUploaded);
      queryClient.invalidateQueries({ queryKey: ['portal', 'documents'] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
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

  const refetchAppointments = () => queryClient.invalidateQueries({ queryKey: ['portal', 'appointments'] });

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
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
          <EditProfileDialog patientId={patient.id} />
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
                    <div className="flex items-center gap-1.5">
                      <Badge variant={STATUS_VARIANT[a.status]}>{t.appointments.statuses[a.status]}</Badge>
                      <Link href={`/portal/${params.slug}/book?doctorId=${a.doctorId}`}>
                        <Button type="button" variant="ghost" size="sm">
                          {t.appointments.reschedule}
                        </Button>
                      </Link>
                      <CancelAppointmentDialog appointment={a} onCancelled={refetchAppointments} />
                    </div>
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
            <CardTitle className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t.portal.documents}
              </span>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" />
              <Button type="button" variant="outline" size="sm" loading={uploadMutation.isPending} onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                {t.portal.uploadDocument}
              </Button>
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
