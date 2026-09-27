import axios from 'axios';
import type { ZodType } from 'zod';

import { defaultApiUrl } from '@/config/tenants';
import { useAuthStore } from '@/store/use-auth-store';
import { useTenantStore } from '@/store/use-tenant-store';

export const api = axios.create({
  baseURL: defaultApiUrl(),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const apiUrl = useTenantStore.getState().apiUrl;
  config.baseURL = apiUrl;

  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export async function getValidated<T>(
  url: string,
  schema: ZodType<T>,
  config?: Parameters<typeof api.get>[1],
): Promise<T> {
  const { data } = await api.get<unknown>(url, config);
  return schema.parse(data);
}

export async function postValidated<TBody, TResponse>(
  url: string,
  body: TBody,
  schema: ZodType<TResponse>,
  config?: Parameters<typeof api.post>[2],
): Promise<TResponse> {
  const { data } = await api.post<unknown>(url, body, config);
  return schema.parse(data);
}
