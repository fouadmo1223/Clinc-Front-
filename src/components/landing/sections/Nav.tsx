'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Menu, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import type { LandingCopy } from '@/content/landing-copy';
import { Button } from '@/components/ui/button';
import { EASE } from '../primitives';

export function Nav({ copy, clinicName, staffLoginLabel }: { copy: LandingCopy['nav']; clinicName: string; staffLoginLabel: string }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Every pinned/scrubbed GSAP section on this page measures the DOM at setup time.
  // Rebuilding all of them in-place mid-session (in response to a locale change that
  // reflows the whole page) turned out to be too fragile to get fully right — a full
  // reload re-runs every effect from a clean slate instead, which is simple and robust.
  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
    window.location.reload();
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#doctors', label: copy.doctors },
    { href: '#features', label: copy.features },
    { href: '#how', label: copy.how },
    { href: '#testimonials', label: copy.stories },
    { href: '#faq', label: copy.faq },
    { href: '#contact', label: copy.contact },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-3xl items-center justify-between rounded-full border border-border/60 bg-surface/80 px-4 py-2 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl transition-shadow duration-500"
        style={{ boxShadow: scrolled ? '0 12px 48px -12px rgba(15,23,42,0.2)' : undefined }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-semibold">{clinicName}</span>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLocale}
            className="hidden rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary sm:block"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </button>
          <Link href="/login" className="hidden sm:block">
            <Button variant="outline" size="sm" className="rounded-full">
              {staffLoginLabel}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold">{clinicName}</span>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-6">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.06 * i, ease: EASE }}
                  className="text-2xl font-semibold tracking-tight"
                >
                  {l.label}
                </motion.a>
              ))}
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="mt-4 rounded-full">
                  {staffLoginLabel}
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
