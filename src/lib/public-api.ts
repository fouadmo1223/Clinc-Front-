import { ApiError } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** No auth at all — used by the fully public marketing/landing page. */
async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) throw new ApiError(res.status, body?.message ?? res.statusText ?? 'Request failed');
  return body as T;
}

export const publicApi = {
  get: <T>(path: string) => request<T>(path),
};
