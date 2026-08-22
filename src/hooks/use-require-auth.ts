'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useRequireAuth() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return; // don't bounce to /login before the saved session has loaded
    if (!accessToken) router.replace('/login');
  }, [accessToken, hasHydrated, router]);

  return { user, isReady: hasHydrated && !!accessToken };
}
