'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListOrdered, PhoneCall, Check, X, CalendarClock } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import type { QueueEntry, QueueStatus, Branch, Doctor, Appointment, PaginatedResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { IconTooltip } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface CheckInForm {
  patientId: string;
  branchId: string;
  doctorId: string;
  appointmentId: string;
  notes: string;
}

function emptyForm(): CheckInForm {
  return { patientId: '', branchId: '', doctorId: '', appointmentId: '', notes: '' };
}

function QueueColumn({
  title,
  entries,
  emptyLabel,
  children,
}: {
  title: string;
  entries: QueueEntry[];
  emptyLabel: string;
  children: (entry: QueueEntry) => React.ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div className="min-w-0 flex-1 space-y-2.5 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{entries.length}</span>
      </div>
      {entries.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const booked = !!entry.appointmentStartTime;
            return (
              <div key={entry._id} className="rounded-md border border-border bg-background p-2.5">
                <div className="flex items-center gap-2.5">
                  {booked ? (
                    <span className="flex h-6 shrink-0 items-center gap-1 rounded-sm bg-info/10 px-1.5 text-xs font-semibold tabular-nums text-info">
                      <CalendarClock className="h-3 w-3" />
                      {entry.appointmentStartTime}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {entry.queueNumber}
                    </span>
                  )}
                  <AvatarInitials name={entry.patientName ?? '?'} className="h-6 w-6 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{entry.patientName}</div>
                    {entry.doctorName && <div className="truncate text-xs text-muted-foreground">{entry.doctorName}</div>}
                  </div>
                  <Badge variant={booked ? 'info' : 'neutral'}>{booked ? t.queue.booked : t.queue.walkIn}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-end gap-1">{children(entry)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QueuePage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CheckInForm>(emptyForm());

  const { data: branches } = useQuery({ queryKey: ['branches'], queryFn: () => api.get<Branch[]>('/branches') });
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: () => api.get<Doctor[]>('/doctors') });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['queue'],
    queryFn: () => api.get<QueueEntry[]>('/queue'),
    refetchInterval: 15000,
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: patientAppointments } = useQuery({
    queryKey: ['appointments', 'for-checkin', form.patientId],
    queryFn: () => api.get<PaginatedResult<Appointment>>(`/appointments?patientId=${form.patientId}&date=${today}`),
    enabled: open && !!form.patientId,
  });
  const availableAppointments = (patientAppointments?.items ?? []).filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
  );

  const openCheckIn = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const selectAppointment = (appointmentId: string) => {
    if (appointmentId === 'none') {
      setForm((f) => ({ ...f, appointmentId: '' }));
      return;
    }
    const appt = availableAppointments.find((a) => a._id === appointmentId);
    setForm((f) => ({
      ...f,
      appointmentId,
      branchId: appt?.branchId ?? f.branchId,
      doctorId: appt?.doctorId ?? f.doctorId,
    }));
  };

  const checkInMutation = useMutation({
    mutationFn: () =>
      api.post<QueueEntry>('/queue', {
        patientId: form.patientId,
        branchId: form.branchId,
        doctorId: form.doctorId || undefined,
        appointmentId: form.appointmentId || undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      setOpen(false);
      toast.success(t.toasts.checkedIn);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : t.common.error),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) => api.patch<QueueEntry>(`/queue/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      toast.success(t.toasts.queueUpdated);
    },
    onError: () => toast.error(t.common.error),
  });

  const waiting = (entries ?? []).filter((e) => e.status === 'WAITING');
  const inProgress = (entries ?? []).filter((e) => e.status === 'IN_PROGRESS');
  const done = (entries ?? []).filter((e) => e.status === 'DONE' || e.status === 'CANCELLED');

  const canCheckIn = !!form.patientId && !!form.branchId;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.queue.title}</h1>
          <p className="text-sm text-muted-foreground">{t.queue.subtitle}</p>
        </div>
        <Button size="sm" onClick={openCheckIn}>
          <ListOrdered className="h-4 w-4" />
          {t.queue.checkIn}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row">
          <QueueColumn title={t.queue.waiting} entries={waiting} emptyLabel={t.queue.empty}>
            {(entry) => (
              <IconTooltip label={t.queue.callNext}>
                <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: entry._id, status: 'IN_PROGRESS' })}>
                  <PhoneCall className="h-3.5 w-3.5" />
                </Button>
              </IconTooltip>
            )}
          </QueueColumn>
          <QueueColumn title={t.queue.inProgress} entries={inProgress} emptyLabel={t.queue.empty}>
            {(entry) => (
              <>
                <IconTooltip label={t.queue.markDone}>
                  <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: entry._id, status: 'DONE' })}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </IconTooltip>
                <IconTooltip label={t.queue.cancel}>
                  <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate({ id: entry._id, status: 'CANCELLED' })}>
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </IconTooltip>
              </>
            )}
          </QueueColumn>
          <QueueColumn title={t.queue.done} entries={done} emptyLabel={t.queue.empty}>
            {() => null}
          </QueueColumn>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.queue.checkInTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.patients.title}</Label>
              <PatientCombobox
                value={form.patientId}
                onChange={(id) => setForm((f) => ({ ...emptyForm(), patientId: id }))}
              />
            </div>

            {form.patientId && (
              <div className="space-y-1.5">
                <Label>{t.queue.linkAppointment}</Label>
                <Select value={form.appointmentId || 'none'} onValueChange={selectAppointment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.queue.noAppointment}</SelectItem>
                    {availableAppointments.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.startTime} · {a.doctorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t.queue.branch}</Label>
                <Select
                  value={form.branchId}
                  onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
                  disabled={!!form.appointmentId}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(branches ?? []).map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t.queue.doctorOptional}</Label>
                <Select
                  value={form.doctorId || 'none'}
                  onValueChange={(v) => setForm((f) => ({ ...f, doctorId: v === 'none' ? '' : v }))}
                  disabled={!!form.appointmentId}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {(doctors ?? []).map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t.queue.notes}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="button" onClick={() => checkInMutation.mutate()} loading={checkInMutation.isPending} disabled={!canCheckIn}>
              {t.queue.checkIn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
