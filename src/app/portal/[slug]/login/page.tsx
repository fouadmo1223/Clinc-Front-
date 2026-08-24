'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/lib/i18n/locale-context';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { AuthShell } from '@/components/layout/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

type Method = 'phone' | 'email';
type Mode = 'login' | 'register';

export default function PatientPortalLoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const setSession = usePatientAuthStore((s) => s.setSession);

  const [mode, setMode] = React.useState<Mode>('login');
  const [step, setStep] = React.useState<'identify' | 'code'>('identify');
  const [method, setMethod] = React.useState<Method>('phone');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const identifier = mode === 'register' ? phone : method === 'phone' ? phone : email;
  const canSubmitIdentifier =
    mode === 'register'
      ? fullName.trim().length >= 2 && phone.trim().length >= 6 && (!email || /\S+@\S+\.\S+/.test(email))
      : method === 'phone'
        ? phone.trim().length >= 6
        : /\S+@\S+\.\S+/.test(email);

  const switchMode = (next: Mode) => {
    setMode(next);
    setMethod('phone');
    setError(null);
  };

  const requestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await patientApi.post(
        '/patient-portal/auth/request-otp',
        { clinicSlug: params.slug, ...(method === 'phone' ? { phone } : { email }) },
        { auth: false },
      );
      setStep('code');
    } catch {
      // Same generic outcome whether or not the phone/email exists — no enumeration signal to leak.
      setStep('code');
    } finally {
      setSubmitting(false);
    }
  };

  const registerAndRequestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await patientApi.post(
        '/patient-portal/auth/register',
        { clinicSlug: params.slug, fullName, phone, email: email || undefined },
        { auth: false },
      );
      setStep('code');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.message.toLowerCase().includes('email') ? t.portal.emailTaken : t.portal.phoneTaken);
      } else {
        setError(err instanceof ApiError ? err.message : t.common.error);
      }
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
        { clinicSlug: params.slug, ...(method === 'phone' ? { phone } : { email }), code },
        { auth: false },
      );
      setSession(data.accessToken, data.patient, params.slug);
      const next = searchParams.get('next');
      router.push(next && next.startsWith(`/portal/${params.slug}`) ? next : `/portal/${params.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.portal.invalidCode);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{mode === 'register' ? t.portal.createAccount : t.portal.title}</h1>
        <p className="text-sm text-muted-foreground">
          {step === 'code' ? t.portal.codeSentSubtitle : mode === 'register' ? t.portal.createAccountSubtitle : t.portal.subtitle}
        </p>
      </div>

      {step === 'identify' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmitIdentifier) return;
            if (mode === 'register') registerAndRequestCode();
            else requestCode();
          }}
          className="space-y-4"
          noValidate
        >
          {mode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t.portal.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t.portal.fullNamePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          {mode === 'login' && method === 'email' ? (
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.portal.email}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="text-start"
                placeholder={t.portal.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          ) : (
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
                autoFocus={mode === 'login'}
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.portal.emailOptional}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="text-start"
                placeholder={t.portal.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}

          <FieldError>{error ?? undefined}</FieldError>

          <Button type="submit" className="w-full" loading={submitting} disabled={!canSubmitIdentifier}>
            {mode === 'register' ? t.portal.signUp : t.portal.sendCode}
          </Button>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setMethod(method === 'phone' ? 'email' : 'phone')}
              className="w-full text-center text-sm font-medium text-primary hover:underline"
            >
              {method === 'phone' ? t.portal.useEmailInstead : t.portal.usePhoneInstead}
            </button>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'register' ? t.portal.haveAccount : t.portal.newHere}{' '}
            <button type="button" onClick={() => switchMode(mode === 'register' ? 'login' : 'register')} className="font-medium text-primary hover:underline">
              {mode === 'register' ? t.portal.logIn : t.portal.signUp}
            </button>
          </p>
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
            <p className="text-sm text-muted-foreground" dir="ltr">
              {identifier}
            </p>
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
              setStep('identify');
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
