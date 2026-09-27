import { create } from 'zustand';

import {
  BRIDGE_URL,
  defaultApiUrl,
  findTenantById,
  getDefaultTenant,
  TENANT_SELECTION_LOCKED,
  tenantApiUrl,
  USE_AUTH_BRIDGE,
  type Tenant,
} from '@/config/tenants';
import { clearTenantId, readTenantId, saveTenantId } from '@/store/tenant-storage';

const TENANT_KEY = 'arara_mobile_tenant';
const API_URL_KEY = 'arara_mobile_api_url';

type TenantState = {
  tenant: Tenant | null;
  hydrated: boolean;
  apiUrl: string;
  setTenant: (tenant: Tenant) => Promise<void>;
  setApiUrl: (apiUrl: string) => Promise<void>;
  clearTenant: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  hydrated: false,
  apiUrl: defaultApiUrl(),

  setTenant: async (tenant) => {
    await saveTenantId(TENANT_KEY, tenant.id);
    const apiUrl = tenantApiUrl(tenant);
    await saveTenantId(API_URL_KEY, apiUrl);
    set({ tenant, apiUrl });
  },

  setApiUrl: async (apiUrl) => {
    const normalized = apiUrl.replace(/\/$/, '');
    await saveTenantId(API_URL_KEY, normalized);
    set({ apiUrl: normalized });
  },

  clearTenant: async () => {
    await clearTenantId(TENANT_KEY);
    await clearTenantId(API_URL_KEY);
    set({ tenant: null, apiUrl: defaultApiUrl() });
  },

  hydrate: async () => {
    try {
      if (USE_AUTH_BRIDGE) {
        const savedApi = await readTenantId(API_URL_KEY);
        set({
          tenant: null,
          apiUrl: savedApi || defaultApiUrl() || BRIDGE_URL,
          hydrated: true,
        });
        return;
      }

      const id = await readTenantId(TENANT_KEY);
      let tenant = id ? findTenantById(id) : null;

      if (id && !tenant) {
        await clearTenantId(TENANT_KEY);
      }

      if (!tenant && TENANT_SELECTION_LOCKED) {
        tenant = getDefaultTenant() ?? null;
        if (tenant) {
          await saveTenantId(TENANT_KEY, tenant.id);
        }
      }

      const savedApi = await readTenantId(API_URL_KEY);
      set({
        tenant: tenant ?? null,
        apiUrl: savedApi || (tenant ? tenantApiUrl(tenant) : defaultApiUrl()),
        hydrated: true,
      });
    } catch {
      set({ tenant: null, apiUrl: defaultApiUrl(), hydrated: true });
    }
  },
}));
