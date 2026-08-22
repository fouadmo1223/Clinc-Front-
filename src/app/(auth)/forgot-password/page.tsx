'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/lib/i18n/locale-context';
import { api } from '@/lib/api';
import { FieldError } from '@/components/ui/field-error';
import { onFormInvalid } from '@/lib/form-invalid';

function buildSchema(t: ReturnType<typeof useLocale>['t']) {
  return z.object({ email: z.string().email(t.common.invalidEmail) });
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', values, { auth: false });
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{t.auth.forgot.title}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.forgot.subtitle}</p>
      </div>

      {sent ? (
        <p className="rounded-md bg-success/10 px-3 py-2.5 text-sm text-success">{t.auth.forgot.sent}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit, onFormInvalid(t.common.formInvalid))} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t.auth.forgot.email}</Label>
            <Input id="email" type="email" autoComplete="email" error={!!errors.email} {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <Button type="submit" className="w-full" loading={submitting}>
            {t.auth.forgot.submit}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t.auth.forgot.backToLogin}
        </Link>
      </p>
    </AuthShell>
  );
}
