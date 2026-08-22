'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { Toaster } from '@/components/ui/toaster';
import { DirectionProvider } from './direction-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <DirectionProvider>
          {children}
          <Toaster />
        </DirectionProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
