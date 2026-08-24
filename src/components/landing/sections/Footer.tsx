'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Stethoscope, MapPin, Mail } from 'lucide-react';
import type { LandingCopy } from '@/content/landing-copy';
import { EASE } from '../primitives';

const DEFAULT_CLINIC_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG ?? 'demo-clinic';

export function Footer({
  copy,
  clinicName,
  address,
  navLinks,
}: {
  copy: LandingCopy['footer'];
  clinicName: string;
  address?: string;
  navLinks: { href: string; label: string }[];
}) {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#0b1614] px-5 pb-10 pt-20 text-white sm:px-8 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-12 border-b border-white/10 pb-14 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b1614]">
                <Stethoscope className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-lg font-semibold">{clinicName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">{copy.tagline}</p>
          </motion.div>

          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{copy.quickLinks}</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{copy.contact}</p>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
                {address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {address}
                  </span>
                )}
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  info@{DEFAULT_CLINIC_SLUG}.example
                </span>
              </div>
            </div>
            <div className="self-start">
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {copy.staffLogin}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/40 sm:flex-row">
          <p>{copy.rights(new Date().getFullYear())}</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {clinicName}
          </p>
        </div>
      </div>
    </footer>
  );
}
