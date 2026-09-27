import { Redirect } from 'expo-router';

import { USE_AUTH_BRIDGE } from '@/config/tenants';
import { useAuthStore } from '@/store/use-auth-store';
import { useTenantStore } from '@/store/use-tenant-store';

/** Entry redirect — auth gate lives in `_layout`. */
export default function Index() {
  const token = useAuthStore((s) => s.token);
  const tenant = useTenantStore((s) => s.tenant);

  if (USE_AUTH_BRIDGE) {
    if (!token) return <Redirect href="/login" />;
    return <Redirect href="/empresas" />;
  }

  if (!tenant) return <Redirect href="/selecionar-cliente" />;
  if (!token) return <Redirect href="/login" />;
  return <Redirect href="/empresas" />;
}
