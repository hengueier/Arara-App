import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { setUnauthorizedHandler } from '@/api/client';
import { USE_AUTH_BRIDGE } from '@/config/tenants';
import { Brand } from '@/constants/theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useTenantStore } from '@/store/use-tenant-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const authHydrate = useAuthStore((s) => s.hydrate);
  const clearSession = useAuthStore((s) => s.clearSession);

  const tenant = useTenantStore((s) => s.tenant);
  const apiUrl = useTenantStore((s) => s.apiUrl);
  const tenantHydrated = useTenantStore((s) => s.hydrated);
  const tenantHydrate = useTenantStore((s) => s.hydrate);

  const segments = useSegments();
  const router = useRouter();
  const hydrated = authHydrated && tenantHydrated;

  useEffect(() => {
    void Promise.all([authHydrate(), tenantHydrate()]).finally(() => {
      void SplashScreen.hideAsync();
    });
  }, [authHydrate, tenantHydrate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession().then(() => {
        router.replace('/login');
      });
    });
  }, [clearSession, router]);

  useEffect(() => {
    if (!hydrated) return;

    const root = segments[0];
    const inLogin = root === 'login';
    const inTenantSelect = root === 'selecionar-cliente';

    if (USE_AUTH_BRIDGE) {
      if (inTenantSelect) {
        router.replace(token ? '/empresas' : '/login');
        return;
      }
      if (!token && !inLogin) {
        router.replace('/login');
        return;
      }
      if (token && (inLogin || !root)) {
        router.replace('/empresas');
      }
      return;
    }

    if (!tenant && !inTenantSelect) {
      router.replace('/selecionar-cliente');
      return;
    }

    if (tenant && inTenantSelect) {
      router.replace(token ? '/empresas' : '/login');
      return;
    }

    if (!token && tenant && !inLogin && !inTenantSelect) {
      router.replace('/login');
      return;
    }

    if (token && (inLogin || !root)) {
      router.replace('/empresas');
    }
  }, [hydrated, token, tenant, apiUrl, segments, router]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Brand.navy }}>
        <ActivityIndicator color={Brand.white} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Brand.surface },
        headerTintColor: Brand.blueDeep,
        headerTitleStyle: { fontWeight: '700', color: Brand.ink },
        contentStyle: { backgroundColor: Brand.surface },
      }}
    >
      <Stack.Screen name="selecionar-cliente" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="empresas" options={{ title: 'Empresas', headerBackVisible: false }} />
      <Stack.Screen name="empresa/[empresaId]/index" options={{ title: 'Empresa' }} />
      <Stack.Screen name="empresa/[empresaId]/pedido/[pedidoId]" options={{ title: 'Pedido' }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
