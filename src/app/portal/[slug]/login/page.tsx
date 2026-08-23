'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n/locale-context';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

export default function PatientPortalLoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const setSession = usePatientAuthStore((s) => s.setSession);

  const [step, setStep] = React.useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const requestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await patientApi.post('/patient-portal/auth/request-otp', { clinicSlug: params.slug, phone }, { auth: false });
      setStep('code');
    } catch {
      // Same generic outcome whether or not the phone exists — no enumeration signal to leak.
      setStep('code');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const data = await patientApi.post<{ accessToken: string; patient: { id: string; fullName: string; clinicName: string } }>(
        '/patient-portal/auth/verify-otp',
        { clinicSlug: params.slug, phone, code },
        { auth: false },
      );
      setSession(data.accessToken, data.patient, params.slug);
      router.push(`/portal/${params.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.portal.invalidCode);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{t.portal.title}</h1>
        <p className="text-sm text-muted-foreground">{step === 'phone' ? t.portal.subtitle : t.portal.codeSentSubtitle}</p>
      </div>

      {step === 'phone' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (phone.trim().length >= 6) requestCode();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t.portal.phone}</Label>
            <Input
              id="phone"
              type="tel"
              dir="ltr"
              className="text-start"
              placeholder={t.portal.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <Button type="submit" className="w-full" loading={submitting} disabled={phone.trim().length < 6}>
            {t.portal.sendCode}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim().length === 6) verifyCode();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="code">{t.portal.code}</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="text-center text-lg tracking-[0.5em]"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            <FieldError>{error ?? undefined}</FieldError>
          </div>
          <Button type="submit" className="w-full" loading={submitting} disabled={code.trim().length !== 6}>
            {t.portal.verify}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError(null);
            }}
            className="w-full text-center text-sm font-medium text-primary hover:underline"
          >
            {t.portal.changePhone}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
