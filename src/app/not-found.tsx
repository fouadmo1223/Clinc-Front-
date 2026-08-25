'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary/30 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold tracking-tight">{t.errorPage.notFoundTitle}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t.errorPage.notFoundDescription}</p>
      </div>
      <Link href="/dashboard" className={buttonVariants()}>
        {t.errorPage.backHome}
      </Link>
    </div>
  );
}
