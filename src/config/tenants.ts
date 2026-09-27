export type Tenant = {
  id: string;
  nome: string;
  host: string;
  protocol: 'https' | 'http';
  port?: number;
};

/**
 * Registro legado (picker de cliente).
 * Em produção o app usa a auth-bridge (`EXPO_PUBLIC_BRIDGE_URL`) e esta lista
 * não é consultada. Mantenha apenas exemplos — sem hosts reais de clientes.
 */
const ALL_TENANTS: Tenant[] = [
  {
    id: 'demo-hml',
    nome: 'Demo Homologação',
    host: 'localhost',
    protocol: 'http',
    port: 8081,
  },
];

const TEST_SHIP_TENANT_IDS = ['demo-hml'];

function parseTenantIds(raw: string | undefined, fallback: string[]): string[] {
  if (!raw?.trim()) return fallback;
  return raw.split(',').map((id) => id.trim()).filter(Boolean);
}

const availableIds = parseTenantIds(
  process.env.EXPO_PUBLIC_AVAILABLE_TENANTS,
  TEST_SHIP_TENANT_IDS,
);

/** Tenants exposed in the app for the current build (legacy picker). */
export const TENANTS: Tenant[] = ALL_TENANTS.filter((t) => availableIds.includes(t.id));

export const DEFAULT_TENANT_ID =
  process.env.EXPO_PUBLIC_DEFAULT_TENANT ?? availableIds[0] ?? 'demo-hml';

/**
 * Auth bridge base URL (no path). When set, login uses user@slug discovery
 * and the client picker is skipped.
 */
export const BRIDGE_URL = (process.env.EXPO_PUBLIC_BRIDGE_URL ?? '').replace(/\/$/, '');

export const USE_AUTH_BRIDGE = Boolean(BRIDGE_URL);

/** When true, the picker is skipped and tenant switching is hidden. */
export const TENANT_SELECTION_LOCKED = USE_AUTH_BRIDGE || TENANTS.length <= 1;

export function tenantApiUrl(tenant: Tenant): string {
  const portSuffix =
    tenant.port != null ? `:${tenant.port}` : tenant.protocol === 'https' ? '' : '';
  return `${tenant.protocol}://${tenant.host}${portSuffix}/sgc/meuarara`;
}

export function findTenantById(id: string): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}

export function getDefaultTenant(): Tenant | undefined {
  return findTenantById(DEFAULT_TENANT_ID) ?? TENANTS[0];
}

export function defaultApiUrl(): string {
  if (USE_AUTH_BRIDGE) {
    return process.env.EXPO_PUBLIC_API_URL ?? '';
  }
  const tenant = getDefaultTenant();
  if (tenant) return tenantApiUrl(tenant);
  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081/sgc/meuarara';
}

export function bridgeLoginUrl(): string {
  return `${BRIDGE_URL}/auth/login`;
}
