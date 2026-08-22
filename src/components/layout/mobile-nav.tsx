'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Menu, X, Stethoscope } from 'lucide-react';
import { SidebarNav, type NavItem } from './sidebar-nav';
import { useLocale } from '@/lib/i18n/locale-context';

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileNav({ items }: { items: NavItem[] }) {
  const { t, dir } = useLocale();
  const [open, setOpen] = React.useState(false);
  // Drawer is anchored at the reading-direction "start" edge, so it should
  // slide in from that same edge: the right in RTL, the left in LTR.
  const offscreenX = dir === 'rtl' ? '100%' : '-100%';

  const panelVariants: Variants = {
    hidden: { x: offscreenX },
    visible: {
      x: 0,
      transition: { duration: 0.28, ease: EASE, when: 'beforeChildren', staggerChildren: 0.035, delayChildren: 0.12 },
    },
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-secondary md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </DialogPrimitive.Trigger>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-foreground/30 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-border bg-surface shadow-popover md:hidden"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <DialogPrimitive.Title className="sr-only">{t.app.name}</DialogPrimitive.Title>
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{t.app.name}</span>
                  </div>
                  <DialogPrimitive.Close className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <X className="h-4 w-4" />
                  </DialogPrimitive.Close>
                </div>
                <div onClick={() => setOpen(false)}>
                  <SidebarNav items={items} animated />
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
