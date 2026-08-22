'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Building2, Stethoscope, Users, Settings, Contact, LogOut, CalendarClock, ClipboardList, Receipt } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SidebarNav, type NavItem } from '@/components/layout/sidebar-nav';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireAuth();
  const { t, locale, setLocale } = useLocale();
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  if (!isReady || !user) return null;

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t.nav.overview, icon: LayoutGrid },
    { href: '/appointments', label: t.nav.appointments, icon: CalendarClock },
    { href: '/visits', label: t.nav.visits, icon: ClipboardList },
    { href: '/patients', label: t.nav.patients, icon: Contact },
    { href: '/invoices', label: t.nav.invoices, icon: Receipt },
    { href: '/clinic', label: t.nav.clinic, icon: Settings },
    { href: '/branches', label: t.nav.branches, icon: Building2 },
    { href: '/doctors', label: t.nav.doctors, icon: Stethoscope },
    { href: '/staff', label: t.nav.staff, icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clear();
      router.replace('/login');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
      <aside className="hidden border-e border-border bg-surface md:flex md:flex-col">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
          <span className="text-sm font-semibold tracking-tight">{t.app.name}</span>
        </div>
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav items={navItems} />
            <span className="text-sm font-semibold">{t.app.name}</span>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
            >
              {t.common.language}
            </button>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.fullName} · {user.role}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.common.logout}</span>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
