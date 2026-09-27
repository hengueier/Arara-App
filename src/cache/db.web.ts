import type { Empresa, VendasDia } from '@/api/schemas';

/**
 * Web fallback: expo-sqlite WASM worker fails to bundle in Expo web.
 * Keep an in-memory + localStorage cache with the same API as native.
 */

const EMPRESAS_KEY = 'arara_mobile_empresas_cache';
const VENDAS_KEY = 'arara_mobile_vendas_dia_cache';

type VendasMap = Record<string, VendasDia>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export async function cacheEmpresas(empresas: Empresa[]): Promise<void> {
  writeJson(EMPRESAS_KEY, empresas);
}

export async function readCachedEmpresas(): Promise<Empresa[]> {
  const list = readJson<Empresa[]>(EMPRESAS_KEY, []);
  return [...list].sort((a, b) => a.nome.localeCompare(b.nome, undefined, { sensitivity: 'base' }));
}

export async function cacheVendasDia(vendas: VendasDia): Promise<void> {
  const map = readJson<VendasMap>(VENDAS_KEY, {});
  map[`${vendas.empresaId}:${vendas.data}`] = vendas;
  writeJson(VENDAS_KEY, map);
}

export async function readCachedVendasDia(
  empresaId: string,
  data?: string,
): Promise<VendasDia | null> {
  const map = readJson<VendasMap>(VENDAS_KEY, {});
  if (data) {
    return map[`${empresaId}:${data}`] ?? null;
  }
  const entries = Object.values(map)
    .filter((row) => row.empresaId === empresaId)
    .sort((a, b) => b.data.localeCompare(a.data));
  return entries[0] ?? null;
}
