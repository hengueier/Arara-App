import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TENANTS } from '@/config/tenants';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTenantStore } from '@/store/use-tenant-store';

export default function SelecionarClienteScreen() {
  const router = useRouter();
  const setTenant = useTenantStore((s) => s.setTenant);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const onSelect = async (tenant: (typeof TENANTS)[number]) => {
    setLoadingId(tenant.id);
    try {
      await setTenant(tenant);
      router.replace('/login');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Meu Arara</Text>
          <Text style={styles.title}>Selecione o cliente</Text>
          <Text style={styles.sub}>
            Cada loja possui seu próprio servidor SGC. Escolha onde deseja entrar.
          </Text>
        </View>

        <FlatList
          data={TENANTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const loading = loadingId === item.id;
            return (
              <Pressable
                onPress={() => void onSelect(item)}
                disabled={loadingId != null}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{item.nome}</Text>
                  <Text style={styles.rowMeta}>{item.host}</Text>
                </View>
                {loading ? (
                  <ActivityIndicator color={Brand.blue} />
                ) : (
                  <Text style={styles.chevron}>›</Text>
                )}
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.surface },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: 6,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 14,
    color: Brand.muted,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
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
  rowPressed: { backgroundColor: '#eef4fa' },
  rowBody: { flex: 1, gap: 4 },
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
});
