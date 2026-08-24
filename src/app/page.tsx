'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Stethoscope,
  ArrowUpRight,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  Award,
  ChevronDown,
  Phone,
  Mail,
  Heart,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { useLocale } from '@/lib/i18n/locale-context';
import { publicApi } from '@/lib/public-api';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import type { PublicClinic, PublicDoctor, Testimonial } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorAvatar } from '@/components/landing/doctor-avatar';
import { PatientAvatar } from '@/components/landing/patient-avatar';
import { HoverPeek } from '@/components/landing/hover-peek';
import { HeroVisual } from '@/components/landing/hero-visual';
import { SearchDoctorIllustration, PickTimeIllustration, ConfirmIllustration } from '@/components/landing/illustrations';
import { toast } from '@/hooks/use-toast';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';
const EASE = [0.32, 0.72, 0, 1] as const;

/* ------------------------------------------------------------------ */
/* Motion primitives                                                   */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingBlob({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className ?? ''}`}
      animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
      transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay }}
    />
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
      <Sparkles className="h-3 w-3" strokeWidth={1.5} />
      {children}
    </span>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 24, stiffness: 90 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  React.useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Floating nav                                                        */
/* ------------------------------------------------------------------ */

function FloatingNav({ clinicName }: { clinicName: string }) {
  const { t, locale, setLocale } = useLocale();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#doctors', label: t.landing.navDoctors },
    { href: '#services', label: t.landing.navServices },
    { href: '#testimonials', label: t.landing.navReviews },
    { href: '#faq', label: t.landing.navFaq },
    { href: '#contact', label: t.landing.navContact },
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
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="hidden rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary sm:block"
          >
            {t.common.language}
          </button>
          <Link href="/login" className="hidden sm:block">
            <Button variant="outline" size="sm" className="rounded-full">
              {t.landing.staffLogin}
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
                  {t.landing.staffLogin}
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Doctor card + review form                                           */
/* ------------------------------------------------------------------ */

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${dim} ${i < Math.round(value) ? 'fill-warning text-warning' : 'text-border'}`} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function ReviewForm({ doctorId, onDone }: { doctorId: string; onDone: () => void }) {
  const { t } = useLocale();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await patientApi.post('/patient-portal/reviews', { doctorId, rating, comment: comment || undefined });
      toast.success(t.landing.reviewSubmitted);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) toast.error(t.landing.reviewNotEligible);
      else if (err instanceof ApiError && err.status === 409) toast.error(t.landing.alreadyReviewed);
      else toast.error(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <p className="text-xs font-medium text-muted-foreground">{t.landing.yourRating}</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star className={`h-5 w-5 ${i < rating ? 'fill-warning text-warning' : 'text-border'}`} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.landing.commentOptional}
        rows={2}
        className="w-full rounded-xl border border-input bg-surface px-3 py-1.5 text-sm shadow-xs"
      />
      <Button type="button" size="sm" className="rounded-full" loading={submitting} onClick={submit}>
        {t.landing.submitReview}
      </Button>
    </div>
  );
}

