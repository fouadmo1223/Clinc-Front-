'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Stethoscope, CalendarClock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { useLocale } from '@/lib/i18n/locale-context';
import { publicApi } from '@/lib/public-api';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import type { PublicClinic, PublicDoctor } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(value) ? 'fill-warning text-warning' : 'text-border'}`}
        />
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
    <div className="space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">{t.landing.yourRating}</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star className={`h-5 w-5 ${i < rating ? 'fill-warning text-warning' : 'text-border'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t.landing.commentOptional}
        rows={2}
        className="w-full rounded-md border border-input bg-surface px-3 py-1.5 text-sm shadow-xs"
      />
      <Button type="button" size="sm" loading={submitting} onClick={submit}>
        {t.landing.submitReview}
      </Button>
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const patientToken = usePatientAuthStore((s) => s.accessToken);
  const clinicSlug = usePatientAuthStore((s) => s.clinicSlug);
  const [showReviewForm, setShowReviewForm] = React.useState(false);

  const isLoggedInHere = !!patientToken && clinicSlug === DEFAULT_CLINIC_SLUG;

  const handleBook = () => {
    if (isLoggedInHere) {
      router.push(`/portal/${DEFAULT_CLINIC_SLUG}/book?doctorId=${doctor.id}`);
    } else {
      router.push(`/portal/${DEFAULT_CLINIC_SLUG}/login?next=/portal/${DEFAULT_CLINIC_SLUG}/book?doctorId=${doctor.id}`);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{doctor.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{locale === 'ar' ? doctor.specialtyAr : doctor.specialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stars value={doctor.rating.average} />
          <span className="text-xs text-muted-foreground">
            {doctor.rating.count > 0 ? t.landing.reviews(doctor.rating.count) : t.landing.noReviewsYet}
          </span>
        </div>

        {doctor.bio && <p className="line-clamp-2 text-xs text-muted-foreground">{doctor.bio}</p>}

        <p className="text-sm font-medium">
          {t.landing.startingFrom} <span className="text-primary">{doctor.consultationPrice}</span>
        </p>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button type="button" size="sm" className="flex-1" onClick={handleBook}>
            <CalendarClock className="h-3.5 w-3.5" />
            {t.landing.bookNow}
          </Button>
          {isLoggedInHere && (
            <Button type="button" size="sm" variant="outline" onClick={() => setShowReviewForm((v) => !v)}>
              <Star className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {showReviewForm && <ReviewForm doctorId={doctor.id} onDone={() => setShowReviewForm(false)} />}
      </CardContent>
    </Card>
  );
}

export default function RootPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const staffAccessToken = useAuthStore((s) => s.accessToken);
  const staffHasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (staffHasHydrated && staffAccessToken) router.replace('/dashboard');
  }, [staffHasHydrated, staffAccessToken, router]);

  const { data: clinic, isLoading: loadingClinic } = useQuery({
    queryKey: ['public', 'clinic', DEFAULT_CLINIC_SLUG],
    queryFn: () => publicApi.get<PublicClinic>(`/public/${DEFAULT_CLINIC_SLUG}/clinic`),
    enabled: staffHasHydrated && !staffAccessToken,
  });
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['public', 'doctors', DEFAULT_CLINIC_SLUG],
    queryFn: () => publicApi.get<PublicDoctor[]>(`/public/${DEFAULT_CLINIC_SLUG}/doctors`),
    enabled: staffHasHydrated && !staffAccessToken,
  });

  // Staff redirect is in flight — render nothing to avoid a flash of the landing page.
  if (!staffHasHydrated || staffAccessToken) return null;

  const clinicName = locale === 'ar' ? clinic?.nameAr ?? clinic?.name : clinic?.name;
  const topRated = [...(doctors ?? [])].filter((d) => d.rating.count > 0).slice(0, 3);

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-10">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{clinicName ?? t.app.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            {t.common.language}
          </button>
          <Link href="/login">
            <Button variant="outline" size="sm">
              {t.landing.staffLogin}
            </Button>
          </Link>
        </div>
      </header>

      <section className="bg-primary px-4 py-16 text-primary-foreground md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t.landing.heroTitle}</h1>
          {clinicName && <p className="mt-3 text-primary-foreground/80">{t.landing.heroSubtitle(clinicName)}</p>}
          {clinic?.address && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-primary-foreground/70">
              <MapPin className="h-3.5 w-3.5" />
              {clinic.address}
              {clinic.city ? `, ${clinic.city}` : ''}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-12 md:px-10">
        {topRated.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">{t.landing.mostRated}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topRated.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">{t.landing.ourDoctors}</h2>
          {loadingDoctors ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : !doctors || doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} />
              ))}
            </div>
          )}
        </section>

        {!loadingClinic && clinic && clinic.services.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">{t.landing.ourServices}</h2>
            <div className="flex flex-wrap gap-2">
              {clinic.services.map((s) => (
                <span key={s} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl bg-primary px-6 py-10 text-center text-primary-foreground">
          <h2 className="text-xl font-semibold tracking-tight">{t.landing.ctaTitle}</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">{t.landing.ctaSubtitle}</p>
          <Link href={`/portal/${DEFAULT_CLINIC_SLUG}/login`}>
            <Button variant="secondary" size="sm" className="mt-5">
              {t.landing.bookNow}
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
