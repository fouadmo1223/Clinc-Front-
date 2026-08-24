'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

let registered = false;

/** Registers GSAP plugins exactly once on the client. Safe to call from every section. */
export function ensureGsap() {
  if (registered || typeof window === 'undefined') return gsap;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger };
