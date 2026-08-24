'use client';

import { motion } from 'framer-motion';
import type { LandingCopy } from '@/content/landing-copy';
import type { Testimonial } from '@/types/domain';
import { DoctorAvatar } from '../doctor-avatar';
import { PatientAvatar } from '../patient-avatar';
import { HoverPeek } from '../hover-peek';
import { EASE, Eyebrow, Stars } from '../primitives';

export function Testimonials({
  copy,
  testimonials,
  locale,
}: {
  copy: LandingCopy['testimonials'];
  testimonials: Testimonial[] | undefined;
  locale: 'en' | 'ar';
}) {
  return (
    <section id="testimonials" className="px-5 py-28 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-xl">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{copy.title}</h2>
        </div>

        {!testimonials || testimonials.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="mt-14 -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {testimonials.slice(0, 8).map((tst, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE }}
                className="flex w-[85vw] shrink-0 snap-start flex-col justify-between rounded-[2rem] border border-border/60 bg-surface p-8 sm:w-[440px] sm:p-10"
              >
                <div>
                  <Stars value={tst.rating} size="md" />
                  <p className="mt-6 text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
                    “{tst.comment}”
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-3 border-t border-border/60 pt-6">
                  <PatientAvatar id={tst.doctorName + tst.comment} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{copy.verifiedPatient}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {copy.reviewFor}{' '}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
