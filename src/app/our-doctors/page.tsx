'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useLocale } from '@/lib/i18n/locale-context';
import { publicApi } from '@/lib/public-api';
import type { PublicClinic, PublicDoctor } from '@/types/domain';
import { landingCopy } from '@/content/landing-copy';
import { Nav } from '@/components/landing/sections/Nav';
import { Footer } from '@/components/landing/sections/Footer';
import { DoctorCard } from '@/components/landing/doctor-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EASE, Eyebrow } from '@/components/landing/primitives';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

// useSearchParams() opts the whole subtree out of static prerendering unless it's inside a
// Suspense boundary — Vercel's production build enforces this even though `next dev` doesn't.
export default function DoctorsPage() {
  return (
    <React.Suspense fallback={null}>
      <DoctorsPageInner />
    </React.Suspense>
  );
}

function DoctorsPageInner() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffAccessToken = useAuthStore((s) => s.accessToken);
  const staffHasHydrated = useAuthStore((s) => s.hasHydrated);

  const [specialty, setSpecialty] = React.useState<string>(searchParams.get('specialty') ?? '');

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

  if (!staffHasHydrated || staffAccessToken) return null;

  const copy = landingCopy[locale];
  const clinicName = (locale === 'ar' ? clinic?.nameAr ?? clinic?.name : clinic?.name) ?? t.app.name;
  const doctorList = doctors ?? [];
  const specialtyOf = (d: PublicDoctor) => (locale === 'ar' ? d.specialtyAr : d.specialty);
  const specialties = [...new Set(doctorList.map(specialtyOf))];
  const filtered = specialty ? doctorList.filter((d) => specialtyOf(d) === specialty) : doctorList;

  const navLinks = [
    { href: '/our-doctors', label: copy.nav.doctors },
    { href: '/#features', label: copy.nav.features },
    { href: '/#how', label: copy.nav.how },
    { href: '/#faq', label: copy.nav.faq },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav copy={copy.nav} clinicName={clinicName} staffLoginLabel={copy.footer.staffLogin} />

      <section className="px-5 pb-16 pt-32 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-2xl">
            <Eyebrow>{copy.doctorsPage.eyebrow}</Eyebrow>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{copy.doctorsPage.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{copy.doctorsPage.subtitle}</p>
          </div>

          {specialties.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSpecialty('')}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  specialty === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:border-primary/40'
                }`}
              >
                {copy.doctorsPage.allFilter}
              </button>
              {specialties.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialty(s)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    specialty === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">{copy.doctorsPage.resultsCount(filtered.length)}</p>

          <div className="mt-6">
            {loadingDoctors ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-[2rem]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">{copy.doctorsPage.noResults}</p>
            ) : (
              <motion.div
                layout
                transition={{ duration: 0.4, ease: EASE }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((d, i) => (
                  <DoctorCard key={d.id} doctor={d} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer copy={copy.footer} clinicName={clinicName} address={clinic?.address} navLinks={navLinks} />
    </div>
  );
}
