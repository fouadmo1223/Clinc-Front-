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
    email: z.string().email(t.common.invalidEmail),
    password: z.string().min(6, t.common.minLength(6)),
  });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function LoginPage() {
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
      const data = await api.post<{ accessToken: string; user: any }>('/auth/login', values, { auth: false });
      setSession(data.accessToken, data.user);
      toast.success(t.toasts.welcomeBack(data.user.fullName.split(' ')[0]));
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setServerError(t.auth.login.invalid);
      } else {
        setServerError(null);
        toast.error(t.common.error);
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{t.auth.login.title}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.login.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.login.email}</Label>
          <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.login.password}</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              {t.auth.login.forgot}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" loading={submitting}>
          {t.auth.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.login.noAccount}{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t.auth.login.registerLink}
        </Link>
      </p>
    </AuthShell>
  );
}
