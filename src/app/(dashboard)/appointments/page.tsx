'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, CalendarClock, Clock, X, CheckCircle2, UserX } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type {
  Appointment,
  AppointmentStatus,
  Branch,
  Doctor,
  Patient,
  PaginatedResult,
  VisitType,
  AvailabilityResult,
} from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<AppointmentStatus, 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  NO_SHOW: 'warning',
};

interface BookingForm {
  patientId: string;
  patient: Patient | null;
  doctorId: string;
  branchId: string;
  date: string;
  startTime: string;
  durationMinutes: string;
  visitType: VisitType;
  reason: string;
  notes: string;
}

function emptyBooking(defaultDate: string): BookingForm {
  return {
    patientId: '',
    patient: null,
    doctorId: '',
    branchId: '',
    date: defaultDate,
    startTime: '',
    durationMinutes: '',
    visitType: 'CONSULTATION',
    reason: '',
    notes: '',
  };
}

export default function AppointmentsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = React.useState(today);
  const [doctorFilter, setDoctorFilter] = React.useState<string>('all');
  const [branchFilter, setBranchFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [bookOpen, setBookOpen] = React.useState(false);
  const [booking, setBooking] = React.useState<BookingForm>(emptyBooking(today));
  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get<Doctor[]>('/doctors'),
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get<Branch[]>('/branches'),
  });

  const listParams = new URLSearchParams({ date: selectedDate });
  if (doctorFilter !== 'all') listParams.set('doctorId', doctorFilter);
  if (branchFilter !== 'all') listParams.set('branchId', branchFilter);
  if (statusFilter !== 'all') listParams.set('status', statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', selectedDate, doctorFilter, branchFilter, statusFilter],
    queryFn: () => api.get<PaginatedResult<Appointment>>(`/appointments?${listParams.toString()}`),
  });
  const appointments = data?.items ?? [];

  const bookingDoctor = React.useMemo(() => doctors?.find((d) => d._id === booking.doctorId), [doctors, booking.doctorId]);
  const bookingDoctorBranches = React.useMemo(
    () => (branches ?? []).filter((b) => bookingDoctor?.branchIds.includes(b._id)),
    [branches, bookingDoctor],
  );

  React.useEffect(() => {
    if (bookingDoctorBranches.length === 1 && !booking.branchId) {
      setBooking((f) => ({ ...f, branchId: bookingDoctorBranches[0]._id }));
    }
  }, [bookingDoctorBranches, booking.branchId]);

  const canCheckSlots = !!booking.doctorId && !!booking.branchId && !!booking.date;
  const { data: availability, isFetching: slotsLoading } = useQuery({
    queryKey: ['availability', booking.doctorId, booking.branchId, booking.date, booking.durationMinutes],
    queryFn: () =>
      api.get<AvailabilityResult>(
        `/availability?doctorId=${booking.doctorId}&branchId=${booking.branchId}&date=${booking.date}${
          booking.durationMinutes ? `&durationMinutes=${booking.durationMinutes}` : ''
        }`,
      ),
    enabled: bookOpen && canCheckSlots,
  });

  const openBooking = () => {
    setBooking(emptyBooking(selectedDate));
    setBookOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Appointment>('/appointments', {
        patientId: booking.patientId,
        doctorId: booking.doctorId,
        branchId: booking.branchId,
        date: booking.date,
        startTime: booking.startTime,
        durationMinutes: booking.durationMinutes ? Number(booking.durationMinutes) : undefined,
        visitType: booking.visitType,
        reason: booking.reason || undefined,
        notes: booking.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBookOpen(false);
      toast.success(t.toasts.appointmentBooked);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) => api.patch<Appointment>(`/appointments/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(t.toasts.appointmentUpdated);
    },
    onError: () => toast.error(t.common.error),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.delete<Appointment>(`/appointments/${cancelTarget!._id}`, { body: JSON.stringify({ reason: cancelReason || undefined }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCancelTarget(null);
      setCancelReason('');
      toast.success(t.toasts.appointmentCancelled);
    },
    onError: () => toast.error(t.common.error),
  });

  const canBook = !!booking.patientId && !!booking.doctorId && !!booking.branchId && !!booking.date && !!booking.startTime;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.appointments.title}</h1>
          <p className="text-sm text-muted-foreground">{t.appointments.subtitle}</p>
        </div>
        <Button size="sm" onClick={openBooking}>
          <Plus className="h-4 w-4" />
          {t.appointments.book}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DatePicker value={selectedDate} onChange={(v) => setSelectedDate(v || today)} className="w-40" />
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(today)}>
          {t.appointments.today}
        </Button>

        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.appointments.allDoctors}</SelectItem>
            {(doctors ?? []).map((d) => (
              <SelectItem key={d._id} value={d._id}>{d.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.appointments.allBranches}</SelectItem>
            {(branches ?? []).map((b) => (
              <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.appointments.allStatuses}</SelectItem>
            {(Object.keys(t.appointments.statuses) as AppointmentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{t.appointments.statuses[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <CalendarClock className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.appointments.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.appointments.time}</th>
                <th>{t.appointments.patient}</th>
                <th>{t.appointments.doctor}</th>
                <th>{t.appointments.visitType}</th>
                <th>{t.appointments.status}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td className="tabular-nums font-medium">
                    <span dir="ltr">{appt.startTime}–{appt.endTime}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={appt.patientName ?? '?'} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{appt.patientName}</div>
                        <div dir="ltr" className="text-xs text-muted-foreground">{appt.patientPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{appt.doctorName}</td>
                  <td className="text-muted-foreground">{t.appointments.visitTypes[appt.visitType]}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[appt.status]}>{t.appointments.statuses[appt.status]}</Badge>
                  </td>
                  <td>
                    {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && appt.status !== 'NO_SHOW' && (
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {appt.status === 'SCHEDULED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t.appointments.markConfirmed}
                            onClick={() => statusMutation.mutate({ id: appt._id, status: 'CONFIRMED' })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t.appointments.markCompleted}
                          onClick={() => statusMutation.mutate({ id: appt._id, status: 'COMPLETED' })}
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t.appointments.markNoShow}
                          onClick={() => statusMutation.mutate({ id: appt._id, status: 'NO_SHOW' })}
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={t.appointments.cancelAction}
                          onClick={() => setCancelTarget(appt)}
                        >
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.appointments.bookTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.appointments.patient}</Label>
              <PatientCombobox
                value={booking.patientId}
                onChange={(id, patient) => setBooking((f) => ({ ...f, patientId: id, patient }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.appointments.doctor}</Label>
                <Select
                  value={booking.doctorId}
                  onValueChange={(v) => setBooking((f) => ({ ...f, doctorId: v, branchId: '', startTime: '' }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(doctors ?? []).map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.appointments.branch}</Label>
                <Select
                  value={booking.branchId}
                  onValueChange={(v) => setBooking((f) => ({ ...f, branchId: v, startTime: '' }))}
                  disabled={!booking.doctorId}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bookingDoctorBranches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.appointments.date}</Label>
                <DatePicker
                  value={booking.date}
                  onChange={(v) => setBooking((f) => ({ ...f, date: v, startTime: '' }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.appointments.duration}</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  placeholder={bookingDoctor ? String(bookingDoctor.defaultAppointmentDurationMinutes) : undefined}
                  value={booking.durationMinutes}
                  onChange={(e) => setBooking((f) => ({ ...f, durationMinutes: e.target.value, startTime: '' }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.appointments.time}</Label>
              {!canCheckSlots ? (
                <p className="text-sm text-muted-foreground">{t.appointments.selectDoctorFirst}</p>
              ) : slotsLoading ? (
                <p className="text-sm text-muted-foreground">{t.common.loading}</p>
              ) : availability?.isFullyClosed ? (
                <p className="text-sm text-muted-foreground">
                  {t.schedule.fullyClosed}
                  {availability.closureReason ? ` — ${availability.closureReason}` : ''}
                </p>
              ) : !availability || availability.slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.appointments.noSlots}</p>
              ) : (
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                  {availability.slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setBooking((f) => ({ ...f, startTime: slot.start }))}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs tabular-nums transition-colors',
                        booking.startTime === slot.start
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:bg-secondary',
                      )}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{t.appointments.visitType}</Label>
              <Select
                value={booking.visitType}
                onValueChange={(v) => setBooking((f) => ({ ...f, visitType: v as VisitType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTATION">{t.appointments.visitTypes.CONSULTATION}</SelectItem>
                  <SelectItem value="FOLLOW_UP">{t.appointments.visitTypes.FOLLOW_UP}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{t.appointments.reason}</Label>
              <Input value={booking.reason} onChange={(e) => setBooking((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.appointments.notes}</Label>
              <Textarea value={booking.notes} onChange={(e) => setBooking((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBookOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!canBook}
            >
              {t.appointments.book}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.appointments.cancelTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t.appointments.cancelReason}</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelTarget(null)}>
              {t.appointments.keepAppointment}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              loading={cancelMutation.isPending}
            >
              {t.appointments.confirmCancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
