'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { Button } from '@/components/ui/button';

export default function DashboardErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();

  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight">{t.errorPage.title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t.errorPage.description}</p>
      </div>
      <Button onClick={() => reset()}>{t.errorPage.retry}</Button>
    </div>
  );
}
