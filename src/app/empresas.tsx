import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchEmpresas } from '@/api/empresas';
import type { Empresa } from '@/api/schemas';
import { cacheEmpresas, readCachedEmpresas } from '@/cache/db';
import { TENANT_SELECTION_LOCKED, USE_AUTH_BRIDGE } from '@/config/tenants';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useTenantStore } from '@/store/use-tenant-store';

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function EmpresasScreen() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const clearTenant = useTenantStore((s) => s.clearTenant);
  const tenant = useTenantStore((s) => s.tenant);
  const setEmpresas = useAuthStore((s) => s.setEmpresas);
  const nome = useAuthStore((s) => s.nome);
  const [items, setItems] = useState<Empresa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const cached = await readCachedEmpresas();
      if (cached.length) {
        setItems(cached);
        setFromCache(true);
      }
      const fresh = await fetchEmpresas();
      setItems(fresh);
      setEmpresas(fresh);
      await cacheEmpresas(fresh);
      setFromCache(false);
    } catch (err) {
      const cached = await readCachedEmpresas();
      if (cached.length) {
        setItems(cached);
        setFromCache(true);
      }
      setError(err instanceof Error ? err.message : 'Falha ao carregar empresas');
    } finally {
      setRefreshing(false);
    }
  }, [setEmpresas]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const firstName = nome?.trim().split(/\s+/)[0];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Meu Arara</Text>
          <Text style={styles.hello}>Olá{firstName ? `, ${firstName}` : ''}</Text>
          <Text style={styles.sub}>
            {USE_AUTH_BRIDGE ? 'Escolha a empresa para consultar' : `${tenant ? `${tenant.nome} · ` : ''}Escolha a empresa para consultar`}
          </Text>
          {fromCache ? <Text style={styles.cache}>Dados em cache · puxe para atualizar</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load()}
              tintColor={Brand.blue}
              colors={[Brand.blue]}
            />
          }
          ListEmptyComponent={
            !refreshing ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhuma empresa</Text>
                <Text style={styles.emptyHint}>
                  Seu usuário não tem acesso ativo a empresas no SGC.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/empresa/[empresaId]',
                  params: { empresaId: item.id, empresaNome: item.nome },
                })
              }
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(item.nome)}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.nome}
                </Text>
                <Text style={styles.rowMeta}>Consultar dados</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />

        <Pressable
          onPress={() => {
            void clearSession();
            if (USE_AUTH_BRIDGE) {
              void clearTenant();
              router.replace('/login');
              return;
            }
            if (!TENANT_SELECTION_LOCKED) {
              void clearTenant();
              router.replace('/selecionar-cliente');
              return;
            }
            router.replace('/login');
          }}
          style={styles.logout}
        >
          <Text style={styles.logoutText}>
            {USE_AUTH_BRIDGE || TENANT_SELECTION_LOCKED ? 'Sair' : 'Sair e trocar cliente'}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.surface },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hello: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: Brand.muted,
    marginTop: 2,
  },
  cache: {
    marginTop: Spacing.two,
    fontSize: 12,
    color: Brand.blueMid,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  rowPressed: {
    backgroundColor: '#eef4fa',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.blueDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontWeight: '700',
    fontSize: 14,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Brand.ink,
  },
  rowMeta: {
    fontSize: 12,
    color: Brand.muted,
  },
  chevron: {
    fontSize: 26,
    color: Brand.muted,
    lineHeight: 28,
  },
  empty: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.ink,
  },
  emptyHint: {
    fontSize: 13,
    color: Brand.muted,
    textAlign: 'center',
  },
  logout: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.white,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: Brand.muted,
    fontWeight: '600',
  },
  error: { color: Brand.danger, fontSize: 13, marginTop: 4 },
});
