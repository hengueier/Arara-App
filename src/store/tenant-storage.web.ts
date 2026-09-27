export async function saveTenantId(key: string, value: string): Promise<void> {
  localStorage.setItem(key, value);
}

export async function readTenantId(key: string): Promise<string | null> {
  return localStorage.getItem(key);
}

export async function clearTenantId(key: string): Promise<void> {
  localStorage.removeItem(key);
}
