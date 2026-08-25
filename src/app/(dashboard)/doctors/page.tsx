'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Stethoscope, CalendarClock } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Doctor, Branch } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/layout/table-skeleton';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';
import { toast } from '@/hooks/use-toast';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    fullName: z.string().min(2, t.common.minLength(2)),
    specialty: z.string().min(2, t.common.minLength(2)),
    specialtyAr: z.string().min(2, t.common.minLength(2)),
    phone: z.string().min(6, t.common.minLength(6)),
    email: z.string().email(t.common.invalidEmail),
    bio: z.string().optional(),
    consultationPrice: z.coerce.number().min(0),
    followUpPrice: z.coerce.number().min(0),
    defaultAppointmentDurationMinutes: z.coerce.number().min(5).optional(),
    branchIds: z.array(z.string()).min(1, t.common.selectAtLeastOne),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function DoctorsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission('doctors.manage');
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Doctor | null>(null);
  const createSchema = React.useMemo(() => buildSchema(t), [t]);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get<Doctor[]>('/doctors?includeInactive=true'),
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get<Branch[]>('/branches'),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({
      fullName: '',
      specialty: '',
      specialtyAr: '',
      phone: '',
      email: '',
      bio: '',
      consultationPrice: 0,
      followUpPrice: 0,
      defaultAppointmentDurationMinutes: 20,
      branchIds: [],
    });
    setOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditing(doctor);
    reset({
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      specialtyAr: doctor.specialtyAr,
      phone: doctor.phone,
      email: doctor.email,
      bio: doctor.bio ?? '',
      consultationPrice: doctor.consultationPrice,
      followUpPrice: doctor.followUpPrice,
      defaultAppointmentDurationMinutes: doctor.defaultAppointmentDurationMinutes,
      branchIds: doctor.branchIds,
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => api.post<Doctor>('/doctors', values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setOpen(false);
      toast.success(t.toasts.doctorAdded, t.toasts.doctorInviteSent(data.email));
    },
    onError: () => toast.error(t.common.error),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const { email, ...rest } = values;
      return api.patch<Doctor>(`/doctors/${editing?._id}`, rest);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setOpen(false);
      toast.success(t.toasts.doctorUpdated, data.fullName);
    },
    onError: () => toast.error(t.common.error),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success(t.toasts.doctorDeactivated);
    },
    onError: () => toast.error(t.common.error),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/doctors/${id}`, { isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success(t.toasts.doctorUpdated);
    },
    onError: () => toast.error(t.common.error),
  });

  const onSubmit = (values: FormValues) => {
    if (editing) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const saving = createMutation.isPending || updateMutation.isPending;
  const branchName = (id: string) => branches?.find((b) => b._id === id)?.name ?? id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.doctors.title}</h1>
          <p className="text-sm text-muted-foreground">{t.doctors.subtitle}</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t.doctors.add}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : !doctors || doctors.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Stethoscope className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-sm text-muted-foreground">{t.doctors.empty}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.doctors.fullName}</th>
                <th>{t.doctors.specialty}</th>
                <th>{t.doctors.consultationPrice}</th>
                <th>{t.doctors.branchesLabel}</th>
                <th>{t.common.active}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr
                  key={doctor._id}
                  className={canManage ? 'cursor-pointer' : undefined}
                  onClick={canManage ? () => openEdit(doctor) : undefined}
                >
                  <td className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={doctor.fullName} />
                      {doctor.fullName}
                    </div>
                  </td>
                  <td className="text-muted-foreground">{doctor.specialty}</td>
                  <td className="tabular-nums text-muted-foreground">{doctor.consultationPrice} EGP</td>
                  <td className="text-muted-foreground">{doctor.branchIds.map(branchName).join(', ')}</td>
                  <td>
                    <Badge variant={doctor.isActive ? 'success' : 'neutral'}>
                      {doctor.isActive ? t.common.active : t.common.inactive}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <div className="flex justify-end gap-1">
                      <Link href={`/doctors/${doctor._id}/schedule`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <CalendarClock className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {canManage &&
                        (doctor.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deactivateMutation.mutate(doctor._id);
                            }}
                          >
                            {t.common.deactivate}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              activateMutation.mutate(doctor._id);
                            }}
                          >
                            {t.common.activate}
                          </Button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.doctors.editTitle : t.doctors.addTitle}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))}
            className="max-h-[70vh] space-y-4 overflow-y-auto pe-1"
          >
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t.doctors.fullName}</Label>
              <Input id="fullName" error={!!errors.fullName} {...register('fullName')} />
              <FieldError>{errors.fullName?.message}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="specialty">{t.doctors.specialty}</Label>
                <Input id="specialty" error={!!errors.specialty} {...register('specialty')} />
                <FieldError>{errors.specialty?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialtyAr">{t.doctors.specialtyAr}</Label>
                <Input id="specialtyAr" dir="rtl" error={!!errors.specialtyAr} {...register('specialtyAr')} />
                <FieldError>{errors.specialtyAr?.message}</FieldError>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t.doctors.phone}</Label>
                <Input id="phone" error={!!errors.phone} {...register('phone')} />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t.doctors.email}</Label>
                <Input id="email" type="email" disabled={!!editing} error={!!errors.email} {...register('email')} />
                <FieldError>{errors.email?.message}</FieldError>
              </div>
            </div>
            {!editing && <p className="text-xs text-muted-foreground">{t.doctors.inviteNote}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="bio">{t.doctors.bio}</Label>
              <Textarea id="bio" {...register('bio')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="consultationPrice">{t.doctors.consultationPrice}</Label>
                <Input id="consultationPrice" type="number" step="1" error={!!errors.consultationPrice} {...register('consultationPrice')} />
                <FieldError>{errors.consultationPrice?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="followUpPrice">{t.doctors.followUpPrice}</Label>
                <Input id="followUpPrice" type="number" step="1" error={!!errors.followUpPrice} {...register('followUpPrice')} />
                <FieldError>{errors.followUpPrice?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">{t.doctors.duration}</Label>
                <Input id="duration" type="number" step="5" {...register('defaultAppointmentDurationMinutes')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t.doctors.branchesLabel}</Label>
              <Controller
                control={control}
                name="branchIds"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {(branches ?? []).map((branch) => {
                      const checked = field.value?.includes(branch._id);
                      return (
                        <button
                          type="button"
                          key={branch._id}
                          onClick={() =>
                            field.onChange(
                              checked
                                ? field.value.filter((id: string) => id !== branch._id)
                                : [...(field.value ?? []), branch._id],
                            )
                          }
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            checked
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {branch.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError>{errors.branchIds?.message}</FieldError>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" loading={saving}>
                {editing ? t.common.save : t.common.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
