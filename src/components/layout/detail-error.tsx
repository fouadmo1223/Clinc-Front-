'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { buttonVariants } from '@/components/ui/button';

/** Shown when a detail page's data fetch fails (404/network error) — distinguishes that from
 * still-loading, so the page doesn't render a skeleton forever. */
export function DetailError({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const { t } = useLocale();

  return (
    <div className="flex max-w-3xl flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight">{t.errorPage.title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t.errorPage.description}</p>
      </div>
      <Link href={backHref} className={buttonVariants({ variant: 'outline' })}>
        {backLabel}
      </Link>
    </div>
  );
}
