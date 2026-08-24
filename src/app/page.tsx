'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { useLocale } from '@/lib/i18n/locale-context';
import { publicApi } from '@/lib/public-api';
import type { PublicClinic, PublicDoctor, Testimonial } from '@/types/domain';
import { landingCopy } from '@/content/landing-copy';
import { SmoothScrollProvider } from '@/components/landing/smooth-scroll-provider';
import { Nav } from '@/components/landing/sections/Nav';
import { Hero } from '@/components/landing/sections/Hero';
import { Trust } from '@/components/landing/sections/Trust';
import { Problem } from '@/components/landing/sections/Problem';
import { Concept } from '@/components/landing/sections/Concept';
import { Features } from '@/components/landing/sections/Features';
import { ProductShowcase } from '@/components/landing/sections/ProductShowcase';
import { HowItWorks } from '@/components/landing/sections/HowItWorks';
import { VisualBreak } from '@/components/landing/sections/VisualBreak';
import { Benefits } from '@/components/landing/sections/Benefits';
import { Testimonials } from '@/components/landing/sections/Testimonials';
import { Faq } from '@/components/landing/sections/Faq';
import { FinalCTA } from '@/components/landing/sections/FinalCTA';
import { Footer } from '@/components/landing/sections/Footer';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

export default function RootPage() {
  const { t, locale, dir } = useLocale();
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

  const copy = landingCopy[locale];
  const clinicName = (locale === 'ar' ? clinic?.nameAr ?? clinic?.name : clinic?.name) ?? t.app.name;
  const doctorList = doctors ?? [];
  const specialties = [...new Set(doctorList.map((d) => (locale === 'ar' ? d.specialtyAr : d.specialty)))];
  const ratedDoctors = doctorList.filter((d) => d.rating.count > 0);
  const avgRating = ratedDoctors.length > 0 ? ratedDoctors.reduce((s, d) => s + d.rating.average, 0) / ratedDoctors.length : 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: t.landing.faq1Q, a: t.landing.faq1A },
    { q: t.landing.faq2Q, a: t.landing.faq2A },
    { q: t.landing.faq3Q, a: t.landing.faq3A },
    { q: t.landing.faq4Q, a: t.landing.faq4A },
    { q: t.landing.faq5Q, a: t.landing.faq5A },
  ];

  const navLinks = [
    { href: '#doctors', label: copy.nav.doctors },
    { href: '#features', label: copy.nav.features },
    { href: '#how', label: copy.nav.how },
    { href: '#faq', label: copy.nav.faq },
  ];

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <Nav copy={copy.nav} clinicName={clinicName} staffLoginLabel={copy.footer.staffLogin} />

        <Hero
          copy={copy.hero}
          clinicName={clinicName}
          address={clinic?.address}
          city={clinic?.city}
          doctors={doctorList}
          ratingValue={avgRating > 0 ? avgRating.toFixed(1) : '—'}
          ratingLabel={copy.trust.stat1}
          onBook={() => scrollTo('doctors')}
          onSeeDoctors={() => scrollTo('doctors')}
        />

        <Trust copy={copy.trust} avgRating={avgRating} doctorCount={doctorList.length} specialties={specialties} />

        <Problem copy={copy.problem} />

        <Concept copy={copy.concept} onCta={() => scrollTo('how')} />

        <Features copy={copy.features} dir={dir} />

        <ProductShowcase
          copy={copy.showcase}
          clinicSlug={DEFAULT_CLINIC_SLUG}
          doctors={doctorList}
          loading={loadingDoctors}
          specialties={specialties}
        />

        <HowItWorks copy={copy.how} />

        <VisualBreak copy={copy.visualBreak} />

        <Benefits
          copy={copy.benefits}
          avgRating={avgRating}
          doctorCount={doctorList.length}
          patientLabel={copy.trust.stat3}
          doctorLabel={copy.trust.stat2}
          ratingLabel={copy.trust.stat1}
          yearsLabel={copy.trust.stat4}
        />

        <Testimonials copy={copy.testimonials} testimonials={testimonials} locale={locale} />

        <Faq eyebrow={t.landing.faqEyebrow} title={t.landing.faqTitle} faqs={faqs} />

        <FinalCTA copy={copy.finalCta} onCta={() => scrollTo('doctors')} />

        <Footer copy={copy.footer} clinicName={clinicName} address={clinic?.address} navLinks={navLinks} />
      </div>
    </SmoothScrollProvider>
  );
}
