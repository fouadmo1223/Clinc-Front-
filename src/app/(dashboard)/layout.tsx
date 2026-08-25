'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Building2,
  Stethoscope,
  Users,
  Settings,
  Contact,
  LogOut,
  CalendarClock,
  ClipboardList,
  Receipt,
  ListOrdered,
  Wallet,
  BarChart3,
  History,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useLocale } from '@/lib/i18n/locale-context';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SidebarNav, type NavItem } from '@/components/layout/sidebar-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireAuth();
  const { t, locale, setLocale } = useLocale();
  const clear = useAuthStore((s) => s.clear);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const router = useRouter();

  if (!isReady || !user) return null;

  // Every entry beyond the overview is gated by the permission that actually lets this
  // role do something on that page — the backend already enforces these; hiding the nav
  // item (and the page's action buttons, see each page) keeps the UI from offering actions
  // that would just come back as a 403.
  const allNavItems: (NavItem & { permission?: string })[] = [
    { href: '/dashboard', label: t.nav.overview, icon: LayoutGrid },
    { href: '/queue', label: t.nav.queue, icon: ListOrdered, permission: 'queue.manage' },
    { href: '/appointments', label: t.nav.appointments, icon: CalendarClock, permission: 'appointments.read' },
    { href: '/visits', label: t.nav.visits, icon: ClipboardList, permission: 'visits.read' },
    { href: '/patients', label: t.nav.patients, icon: Contact, permission: 'patients.read' },
    { href: '/invoices', label: t.nav.invoices, icon: Receipt, permission: 'invoices.read' },
    { href: '/expenses', label: t.nav.expenses, icon: Wallet, permission: 'expenses.read' },
    { href: '/reports', label: t.nav.reports, icon: BarChart3, permission: 'reports.read' },
    { href: '/clinic', label: t.nav.clinic, icon: Settings, permission: 'settings.manage' },
    { href: '/branches', label: t.nav.branches, icon: Building2, permission: 'branches.manage' },
    { href: '/doctors', label: t.nav.doctors, icon: Stethoscope, permission: 'doctors.read' },
    { href: '/staff', label: t.nav.staff, icon: Users, permission: 'staff.read' },
    { href: '/audit-logs', label: t.nav.auditLogs, icon: History, permission: 'audit.read' },
  ];
  const navItems: NavItem[] = allNavItems.filter((item) => !item.permission || hasPermission(item.permission));

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
            <NotificationBell />
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
