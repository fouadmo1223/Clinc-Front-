'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowLeft, Plus, Trash2, CalendarClock, Coffee } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { Doctor, Branch, DoctorScheduleEntry, ScheduleException, ScheduleExceptionType, AvailabilityResult } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/hooks/use-toast';

interface DayState {
  dayOfWeek: number;
  isClosed: boolean;
  startTime: string;
  endTime: string;
  breaks: { startTime: string; endTime: string }[];
}

function defaultDays(): DayState[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: true,
    startTime: '09:00',
    endTime: '17:00',
    breaks: [],
  }));
}

const EXCEPTION_TYPES: ScheduleExceptionType[] = [
  'FULL_DAY_LEAVE',
  'HOLIDAY',
  'EMERGENCY_CLOSURE',
  'PARTIAL_DAY_LEAVE',
  'CUSTOM_HOURS',
  'EXTRA_HOURS',
  'BLOCKED_TIME',
];
const RANGE_TYPES = new Set(['PARTIAL_DAY_LEAVE', 'CUSTOM_HOURS', 'EXTRA_HOURS', 'BLOCKED_TIME']);

export default function DoctorSchedulePage() {
  const { t, dir } = useLocale();
  const { id: doctorId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [branchId, setBranchId] = React.useState<string>('');
  const [days, setDays] = React.useState<DayState[]>(defaultDays());
  const [exceptionOpen, setExceptionOpen] = React.useState(false);
  const [previewDate, setPreviewDate] = React.useState('');
  const [previewDuration, setPreviewDuration] = React.useState('');
  const [previewResult, setPreviewResult] = React.useState<AvailabilityResult | null>(null);

  const { data: doctor } = useQuery({
    queryKey: ['doctors', doctorId],
    queryFn: () => api.get<Doctor>(`/doctors/${doctorId}`),
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get<Branch[]>('/branches'),
  });

  const doctorBranches = React.useMemo(
    () => (branches ?? []).filter((b) => doctor?.branchIds.includes(b._id)),
    [branches, doctor],
  );

  React.useEffect(() => {
    if (!branchId && doctorBranches.length > 0) setBranchId(doctorBranches[0]._id);
  }, [doctorBranches, branchId]);

  const { data: scheduleEntries, isLoading: scheduleLoading } = useQuery({
    queryKey: ['doctor-schedule', doctorId, branchId],
    queryFn: () => api.get<DoctorScheduleEntry[]>(`/doctors/${doctorId}/schedule?branchId=${branchId}`),
    enabled: !!branchId,
  });

  React.useEffect(() => {
    if (!scheduleEntries) return;
    const next = defaultDays();
    for (const entry of scheduleEntries) {
      next[entry.dayOfWeek] = {
        dayOfWeek: entry.dayOfWeek,
        isClosed: entry.isClosed,
        startTime: entry.startTime,
        endTime: entry.endTime,
        breaks: entry.breaks,
      };
    }
    setDays(next);
  }, [scheduleEntries]);

  const { data: exceptions } = useQuery({
    queryKey: ['schedule-exceptions', doctorId, branchId],
    queryFn: () => api.get<ScheduleException[]>(`/schedule-exceptions?doctorId=${doctorId}&branchId=${branchId}`),
    enabled: !!branchId,
  });

  const saveScheduleMutation = useMutation({
    mutationFn: () =>
      api.put(`/doctors/${doctorId}/schedule?branchId=${branchId}`, {
        days: days.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          isClosed: d.isClosed,
          startTime: d.startTime,
          endTime: d.endTime,
          breaks: d.isClosed ? [] : d.breaks,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', doctorId, branchId] });
      toast.success(t.toasts.scheduleSaved);
    },
    onError: () => toast.error(t.common.error),
  });

  const [exceptionForm, setExceptionForm] = React.useState<{
    date: string;
    type: ScheduleExceptionType;
    startTime: string;
    endTime: string;
    reason: string;
  }>({ date: '', type: 'FULL_DAY_LEAVE', startTime: '09:00', endTime: '17:00', reason: '' });

  const createExceptionMutation = useMutation({
    mutationFn: () =>
      api.post('/schedule-exceptions', {
        doctorId,
        branchId,
        date: exceptionForm.date,
        type: exceptionForm.type,
        ...(RANGE_TYPES.has(exceptionForm.type)
          ? { startTime: exceptionForm.startTime, endTime: exceptionForm.endTime }
          : {}),
        reason: exceptionForm.reason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-exceptions', doctorId, branchId] });
      setExceptionOpen(false);
      toast.success(t.toasts.exceptionAdded);
    },
    onError: () => toast.error(t.common.error),
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/schedule-exceptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-exceptions', doctorId, branchId] });
      toast.success(t.toasts.exceptionDeleted);
    },
    onError: () => toast.error(t.common.error),
  });

  const checkAvailability = async () => {
    if (!previewDate) return;
    const url = `/availability?doctorId=${doctorId}&branchId=${branchId}&date=${previewDate}${previewDuration ? `&durationMinutes=${previewDuration}` : ''}`;
    const result = await api.get<AvailabilityResult>(url);
    setPreviewResult(result);
  };

  const updateDay = (dayOfWeek: number, patch: Partial<DayState>) => {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
  };

  if (!doctor) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="h-3.5 w-3.5" />
          {t.schedule.backToDoctors}
        </Link>
      </div>

      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {doctor.fullName} · {t.schedule.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.schedule.subtitle}</p>
      </div>

      {doctorBranches.length > 1 && (
        <div className="max-w-xs space-y-1.5">
          <Label>{t.schedule.branch}</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {doctorBranches.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.schedule.weeklyHours}</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.dayOfWeek} className="rounded-md border border-border p-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <label className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={!day.isClosed}
                        onChange={(e) => updateDay(day.dayOfWeek, { isClosed: !e.target.checked })}
                      />
                      {t.schedule.days[day.dayOfWeek]}
                    </label>
                    {day.isClosed ? (
                      <span className="text-sm text-muted-foreground">{t.schedule.closed}</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <TimePicker
                          value={day.startTime}
                          onChange={(v) => updateDay(day.dayOfWeek, { startTime: v })}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">–</span>
                        <TimePicker
                          value={day.endTime}
                          onChange={(v) => updateDay(day.dayOfWeek, { endTime: v })}
                          className="w-28"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateDay(day.dayOfWeek, {
                              breaks: [...day.breaks, { startTime: '13:00', endTime: '13:30' }],
                            })
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t.schedule.addBreak}
                        </Button>
                      </div>
                    )}
                  </div>

                  {!day.isClosed && day.breaks.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-dashed border-border pt-3">
                      {day.breaks.map((brk, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-2.5 rounded-md border border-warning/20 bg-warning/5 py-2 ps-2.5 pe-1.5 text-sm"
                        >
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning">
                            <Coffee className="h-3 w-3" strokeWidth={2} />
                            {t.schedule.breakLabel}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <TimePicker
                              value={brk.startTime}
                              onChange={(v) => {
                                const nextBreaks = [...day.breaks];
                                nextBreaks[idx] = { ...nextBreaks[idx], startTime: v };
                                updateDay(day.dayOfWeek, { breaks: nextBreaks });
                              }}
                              className="w-24 bg-surface"
                            />
                            <span className="text-muted-foreground">–</span>
                            <TimePicker
                              value={brk.endTime}
                              onChange={(v) => {
                                const nextBreaks = [...day.breaks];
                                nextBreaks[idx] = { ...nextBreaks[idx], endTime: v };
                                updateDay(day.dayOfWeek, { breaks: nextBreaks });
                              }}
                              className="w-24 bg-surface"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateDay(day.dayOfWeek, { breaks: day.breaks.filter((_, i) => i !== idx) })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                onClick={() => saveScheduleMutation.mutate()}
                loading={saveScheduleMutation.isPending}
                disabled={!branchId}
              >
                {t.schedule.save}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">{t.schedule.exceptions}</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => setExceptionOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            {t.schedule.addException}
          </Button>
        </CardHeader>
        <CardContent>
          {!exceptions || exceptions.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">{t.schedule.exceptionEmpty}</p>
          ) : (
            <div className="space-y-2">
              {exceptions.map((exception) => (
                <div
                  key={exception._id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums font-medium">
                      {new Date(exception.date).toLocaleDateString()}
                    </span>
                    <Badge variant="warning">{t.schedule.types[exception.type]}</Badge>
                    {exception.startTime && (
                      <span className="tabular-nums text-muted-foreground">
                        {exception.startTime}–{exception.endTime}
                      </span>
                    )}
                    {exception.reason && <span className="text-muted-foreground">{exception.reason}</span>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExceptionMutation.mutate(exception._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.schedule.availabilityPreview}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-start gap-4">
            <div className="space-y-1.5">
              <Label>{t.schedule.checkDate}</Label>
              <DatePicker value={previewDate} onChange={setPreviewDate} className="w-40" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="space-y-1.5">
                <Label>{t.schedule.duration}</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  placeholder={String(doctor.defaultAppointmentDurationMinutes)}
                  value={previewDuration}
                  onChange={(e) => setPreviewDuration(e.target.value)}
                  className="w-36"
                />
              </div>
              <Button type="button" variant="secondary" onClick={checkAvailability} disabled={!previewDate}>
                {t.schedule.check}
              </Button>
            </div>
          </div>

          {previewResult && (
            <div className="mt-4">
              {previewResult.isFullyClosed ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  {t.schedule.fullyClosed}
                  {previewResult.closureReason ? ` — ${previewResult.closureReason}` : ''}
                </p>
              ) : previewResult.slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.schedule.noSlots}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {previewResult.slots.map((slot) => (
                    <span
                      key={slot.start}
                      className="rounded-md border border-border px-2 py-1 text-xs tabular-nums text-foreground"
                    >
                      {slot.start}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      </div>

      <Dialog open={exceptionOpen} onOpenChange={setExceptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.schedule.addException}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.schedule.exceptionDate}</Label>
              <DatePicker
                value={exceptionForm.date}
                onChange={(v) => setExceptionForm((f) => ({ ...f, date: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.schedule.exceptionType}</Label>
              <Select
                value={exceptionForm.type}
                onValueChange={(v) => setExceptionForm((f) => ({ ...f, type: v as ScheduleExceptionType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXCEPTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t.schedule.types[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {RANGE_TYPES.has(exceptionForm.type) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.schedule.startTime}</Label>
                  <TimePicker
                    value={exceptionForm.startTime}
                    onChange={(v) => setExceptionForm((f) => ({ ...f, startTime: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.schedule.endTime}</Label>
                  <TimePicker
                    value={exceptionForm.endTime}
                    onChange={(v) => setExceptionForm((f) => ({ ...f, endTime: v }))}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{t.schedule.exceptionReason}</Label>
              <Input
                value={exceptionForm.reason}
                onChange={(e) => setExceptionForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExceptionOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => createExceptionMutation.mutate()}
              loading={createExceptionMutation.isPending}
              disabled={!exceptionForm.date}
            >
              {t.common.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
