import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PortalPatient {
  id: string;
  fullName: string;
  clinicName: string;
}

interface PatientAuthState {
  accessToken: string | null;
  patient: PortalPatient | null;
  clinicSlug: string | null;
  hasHydrated: boolean;
  setSession: (accessToken: string, patient: PortalPatient, clinicSlug: string) => void;
  setHasHydrated: (value: boolean) => void;
  clear: () => void;
}

/**
 * Deliberately separate from useAuthStore (staff/doctor session) — different localStorage
 * key, different token audience, never mixed. A patient and a staff member could be using
 * the same browser at the same time.
 */
export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      patient: null,
      clinicSlug: null,
      hasHydrated: false,
      setSession: (accessToken, patient, clinicSlug) => set({ accessToken, patient, clinicSlug }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clear: () => set({ accessToken: null, patient: null }),
    }),
    {
      name: 'patient-portal-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
