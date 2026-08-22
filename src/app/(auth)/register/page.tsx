'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/hooks/use-toast';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({
    clinicName: z.string().min(2, t.common.minLength(2)),
    clinicNameAr: z.string().min(2, t.common.minLength(2)),
    clinicPhone: z.string().min(8, t.common.minLength(8)),
    ownerFullName: z.string().min(2, t.common.minLength(2)),
    email: z.string().email(t.common.invalidEmail),
    password: z.string().min(8, t.common.minLength(8)),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; user: any }>(
        '/auth/register-clinic',
        values,
        { auth: false },
      );
      setSession(data.accessToken, data.refreshToken, data.user);
      toast.success(t.toasts.clinicCreated, t.toasts.clinicCreatedDesc(data.user.fullName.split(' ')[0]));
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else setServerError(t.common.error);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{t.auth.register.title}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.register.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="clinicName">{t.auth.register.clinicName}</Label>
            <Input id="clinicName" error={!!errors.clinicName} {...register('clinicName')} />
            <FieldError>{errors.clinicName?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clinicNameAr">{t.auth.register.clinicNameAr}</Label>
            <Input id="clinicNameAr" dir="rtl" error={!!errors.clinicNameAr} {...register('clinicNameAr')} />
            <FieldError>{errors.clinicNameAr?.message}</FieldError>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clinicPhone">{t.auth.register.clinicPhone}</Label>
          <Input id="clinicPhone" error={!!errors.clinicPhone} {...register('clinicPhone')} />
          <FieldError>{errors.clinicPhone?.message}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerFullName">{t.auth.register.ownerFullName}</Label>
          <Input id="ownerFullName" error={!!errors.ownerFullName} {...register('ownerFullName')} />
          <FieldError>{errors.ownerFullName?.message}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.register.email}</Label>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.register.password}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" loading={submitting}>
          {t.auth.register.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.register.hasAccount}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t.auth.register.loginLink}
        </Link>
      </p>
    </AuthShell>
  );
}
