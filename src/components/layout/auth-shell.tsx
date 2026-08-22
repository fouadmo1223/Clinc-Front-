'use client';

import * as React from 'react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Stethoscope } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-10 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/10">
            <Stethoscope className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">{t.app.name}</span>
        </div>

        <div className="relative max-w-xs space-y-3">
          <p className="text-2xl font-medium leading-snug tracking-tight">{t.app.tagline}</p>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            {locale === 'ar'
              ? 'إدارة المواعيد، الطوابير، الزيارات الطبية، والفواتير — في مكان واحد مصمم للعيادات المصرية.'
              : 'Appointments, live queue, medical visits, and billing — in one system built for clinics in Egypt.'}
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {t.app.name}
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-end px-6 pt-6 lg:px-10">
          <button
            type="button"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            {t.common.language}
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
