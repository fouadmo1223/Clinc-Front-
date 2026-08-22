'use client';

import * as React from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: { title: string; description?: string; variant?: ToastVariant }) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, variant: input.variant ?? 'info', title: input.title, description: input.description }];
  emit();
  setTimeout(() => dismiss(id), 4500);
  return id;
}

toast.success = (title: string, description?: string) => toast({ title, description, variant: 'success' });
toast.error = (title: string, description?: string) => toast({ title, description, variant: 'error' });

export function useToasts() {
  const [items, setItems] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return { items, dismiss };
}
