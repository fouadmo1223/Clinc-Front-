import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'SUPER_ADMIN' | 'CLINIC_OWNER' | 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'ACCOUNTANT';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  clinicId: string | null;
  branchIds: string[];
  preferredLanguage: 'en' | 'ar';
  avatarUrl?: string;
  permissions: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  /** True once zustand/persist has finished reading localStorage. Every
   * redirect-on-missing-session check must wait for this — persist rehydrates
   * asynchronously, so accessToken is still null for a tick even when a
   * valid session exists in storage, which was causing a spurious bounce to
   * /login on every fresh page load despite a valid saved session. */
  hasHydrated: boolean;
  setSession: (accessToken: string, refreshToken: string, user: SessionUser) => void;
  setAccessToken: (accessToken: string) => void;
  setHasHydrated: (value: boolean) => void;
  clear: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setSession: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'clinic-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
