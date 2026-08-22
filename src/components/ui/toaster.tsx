'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToasts, type ToastVariant } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-success/20 bg-surface text-foreground [&_svg]:text-success',
  error: 'border-destructive/20 bg-surface text-foreground [&_svg]:text-destructive',
  info: 'border-border bg-surface text-foreground [&_svg]:text-info',
};

export function Toaster() {
  const { items, dismiss } = useToasts();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:end-4 sm:items-end">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = ICONS[item.variant];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-popover sm:w-96',
                STYLES[item.variant],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-sm text-muted-foreground/70 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