function DoctorCard({ doctor, index }: { doctor: PublicDoctor; index: number }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const patientToken = usePatientAuthStore((s) => s.accessToken);
  const clinicSlug = usePatientAuthStore((s) => s.clinicSlug);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const isLoggedInHere = !!patientToken && clinicSlug === DEFAULT_CLINIC_SLUG;

  const handleBook = () => {
    if (isLoggedInHere) router.push(`/portal/${DEFAULT_CLINIC_SLUG}/book?doctorId=${doctor.id}`);
    else router.push(`/portal/${DEFAULT_CLINIC_SLUG}/login?next=/portal/${DEFAULT_CLINIC_SLUG}/book?doctorId=${doctor.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: EASE }}
      className="group relative rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 transition-shadow duration-500"
    >
      <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.4rem] bg-surface p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] transition-[box-shadow,ring] duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28)]">
        <div
          className="pointer-events-none absolute -top-16 end-[-20%] -z-0 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)/0.18), transparent 70%)' }}
        />

        <div className="relative flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.06, rotate: -2 }} transition={{ duration: 0.4, ease: EASE }}>
            <DoctorAvatar id={doctor.id} fullName={doctor.fullName} size="lg" />
          </motion.div>
          <div className="min-w-0">
            <HoverPeek avatar={<DoctorAvatar id={doctor.id} fullName={doctor.fullName} size="md" />}>
              <p className="truncate text-base font-semibold">{doctor.fullName}</p>
            </HoverPeek>
            <p className="truncate text-sm text-muted-foreground">{locale === 'ar' ? doctor.specialtyAr : doctor.specialty}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <Stars value={doctor.rating.average} />
          <span className="text-sm text-muted-foreground">
            {doctor.rating.count > 0 ? t.landing.reviews(doctor.rating.count) : t.landing.noReviewsYet}
          </span>
        </div>

        {doctor.bio && <p className="relative line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>}

        <p className="relative text-base font-medium">
          {t.landing.startingFrom} <span className="text-primary">{doctor.consultationPrice}</span>
        </p>

        <div className="relative mt-auto flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleBook}
            className="group/btn flex flex-1 items-center justify-between rounded-full bg-primary py-1.5 ps-4 pe-1.5 text-xs font-semibold text-primary-foreground transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            {t.landing.bookNow}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 rtl:group-hover/btn:-translate-x-0.5">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </button>
          {isLoggedInHere && (
            <button
              type="button"
              onClick={() => setShowReviewForm((v) => !v)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
              aria-label={t.landing.rateThisDoctor}
            >
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative overflow-hidden"
            >
              <ReviewForm doctorId={doctor.id} onDone={() => setShowReviewForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ accordion item                                                  */
/* ------------------------------------------------------------------ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-[1.5rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[1.15rem] bg-surface px-5 py-4 text-start"
      >
        <span className="text-base font-semibold">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden rounded-b-[1.15rem] bg-surface"
          >
            <p className="px-5 pb-4 text-base leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function RootPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const staffAccessToken = useAuthStore((s) => s.accessToken);
  const staffHasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (staffHasHydrated && staffAccessToken) router.replace('/dashboard');
  }, [staffHasHydrated, staffAccessToken, router]);

  const enabled = staffHasHydrated && !staffAccessToken;

  const { data: clinic } = useQuery({
    queryKey: ['public', 'clinic', DEFAULT_CLINIC_SLUG],
    queryFn: () => publicApi.get<PublicClinic>(`/public/${DEFAULT_CLINIC_SLUG}/clinic`),
    enabled,
  });
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['public', 'doctors', DEFAULT_CLINIC_SLUG],
    queryFn: () => publicApi.get<PublicDoctor[]>(`/public/${DEFAULT_CLINIC_SLUG}/doctors`),
    enabled,
  });
  const { data: testimonials } = useQuery({
    queryKey: ['public', 'testimonials', DEFAULT_CLINIC_SLUG],
    queryFn: () => publicApi.get<Testimonial[]>(`/public/${DEFAULT_CLINIC_SLUG}/testimonials`),
    enabled,
  });

  if (!staffHasHydrated || staffAccessToken) return null;

  const clinicName = (locale === 'ar' ? clinic?.nameAr ?? clinic?.name : clinic?.name) ?? t.app.name;
  const topRated = [...(doctors ?? [])].filter((d) => d.rating.count > 0).slice(0, 3);
  const specialties = [...new Set((doctors ?? []).map((d) => (locale === 'ar' ? d.specialtyAr : d.specialty)))];
  const avgRating = doctors && doctors.length > 0 ? doctors.reduce((s, d) => s + d.rating.average, 0) / doctors.filter((d) => d.rating.count > 0).length || 0 : 0;

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
    { q: t.landing.faq5Q, a: t.landing.faq5A },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <FloatingNav clinicName={clinicName} />

      {/* ---------------------------------------------------------- Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center px-4 pt-28 pb-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary)/0.12), transparent), radial-gradient(40% 35% at 85% 20%, hsl(27 68% 48% / 0.10), transparent)',
          }}
        />
        <FloatingBlob className="start-[6%] top-[18%] h-64 w-64 bg-primary/10" />
        <FloatingBlob className="end-[8%] top-[55%] h-72 w-72 bg-accent/10" delay={1.5} />
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-start">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <Eyebrow>{t.landing.eyebrow}</Eyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="mt-5 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              {t.landing.heroTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0"
            >
              {t.landing.heroSubtitle(clinicName)}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <a href="#doctors">
                <button
                  type="button"
                  className="group flex items-center gap-2 rounded-full bg-primary py-3 ps-6 pe-2 text-sm font-semibold text-primary-foreground shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.5)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  {t.landing.bookNow}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </button>
              </a>
              {clinic?.address && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {clinic.address}
                  {clinic.city ? `, ${clinic.city}` : ''}
                </span>
              )}
            </motion.div>
          </div>

          <HeroVisual
            doctors={(doctors ?? []).map((d) => ({ id: d.id, fullName: d.fullName }))}
            ratingLabel={t.landing.heroRatingLabel}
            ratingValue={avgRating > 0 ? avgRating.toFixed(1) : t.landing.stat1Value}
            nextAvailableLabel={t.landing.heroNextAvailable}
            nextAvailableValue={t.landing.heroNextAvailableValue}
            verifiedLabel={t.landing.heroVerifiedBadge}
          />
        </div>
      </section>

      {/* ------------------------------------------------------- Stats */}
      <section className="relative px-4 pb-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-full max-w-4xl rounded-[2rem]"
          style={{ background: 'radial-gradient(70% 100% at 50% 0%, hsl(var(--primary)/0.10), transparent)' }}
        />
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 rounded-[2rem] bg-white/40 p-2 ring-1 ring-white/60 backdrop-blur-xl md:grid-cols-4">
          {[
            { value: 49, suffix: '', label: t.landing.stat1Label, display: avgRating > 0 ? avgRating.toFixed(1) : t.landing.stat1Value },
            { value: doctors?.length ?? 0, suffix: '+', label: t.landing.stat2Label },
            { value: 500, suffix: '+', label: t.landing.stat3Label },
            { value: 5, suffix: '+', label: t.landing.stat4Label },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-1 rounded-[1.6rem] bg-white/70 px-4 py-6 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-white/40 backdrop-blur-md">
                <p className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                  {s.display ?? <AnimatedCounter value={s.value} suffix={s.suffix} />}
                </p>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- How it works */}
      <section className="relative px-4 py-24">
        <FloatingBlob className="end-[4%] top-4 h-56 w-56 bg-accent/10" />
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <Eyebrow>{t.landing.howEyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.landing.howTitle}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.landing.howSubtitle}</p>
          </Reveal>

          <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute inset-x-[15%] top-14 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
            {[
              { Illustration: SearchDoctorIllustration, title: t.landing.step1Title, desc: t.landing.step1Desc },
              { Illustration: PickTimeIllustration, title: t.landing.step2Title, desc: t.landing.step2Desc },
              { Illustration: ConfirmIllustration, title: t.landing.step3Title, desc: t.landing.step3Desc },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-white/70 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.3)] ring-1 ring-white/60 backdrop-blur-md">
                    <step.Illustration className="h-20 w-20" />
                    <span className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-md">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="max-w-[240px] text-base leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Why choose us */}
      <section className="relative px-4 py-24">
        <FloatingBlob className="start-[2%] bottom-8 h-64 w-64 bg-primary/10" delay={0.8} />

        {/* Decorative stacked glass chips */}
        <div className="pointer-events-none absolute end-[6%] top-10 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute -end-3 -top-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/55 shadow-lg ring-1 ring-white/60 backdrop-blur-xl"
          >
            <Heart className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 6 }}
            whileInView={{ opacity: 1, y: 0, rotate: 6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/75 shadow-xl ring-1 ring-white/70 backdrop-blur-xl"
          >
            <ShieldCheck className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <Eyebrow>{t.landing.whyEyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.landing.whyTitle}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.landing.whySubtitle}</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: t.landing.why1Title, desc: t.landing.why1Desc },
              { icon: Clock, title: t.landing.why2Title, desc: t.landing.why2Desc },
              { icon: Heart, title: t.landing.why3Title, desc: t.landing.why3Desc },
              { icon: Users, title: t.landing.why4Title, desc: t.landing.why4Desc },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08} className="rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                <div className="flex h-full flex-col gap-3 rounded-[1.4rem] bg-surface p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Specialties */}
      {specialties.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <Eyebrow>{t.landing.specialtiesEyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t.landing.specialtiesTitle}</h2>
            </Reveal>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {specialties.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-base font-medium shadow-[0_2px_10px_-4px_rgba(15,23,42,0.1)]"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ Doctors */}
      <section id="doctors" className="px-4 py-24">
        <div className="mx-auto max-w-5xl space-y-16">
          {topRated.length > 0 && (
            <div>
              <Reveal>
                <h2 className="text-3xl font-semibold tracking-tight">{t.landing.mostRated}</h2>
              </Reveal>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {topRated.map((d, i) => (
                  <DoctorCard key={d.id} doctor={d} index={i} />
                ))}
              </div>
            </div>
          )}

          <div>
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight">{t.landing.ourDoctors}</h2>
            </Reveal>
            {loadingDoctors ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-[1.75rem]" />
                ))}
              </div>
            ) : !doctors || doctors.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">—</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d, i) => (
                  <DoctorCard key={d.id} doctor={d} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Testimonials */}
      <section id="testimonials" className="relative overflow-hidden px-4 py-24">
        <FloatingBlob className="start-[6%] top-10 h-72 w-72 bg-primary/10" delay={0.4} />
        <FloatingBlob className="end-[4%] bottom-0 h-56 w-56 bg-accent/10" delay={1.2} />
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <Eyebrow>{t.landing.testimonialsEyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.landing.testimonialsTitle}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.landing.testimonialsSubtitle}</p>
          </Reveal>

          {!testimonials || testimonials.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">{t.landing.testimonialsEmpty}</p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {testimonials.slice(0, 6).map((tst, i) => (
                <Reveal key={i} delay={(i % 3) * 0.1} className="rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                  <div className="flex h-full flex-col gap-3 rounded-[1.4rem] bg-surface p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                    <Stars value={tst.rating} size="md" />
                    <p className="flex-1 text-base leading-relaxed text-foreground">“{tst.comment}”</p>
                    <div className="flex items-center gap-2 border-t border-border/60 pt-3">
                      <PatientAvatar id={tst.doctorName + tst.comment} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{t.landing.verifiedPatient}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {t.landing.reviewFor}{' '}
                          <HoverPeek
                            className="font-medium text-foreground"
                            avatar={<DoctorAvatar id={tst.doctorName} fullName={tst.doctorName} size="md" />}
                          >
                            {tst.doctorName}
                          </HoverPeek>
                          {' · '}
                          {locale === 'ar' ? tst.doctorSpecialtyAr : tst.doctorSpecialty}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ Services */}
      {clinic && clinic.services.length > 0 && (
        <section id="services" className="relative px-4 py-24">
          <FloatingBlob className="start-[10%] top-0 h-56 w-56 bg-accent/10" delay={0.6} />
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.landing.ourServices}</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {clinic.services.map((s, i) => (
                <Reveal key={s} delay={i * 0.06}>
                  <div className="flex flex-col items-center gap-2 rounded-[1.6rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                    <div className="flex w-full flex-col items-center gap-2 rounded-[1.25rem] bg-surface px-4 py-6">
                      <Award className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      <span className="text-base font-medium">{s}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- FAQ */}
      <section id="faq" className="relative px-4 py-24">
        <FloatingBlob className="end-[6%] bottom-4 h-60 w-60 bg-primary/10" delay={1} />
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <Eyebrow>{t.landing.faqEyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.landing.faqTitle}</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <FaqItem q={f.q} a={f.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Contact */}
      <section id="contact" className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <Eyebrow>{t.landing.contactEyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.landing.contactTitle}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.landing.contactSubtitle}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, label: t.landing.addressLabel, value: clinic?.address ? `${clinic.address}${clinic.city ? `, ${clinic.city}` : ''}` : '—' },
              { icon: Clock, label: t.landing.hoursLabel, value: t.landing.hoursValue },
              { icon: Phone, label: t.landing.phoneLabel, value: '—' },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08} className="rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                <div className="flex h-full flex-col items-center gap-2 rounded-[1.4rem] bg-surface px-5 py-8 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                  <p className="text-base font-semibold">{c.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="px-4 pb-24">
        <Reveal className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center text-primary-foreground">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(60% 80% at 50% 0%, hsl(0 0% 100% / 0.12), transparent)' }}
            />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.landing.ctaTitle}</h2>
              <p className="mt-2 text-base text-primary-foreground/80">{t.landing.ctaSubtitle}</p>
              <Link href={`/portal/${DEFAULT_CLINIC_SLUG}/login`}>
                <button
                  type="button"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white py-3 ps-6 pe-2 text-sm font-semibold text-primary transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  {t.landing.bookNow}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --------------------------------------------------------- Footer */}
      <footer className="border-t border-border/60 px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-start">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-semibold">{clinicName}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t.landing.footerTagline}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.landing.footerQuickLinks}</p>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <a href="#doctors" className="hover:text-foreground">
                {t.landing.navDoctors}
              </a>
              <a href="#services" className="hover:text-foreground">
                {t.landing.navServices}
              </a>
              <a href="#faq" className="hover:text-foreground">
                {t.landing.navFaq}
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.landing.footerContact}</p>
            {clinic?.address && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                {clinic.address}
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
              <Mail className="h-3 w-3" strokeWidth={1.5} />
              info@{DEFAULT_CLINIC_SLUG}.example
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-muted-foreground">{t.landing.footerRights(new Date().getFullYear())}</p>
      </footer>
    </div>
  );
}
