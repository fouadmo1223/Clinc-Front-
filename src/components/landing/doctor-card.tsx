'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { patientApi } from '@/lib/patient-api';
import { ApiError } from '@/lib/api';
import type { PublicDoctor } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { DoctorAvatar, getDoctorGradient } from './doctor-avatar';
import { HoverPeek } from './hover-peek';
import { EASE, Stars } from './primitives';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

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

export function DoctorCard({ doctor, index }: { doctor: PublicDoctor; index: number }) {
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

  const gradient = getDoctorGradient(doctor.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: EASE }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-surface ring-1 ring-black/5 transition-shadow duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover:shadow-[0_28px_70px_-24px_rgba(15,23,42,0.32)]">
        {/* Cover banner — doctor's own gradient, with drifting decorative circles */}
        <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${gradient}`}>
          <motion.span
            aria-hidden
            className="absolute -end-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl"
            animate={{ x: [0, 6, 0], y: [0, -4, 0] }}
            transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute -start-8 bottom-[-2.5rem] h-24 w-24 rounded-full bg-black/10 blur-lg"
            animate={{ x: [0, -6, 0], y: [0, 4, 0] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: EASE, delay: 0.5 }}
          />
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Star className="h-3 w-3 fill-white text-white" strokeWidth={0} />
            {doctor.rating.average > 0 ? doctor.rating.average.toFixed(1) : '—'}
          </span>
        </div>

        <div className="px-5">
          <div className="-mt-10 flex items-end justify-between">
            <motion.div whileHover={{ scale: 1.08, rotate: -3 }} transition={{ duration: 0.4, ease: EASE }}>
              <DoctorAvatar id={doctor.id} fullName={doctor.fullName} size="lg" />
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 pb-5 pt-3">
          <div className="min-w-0">
            <HoverPeek avatar={<DoctorAvatar id={doctor.id} fullName={doctor.fullName} size="md" />}>
              <p className="truncate text-base font-semibold">{doctor.fullName}</p>
            </HoverPeek>
            <p className="truncate text-sm text-muted-foreground">{locale === 'ar' ? doctor.specialtyAr : doctor.specialty}</p>
          </div>

          <div className="flex items-center gap-2">
            <Stars value={doctor.rating.average} />
            <span className="text-sm text-muted-foreground">
              {doctor.rating.count > 0 ? t.landing.reviews(doctor.rating.count) : t.landing.noReviewsYet}
            </span>
          </div>

          {doctor.bio && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>}

          <p className="text-base font-medium">
            {t.landing.startingFrom} <span className="text-primary">{doctor.consultationPrice}</span>
          </p>

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleBook}
              className="group/btn relative flex flex-1 items-center justify-between overflow-hidden rounded-full bg-primary py-1.5 ps-4 pe-1.5 text-xs font-semibold text-primary-foreground transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_hsl(var(--primary)/0.6)] active:scale-[0.98] active:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-0 origin-center scale-0 rounded-full bg-white/10 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover/btn:scale-100" />
              <span className="relative">{t.landing.bookNow}</span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:bg-white/25 rtl:group-hover/btn:-translate-x-0.5">
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
                className="overflow-hidden"
              >
                <ReviewForm doctorId={doctor.id} onDone={() => setShowReviewForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
