import { usePatientAuthStore } from '@/stores/patient-auth-store';
import { ApiError } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

/** No refresh flow — the patient token is short-lived (30 min); a 401 just clears the session and sends them back to login. */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = usePatientAuthStore.getState().accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401 && auth) {
    usePatientAuthStore.getState().clear();
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? res.statusText ?? 'Request failed');
  }
  return body as T;
}

export const patientApi = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
};
