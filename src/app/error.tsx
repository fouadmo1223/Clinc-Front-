'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Button, buttonVariants } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();

  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary/30 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold tracking-tight">{t.errorPage.title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t.errorPage.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => reset()}>{t.errorPage.retry}</Button>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
          {t.errorPage.backHome}
        </Link>
      </div>
    </div>
  );
}
