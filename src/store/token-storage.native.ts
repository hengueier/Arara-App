import * as SecureStore from 'expo-secure-store';

export async function saveToken(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function readToken(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function clearToken(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
