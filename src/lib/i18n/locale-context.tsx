'use client';

import * as React from 'react';
import { dictionaries, type Locale, type Dictionary } from './dictionaries';

interface LocaleContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'clinic-locale';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('ar');

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'en' || stored === 'ar') setLocaleState(stored);
  }, []);

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = React.useMemo(
    () => ({ locale, dir, t: dictionaries[locale], setLocale }),
    [locale, dir, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
