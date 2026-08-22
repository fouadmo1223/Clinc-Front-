'use client';

import * as React from 'react';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { useLocale } from '@/lib/i18n/locale-context';

/** Keeps Radix primitives (Select, Dialog, Popover, Toast...) in sync with the active locale's direction. */
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { dir } = useLocale();
  return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}
