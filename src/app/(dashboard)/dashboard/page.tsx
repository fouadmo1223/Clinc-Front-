'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';

export default function DashboardOverviewPage() {
  const { user, isReady } = useRequireAuth();
  if (!isReady || !user) return null;

  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <p className="text-sm font-medium text-primary">Phase 2 complete</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Clinic, branches, doctors, and staff are live, {user.fullName.split(' ')[0]}.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Use the sidebar to manage your clinic profile, branches, doctors, and staff. Scheduling,
        the live queue, medical visits, and billing build on top of this next.
      </p>
    </div>
  );
}
