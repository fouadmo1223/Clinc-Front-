'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { Clinic, WorkingHours } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldError } from '@/components/ui/field-error';
import { WorkingHoursEditor } from '@/components/ui/working-hours-editor';
import { onFormInvalid } from '@/lib/form-invalid';
import { toast } from '@/hooks/use-toast';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    name: z.string().min(2, t.common.minLength(2)),
    nameAr: z.string().min(2, t.common.minLength(2)),
    contactEmail: z.string().email(t.common.invalidEmail),
    contactPhone: z.string().min(6, t.common.minLength(6)),
    address: z.string().optional(),
    city: z.string().optional(),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function LogoCard({ clinic }: { clinic: Clinic }) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<Clinic>('/clinics/me/logo', formData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['clinic', 'me'], data);
      toast.success(t.clinicSettings.logoUploaded);
    },
    onError: () => toast.error(t.common.error),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t.clinicSettings.logo}</CardTitle>
        <CardDescription>{t.clinicSettings.logoHint}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
          {clinic.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clinic.logoUrl} alt={clinic.name} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.clinicSettings.changeLogo}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkingHoursCard({ clinic }: { clinic: Clinic }) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [hours, setHours] = React.useState<WorkingHours[]>(clinic.workingHours);

  React.useEffect(() => setHours(clinic.workingHours), [clinic.workingHours]);

  const mutation = useMutation({
    mutationFn: (workingHours: WorkingHours[]) => api.patch<Clinic>('/clinics/me', { workingHours }),
    onSuccess: (data) => {
      queryClient.setQueryData(['clinic', 'me'], data);
      toast.success(t.clinicSettings.workingHoursSaved);
    },
    onError: () => toast.error(t.common.error),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t.clinicSettings.workingHoursTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkingHoursEditor value={hours} onChange={setHours} />
        <Button type="button" size="sm" loading={mutation.isPending} onClick={() => mutation.mutate(hours)}>
          {t.common.save}
        </Button>
      </CardContent>
    </Card>
  );
}

function AppointmentDefaultsSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    defaultDurationMinutes: z.coerce.number().int().min(5, t.common.minLength(5)),
    bookingLeadTimeMinutes: z.coerce.number().int().min(0),
    maxAdvanceBookingDays: z.coerce.number().int().min(1),
    allowOnlineBooking: z.boolean(),
    allowWalkIns: z.boolean(),
    requireConfirmation: z.boolean(),
  });
}
type AppointmentDefaultsValues = z.infer<ReturnType<typeof AppointmentDefaultsSchema>>;

function AppointmentDefaultsCard({ clinic }: { clinic: Clinic }) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const schema = React.useMemo(() => AppointmentDefaultsSchema(t), [t]);

  const { register, handleSubmit, control, reset, formState } = useForm<AppointmentDefaultsValues>({
    resolver: zodResolver(schema),
    defaultValues: clinic.appointmentSettings,
  });

  React.useEffect(() => reset(clinic.appointmentSettings), [clinic.appointmentSettings, reset]);

  const mutation = useMutation({
    mutationFn: (appointmentSettings: AppointmentDefaultsValues) =>
      api.patch<Clinic>('/clinics/me', { appointmentSettings }),
    onSuccess: (data) => {
      queryClient.setQueryData(['clinic', 'me'], data);
      toast.success(t.clinicSettings.saved);
    },
    onError: () => toast.error(t.common.error),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{t.clinicSettings.appointmentDefaultsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v), onFormInvalid(t.common.formInvalid))}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="defaultDurationMinutes">
                {t.clinicSettings.defaultDurationMinutes} ({t.clinicSettings.minutes})
              </Label>
              <Input id="defaultDurationMinutes" type="number" min={5} {...register('defaultDurationMinutes')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bookingLeadTimeMinutes">
                {t.clinicSettings.bookingLeadTimeMinutes} ({t.clinicSettings.minutes})
              </Label>
              <Input id="bookingLeadTimeMinutes" type="number" min={0} {...register('bookingLeadTimeMinutes')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxAdvanceBookingDays">
                {t.clinicSettings.maxAdvanceBookingDays} ({t.clinicSettings.days})
              </Label>
              <Input id="maxAdvanceBookingDays" type="number" min={1} {...register('maxAdvanceBookingDays')} />
            </div>
          </div>

          <div className="space-y-3">
            {(['allowOnlineBooking', 'allowWalkIns', 'requireConfirmation'] as const).map((field) => (
              <div key={field} className="flex items-center justify-between gap-3">
                <Label htmlFor={field} className="font-normal">
                  {t.clinicSettings[field]}
                </Label>
                <Controller
                  name={field}
                  control={control}
                  render={({ field: f }) => (
                    <Switch id={field} checked={f.value} onCheckedChange={f.onChange} />
                  )}
                />
              </div>
            ))}
          </div>

          <Button type="submit" size="sm" loading={mutation.isPending} disabled={!formState.isDirty}>
            {t.common.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ClinicSettingsPage() {
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: () => api.get<Clinic>('/clinics/me'),
  });

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (clinic) {
      reset({
        name: clinic.name,
        nameAr: clinic.nameAr,
        contactEmail: clinic.contactEmail,
        contactPhone: clinic.contactPhone,
        address: clinic.address ?? '',
        city: clinic.city ?? '',
      });
    }
  }, [clinic, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.patch<Clinic>('/clinics/me', values),
    onSuccess: (data) => {
      queryClient.setQueryData(['clinic', 'me'], data);
      toast.success(t.clinicSettings.saved);
    },
    onError: () => toast.error(t.common.error),
  });

  if (isLoading || !clinic) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="space-y-4 pt-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.clinicSettings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.clinicSettings.subtitle}</p>
      </div>

      <LogoCard clinic={clinic} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.app.name}</CardTitle>
          <CardDescription>{clinic.slug}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v), onFormInvalid(t.common.formInvalid))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t.clinicSettings.nameEn}</Label>
                <Input id="name" error={!!errors.name} {...register('name')} />
                <FieldError>{errors.name?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nameAr">{t.clinicSettings.nameAr}</Label>
                <Input id="nameAr" dir="rtl" error={!!errors.nameAr} {...register('nameAr')} />
                <FieldError>{errors.nameAr?.message}</FieldError>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">{t.clinicSettings.contactEmail}</Label>
                <Input id="contactEmail" type="email" error={!!errors.contactEmail} {...register('contactEmail')} />
                <FieldError>{errors.contactEmail?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone">{t.clinicSettings.contactPhone}</Label>
                <Input id="contactPhone" error={!!errors.contactPhone} {...register('contactPhone')} />
                <FieldError>{errors.contactPhone?.message}</FieldError>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="address">{t.clinicSettings.address}</Label>
                <Input id="address" {...register('address')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">{t.clinicSettings.city}</Label>
                <Input id="city" {...register('city')} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
                {t.common.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <WorkingHoursCard clinic={clinic} />
      <AppointmentDefaultsCard clinic={clinic} />
    </div>
  );
}
