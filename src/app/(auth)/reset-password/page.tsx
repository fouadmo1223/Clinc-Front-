'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/lib/i18n/locale-context';
import { api, ApiError } from '@/lib/api';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({ newPassword: z.string().min(8, t.common.minLength(8)) });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const { t } = useLocale();
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setServerError(t.auth.reset.invalidLink);
      return;
    }
    setServerError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, ...values }, { auth: false });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{t.auth.reset.title}</h1>
      </div>

      {success ? (
        <p className="rounded-md bg-success/10 px-3 py-2.5 text-sm text-success">{t.auth.reset.success}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">{t.auth.reset.newPassword}</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              error={!!errors.newPassword}
              {...register('newPassword')}
            />
            <FieldError>{errors.newPassword?.message}</FieldError>
          </div>
          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
          )}
          <Button type="submit" className="w-full" loading={submitting}>
            {t.auth.reset.submit}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
