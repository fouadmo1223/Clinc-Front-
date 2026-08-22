'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

/** `animated` opts into the stagger-in effect driven by an ancestor motion
 * component's variants (used by the mobile drawer); the static desktop
 * sidebar leaves it off since it's always mounted, not entering. */
export function SidebarNav({ items, animated = false }: { items: NavItem[]; animated?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const linkClassName = cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        );

        if (animated) {
          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link href={item.href} className={linkClassName}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            </motion.div>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={linkClassName}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
