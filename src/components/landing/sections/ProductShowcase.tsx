'use client';

import { motion } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import type { PublicDoctor } from '@/types/domain';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorCard } from '../doctor-card';
import { EASE, Eyebrow } from '../primitives';

export function ProductShowcase({
  copy,
  clinicSlug,
  doctors,
  loading,
  specialties,
}: {
  copy: LandingCopy['showcase'];
  clinicSlug: string;
  doctors: PublicDoctor[];
  loading: boolean;
  specialties: string[];
}) {
  return (
    <section id="doctors" className="relative px-5 py-28 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h2>
          </div>
          <p className="max-w-md text-base text-muted-foreground lg:justify-self-end lg:text-end">{copy.body}</p>
        </div>

        {specialties.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.specialtiesLabel}</span>
            {specialties.map((s) => (
              <span key={s} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Browser-frame device mockup housing the real, functional doctor grid */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ perspective: 1400 }}
          className="mt-12"
        >
          <div className="rounded-[2rem] border border-border/60 bg-surface-sunken/60 p-2 shadow-[0_60px_120px_-40px_rgba(15,23,42,0.25)]">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ms-3 truncate rounded-full bg-surface px-3 py-1 text-[11px] text-muted-foreground" dir="ltr">
                {clinicSlug}.clinic/doctors
              </span>
            </div>

            <div className="rounded-b-[1.6rem] bg-surface p-4 sm:p-8">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-[1.75rem]" />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">—</p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {doctors.map((d, i) => (
                    <DoctorCard key={d.id} doctor={d} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
