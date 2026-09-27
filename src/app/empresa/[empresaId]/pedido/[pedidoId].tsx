import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fetchPedidoDetalhe } from '@/api/pedidos';
import type { PedidoDetalhe } from '@/api/schemas';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { formatDateTime, formatMoney } from '@/utils/dates';

export default function PedidoDetalheScreen() {
  const params = useLocalSearchParams<{ empresaId: string; pedidoId: string }>();
  const empresaId = String(params.empresaId);
  const pedidoId = String(params.pedidoId);

  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchPedidoDetalhe(empresaId, pedidoId);
      setPedido(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar pedido');
    } finally {
      setRefreshing(false);
    }
  }, [empresaId, pedidoId]);

  useEffect(() => {
    // Data loading updates local state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (!pedido && refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.blue} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load()} tintColor={Brand.blue} />
      }
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {pedido ? (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>{pedido.situacao ?? 'Pedido'}</Text>
            <Text style={styles.title}>#{pedido.codigoPedido}</Text>
            <Text style={styles.meta}>{formatDateTime(pedido.dataFaturamento)}</Text>
            <Text style={styles.meta}>{pedido.clienteNome ?? 'Cliente não informado'}</Text>
            {pedido.vendedorNome ? <Text style={styles.meta}>Vendedor: {pedido.vendedorNome}</Text> : null}
            <Text style={styles.total}>{formatMoney(pedido.totalLiquido)}</Text>
          </View>

          <Text style={styles.sectionTitle}>Itens</Text>
          {pedido.itens.length === 0 ? (
            <Text style={styles.empty}>Nenhum item.</Text>
          ) : (
            pedido.itens.map((item, index) => (
              <View key={`${item.produtoId ?? item.codigo}-${index}`} style={styles.rowCard}>
                <Text style={styles.rowCode} numberOfLines={2}>
                  {item.descricao ?? item.codigo ?? 'Item'}
                </Text>
                <Text style={styles.meta}>
                  {item.quantidade} × {formatMoney(item.valorUnitario)}
                  {item.desconto > 0 ? ` · desc. ${formatMoney(item.desconto)}` : ''}
                </Text>
                <Text style={styles.rowValue}>{formatMoney(item.total)}</Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Pagamentos</Text>
          {pedido.pagamentos.length === 0 ? (
            <Text style={styles.empty}>Nenhuma forma de pagamento.</Text>
          ) : (
            pedido.pagamentos.map((pagamento, index) => (
              <View key={`${pagamento.tipoCobranca}-${index}`} style={styles.rowCard}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowCode}>{pagamento.tipoCobranca ?? 'Cobrança'}</Text>
                  <Text style={styles.rowValue}>{formatMoney(pagamento.valorCobranca)}</Text>
                </View>
              </View>
            ))
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.surface },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
  },
  headerCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Spacing.three,
    gap: 4,
    marginBottom: Spacing.two,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.ink,
  },
  total: {
    marginTop: Spacing.two,
    fontSize: 20,
    fontWeight: '700',
    color: Brand.blueDeep,
  },
  sectionTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    fontSize: 16,
    fontWeight: '700',
    color: Brand.ink,
  },
  rowCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Spacing.three,
    gap: 4,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  rowCode: { fontSize: 15, fontWeight: '700', color: Brand.ink, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: '700', color: Brand.blueDeep },
  meta: { fontSize: 12, color: Brand.muted },
  empty: { color: Brand.muted, fontSize: 13, paddingVertical: Spacing.two },
  error: { color: Brand.danger, fontSize: 13, marginBottom: Spacing.two },
});
