'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import type { Clinic } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldError } from '@/components/ui/field-error';
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

  if (isLoading) {
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.app.name}</CardTitle>
          <CardDescription>{clinic?.slug}</CardDescription>
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
    </div>
  );
}
