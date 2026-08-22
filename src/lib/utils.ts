import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as YYYY-MM-DD in UTC, not the browser's local timezone.
 * The backend buckets everything (appointments, queue, reports) by UTC calendar
 * day, so any "today"/date-range default sent to those endpoints must be
 * computed the same way — using local time here would make the frontend and
 * backend disagree about which day it is for a few hours around midnight in
 * any non-UTC timezone.
 */
export function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses a comma-separated form field into a string array, e.g. for multi-phone/allergy inputs. */
export function parseCommaList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
