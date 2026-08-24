'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { useAuthStore } from '@/stores/auth-store';
import { getDoctorGradient } from '../doctor-avatar';
import type { LandingCopy } from '@/content/landing-copy';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EASE } from '../primitives';

const MotionLink = motion(Link);

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

function patientInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function Nav({ copy, clinicName, staffLoginLabel }: { copy: LandingCopy['nav']; clinicName: string; staffLoginLabel: string }) {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const patientToken = usePatientAuthStore((s) => s.accessToken);
  const patientClinicSlug = usePatientAuthStore((s) => s.clinicSlug);
  const patient = usePatientAuthStore((s) => s.patient);
  const clearPatientSession = usePatientAuthStore((s) => s.clear);
  const isPatientLoggedIn = !!patientToken && patientClinicSlug === DEFAULT_CLINIC_SLUG;

  const staffToken = useAuthStore((s) => s.accessToken);
  const staffUser = useAuthStore((s) => s.user);
  const clearStaffSession = useAuthStore((s) => s.clear);
  const isStaffLoggedIn = !!staffToken && !!staffUser;

  const handlePatientLogout = () => {
    clearPatientSession();
    router.push('/');
  };

  const handleStaffLogout = () => {
    clearStaffSession();
    router.push('/');
  };

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
    { href: '/our-doctors', label: copy.doctors },
    { href: '/#features', label: copy.features },
    { href: '/#how', label: copy.how },
    { href: '/#testimonials', label: copy.stories },
    { href: '/#faq', label: copy.faq },
    { href: '/#contact', label: copy.contact },
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
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-semibold">{clinicName}</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
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
          {isPatientLoggedIn && patient ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden items-center gap-1.5 rounded-full py-1 ps-1 pe-2 transition-colors hover:bg-secondary sm:flex"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ${getDoctorGradient(patient.id)}`}
                  >
                    {patientInitials(patient.fullName)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="truncate px-2.5 py-1.5 text-xs font-medium text-muted-foreground">{patient.fullName}</div>
                <DropdownMenuItem onSelect={() => router.push(`/portal/${DEFAULT_CLINIC_SLUG}`)}>
                  <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {copy.myDashboard}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handlePatientLogout} className="text-destructive">
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t.portal.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isStaffLoggedIn && staffUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden items-center gap-1.5 rounded-full py-1 ps-1 pe-2 transition-colors hover:bg-secondary sm:flex"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ${getDoctorGradient(staffUser.id)}`}
                  >
                    {patientInitials(staffUser.fullName)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="truncate px-2.5 py-1.5 text-xs font-medium text-muted-foreground">{staffUser.fullName}</div>
                <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
                  <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {copy.staffDashboard}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleStaffLogout} className="text-destructive">
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden rounded-full sm:inline-flex">
                  {copy.logIn}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push(`/portal/${DEFAULT_CLINIC_SLUG}/login`)}>
                  {copy.patientLogin}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/login')}>{staffLoginLabel}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                <MotionLink
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.06 * i, ease: EASE }}
                  className="text-2xl font-semibold tracking-tight"
                >
                  {l.label}
                </MotionLink>
              ))}
              {isPatientLoggedIn && patient ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${getDoctorGradient(patient.id)}`}
                  >
                    {patientInitials(patient.fullName)}
                  </div>
                  <p className="text-sm font-medium">{patient.fullName}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/${DEFAULT_CLINIC_SLUG}`}
                      onClick={() => setOpen(false)}
                    >
                      <Button size="sm" className="rounded-full">
                        {copy.myDashboard}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setOpen(false);
                        handlePatientLogout();
                      }}
                    >
                      {t.portal.logout}
                    </Button>
                  </div>
                </div>
              ) : isStaffLoggedIn && staffUser ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${getDoctorGradient(staffUser.id)}`}
                  >
                    {patientInitials(staffUser.fullName)}
                  </div>
                  <p className="text-sm font-medium">{staffUser.fullName}</p>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button size="sm" className="rounded-full">
                        {copy.staffDashboard}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setOpen(false);
                        handleStaffLogout();
                      }}
                    >
                      {t.common.logout}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/portal/${DEFAULT_CLINIC_SLUG}/login`} onClick={() => setOpen(false)}>
                    <Button size="sm" className="rounded-full">
                      {copy.patientLogin}
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      {staffLoginLabel}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
