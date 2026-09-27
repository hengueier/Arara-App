import * as SecureStore from 'expo-secure-store';

export async function saveTenantId(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function readTenantId(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function clearTenantId(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
