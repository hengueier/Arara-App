import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchFinanceiroResumo, fetchTitulosReceber } from '@/api/financeiro';
import { fetchPedidos } from '@/api/pedidos';
import { fetchProdutos } from '@/api/produtos';
import type {
  FinanceiroResumo,
  PedidoResumo,
  ProdutoResumo,
  ProdutoVendido,
  TituloReceber,
  VendasDia,
  VendasPeriodo,
} from '@/api/schemas';
import { fetchVendasDia } from '@/api/vendas';
import { fetchProdutosVendidos } from '@/api/vendas-produtos';
import { fetchVendasPeriodo } from '@/api/vendas-periodo';
import { MetricCard } from '@/components/metric-card';
import { PeriodFilter } from '@/components/period-filter';
import { Brand, Radius, Spacing } from '@/constants/theme';
import {
  formatDateTime,
  formatMoney,
  formatRangeLabel,
  isHoje,
  presetSelection,
  resolvePeriod,
  type PeriodSelection,
} from '@/utils/dates';

type TabId = 'dashboard' | 'pedidos' | 'estoque' | 'financeiro';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'financeiro', label: 'Financeiro' },
];

export default function EmpresaHubScreen() {
  const params = useLocalSearchParams<{ empresaId: string; empresaNome?: string }>();
  const empresaId = String(params.empresaId);
  const empresaNome = params.empresaNome ? String(params.empresaNome) : 'Empresa';
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Consulta</Text>
        <Text style={styles.empresa}>{empresaNome}</Text>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.panel}>
        {tab === 'dashboard' ? <DashboardTab empresaId={empresaId} /> : null}
        {tab === 'pedidos' ? <PedidosTab empresaId={empresaId} empresaNome={empresaNome} /> : null}
        {tab === 'estoque' ? <EstoqueTab empresaId={empresaId} /> : null}
        {tab === 'financeiro' ? <FinanceiroTab empresaId={empresaId} /> : null}
      </View>
    </View>
  );
}

function DashboardTab({ empresaId }: { empresaId: string }) {
  const [period, setPeriod] = useState<PeriodSelection>(presetSelection('hoje'));
  const [vendasDia, setVendasDia] = useState<VendasDia | null>(null);
  const [vendasPeriodo, setVendasPeriodo] = useState<VendasPeriodo | null>(null);
  const [ranking, setRanking] = useState<ProdutoVendido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { de, ate } = resolvePeriod(period);
      const [dia, periodo, produtos] = await Promise.all([
        fetchVendasDia(empresaId, ate),
        fetchVendasPeriodo(empresaId, de, ate),
        fetchProdutosVendidos(empresaId, de, ate, 10),
      ]);
      setVendasDia(dia);
      setVendasPeriodo(periodo);
      setRanking(produtos.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [empresaId, period]);

  useEffect(() => {
    // Data loading updates local state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load()} tintColor={Brand.blue} />
      }
      contentContainerStyle={styles.scrollContent}
    >
      <PeriodFilter value={period} onChange={setPeriod} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <MetricCard
        label={isHoje(period) ? 'Total líquido hoje' : 'Total líquido no período'}
        value={formatMoney(isHoje(period) ? (vendasDia?.total ?? 0) : (vendasPeriodo?.totalLiquido ?? 0))}
        variant="primary"
      />
      <View style={styles.metricRow}>
        <MetricCard
          label="Pedidos faturados"
          value={String(
            isHoje(period) ? (vendasDia?.quantidade ?? '—') : (vendasPeriodo?.quantidadeTotal ?? '—'),
          )}
          size="compact"
          style={styles.metricHalf}
        />
        <MetricCard
          label="Referência"
          value={formatRangeLabel(vendasPeriodo?.de, vendasPeriodo?.ate)}
          size="compact"
          style={styles.metricHalf}
        />
      </View>

      {vendasPeriodo && vendasPeriodo.serie.length > 1 ? (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Vendas por dia</Text>
          {vendasPeriodo.serie.map((item) => (
            <View key={item.data} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatRangeLabel(item.data, item.data)}</Text>
              <Text style={styles.tableCellRight}>{item.quantidade} ped.</Text>
              <Text style={styles.tableCellRight}>{formatMoney(item.total)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Top produtos</Text>
        {ranking.length === 0 ? (
          <Text style={styles.emptyInline}>Nenhum produto vendido no período.</Text>
        ) : (
          ranking.map((item, index) => (
            <View key={`${item.produtoId ?? item.codigo}-${index}`} style={styles.tableRow}>
              <Text style={styles.rankIndex}>{index + 1}</Text>
              <View style={styles.rankBody}>
                <Text style={styles.tableCell} numberOfLines={2}>
                  {item.descricao ?? item.codigo ?? 'Produto'}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.quantidade} un. · {formatMoney(item.totalLiquido)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function PedidosTab({ empresaId, empresaNome }: { empresaId: string; empresaNome: string }) {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodSelection>(presetSelection('hoje'));
  const [items, setItems] = useState<PedidoResumo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = 1, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const { de, ate } = resolvePeriod(period);
        const result = await fetchPedidos(empresaId, { de, ate, page: nextPage, limit: 30 });
        setTotal(result.total);
        setPage(result.page);
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    },
    [empresaId, period],
  );

  useEffect(() => {
    // Data loading updates local state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1, false);
  }, [load]);

  const hasMore = items.length < total;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => void load(1, false)} tintColor={Brand.blue} />
      }
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <PeriodFilter value={period} onChange={setPeriod} />
          <Text style={styles.listTitle}>Pedidos faturados</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhum pedido no período.</Text> : null}
      ListFooterComponent={
        hasMore ? (
          <Pressable
            onPress={() => void load(page + 1, true)}
            style={styles.loadMore}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Brand.blue} />
            ) : (
              <Text style={styles.loadMoreText}>Carregar mais</Text>
            )}
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.rowCard}
          onPress={() =>
            router.push({
              pathname: '/empresa/[empresaId]/pedido/[pedidoId]',
              params: { empresaId, pedidoId: item.id, empresaNome },
            })
          }
        >
          <View style={styles.rowTop}>
            <Text style={styles.rowCode}>#{item.codigoPedido}</Text>
            <Text style={styles.rowValue}>{formatMoney(item.totalLiquido)}</Text>
          </View>
          <Text style={styles.rowMeta}>{item.clienteNome ?? 'Cliente não informado'}</Text>
          <Text style={styles.rowMeta}>
            {formatDateTime(item.dataFaturamento)}
            {item.vendedorNome ? ` · ${item.vendedorNome}` : ''}
          </Text>
        </Pressable>
      )}
    />
  );
}

function EstoqueTab({ empresaId }: { empresaId: string }) {
  const [query, setQuery] = useState('');
  const [apenasCriticos, setApenasCriticos] = useState(false);
  const [items, setItems] = useState<ProdutoResumo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = 1, append = false, search = query) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProdutos(empresaId, {
          q: search.trim() || undefined,
          abaixoMinimo: apenasCriticos || undefined,
          page: nextPage,
          limit: 30,
        });
        setTotal(result.total);
        setPage(result.page);
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar estoque');
      } finally {
        setLoading(false);
      }
    },
    [empresaId, query, apenasCriticos],
  );

  useEffect(() => {
    // Data loading updates local state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1, false, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when empresa or filter changes
  }, [empresaId, apenasCriticos]);

  return (
    <View style={styles.panelFill}>
      <TextInput
        placeholder="Buscar por código, barras ou descrição"
        placeholderTextColor={Brand.muted}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => void load(1, false, query)}
        style={styles.search}
      />
      <View style={styles.filterRow}>
        <Pressable onPress={() => void load(1, false, query)} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </Pressable>
        <Pressable
          onPress={() => setApenasCriticos((v) => !v)}
          style={[styles.filterChip, apenasCriticos && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, apenasCriticos && styles.filterChipTextActive]}>
            Só críticos
          </Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void load(1, false)} tintColor={Brand.blue} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>Nenhum produto encontrado.</Text>
          ) : (
            <ActivityIndicator color={Brand.blue} style={{ marginTop: Spacing.four }} />
          )
        }
        ListFooterComponent={
          items.length < total ? (
            <Pressable
              onPress={() => void load(page + 1, true)}
              style={styles.loadMore}
              disabled={loading}
            >
              <Text style={styles.loadMoreText}>Carregar mais</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.rowCard, item.abaixoMinimo ? styles.rowCardAlert : null]}>
            <Text style={styles.rowCode} numberOfLines={2}>
              {item.descricao}
            </Text>
            <Text style={styles.rowMeta}>
              Cód. {item.codigo ?? '—'}
              {item.codigoBarra ? ` · EAN ${item.codigoBarra}` : ''}
            </Text>
            <View style={styles.estoqueMeta}>
              <Text style={styles.rowValueInline}>Estoque: {item.quantidadeEstoque}</Text>
              <Text style={styles.rowMeta}>
                Mín: {item.estoqueMinimo ?? 0}
                {item.precoVenda != null ? ` · ${formatMoney(item.precoVenda)}` : ''}
              </Text>
            </View>
            {item.abaixoMinimo ? <Text style={styles.alertBadge}>Abaixo do mínimo</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

function FinanceiroTab({ empresaId }: { empresaId: string }) {
  const [period, setPeriod] = useState<PeriodSelection>(presetSelection('mes'));
  const [data, setData] = useState<FinanceiroResumo | null>(null);
  const [titulos, setTitulos] = useState<TituloReceber[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (nextPage = 1, append = false) => {
      if (nextPage === 1) setRefreshing(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const { de, ate } = resolvePeriod(period);
        const [resumo, receber] = await Promise.all([
          fetchFinanceiroResumo(empresaId, de, ate),
          fetchTitulosReceber(empresaId, de, ate, { page: nextPage, limit: 20 }),
        ]);
        setData(resumo);
        setTotal(receber.total);
        setPage(receber.page);
        setTitulos((prev) => (append ? [...prev, ...receber.items] : receber.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar financeiro');
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [empresaId, period],
  );

  useEffect(() => {
    // Data loading updates local state after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1, false);
  }, [load]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load(1, false)} tintColor={Brand.blue} />
      }
      contentContainerStyle={styles.scrollContent}
    >
      <PeriodFilter value={period} onChange={setPeriod} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <MetricCard label="A receber (em aberto)" value={formatMoney(data?.totalReceber ?? 0)} variant="primary" />
      <MetricCard label="A pagar (em aberto)" value={formatMoney(data?.totalPagar ?? 0)} />
      <MetricCard label="Saldo fluxo de caixa" value={formatMoney(data?.saldoFluxoCaixa ?? 0)} />

      <Text style={styles.listTitle}>Títulos a receber</Text>
      {titulos.length === 0 && !refreshing ? (
        <Text style={styles.emptyInline}>Nenhum título em aberto no período.</Text>
      ) : (
        titulos.map((item) => (
          <View key={item.id} style={[styles.rowCard, item.atrasado ? styles.rowCardAlert : null]}>
            <View style={styles.rowTop}>
              <Text style={styles.rowCode} numberOfLines={1}>
                {item.documento ?? 'Sem documento'}
              </Text>
              <Text style={styles.rowValue}>{formatMoney(item.valor)}</Text>
            </View>
            <Text style={styles.rowMeta}>{item.pessoaNome ?? 'Pessoa não informada'}</Text>
            <Text style={styles.rowMeta}>
              Venc. {formatDateTime(item.vencimento)}
              {item.tipoCobranca ? ` · ${item.tipoCobranca}` : ''}
            </Text>
            {item.atrasado ? <Text style={styles.alertBadge}>Atrasado</Text> : null}
          </View>
        ))
      )}

      {titulos.length < total ? (
        <Pressable
          onPress={() => void load(page + 1, true)}
          style={styles.loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator color={Brand.blue} />
          ) : (
            <Text style={styles.loadMoreText}>Carregar mais</Text>
          )}
        </Pressable>
      ) : null}

      <Text style={styles.footer}>
        Período: {data?.de ?? '—'} até {data?.ate ?? '—'} · valores read-only do SGC
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.surface },
  hero: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.blue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  empresa: {
    fontSize: 22,
    fontWeight: '700',
    color: Brand.ink,
  },
  tabsWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabs: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  tab: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabActive: {
    backgroundColor: Brand.blueDeep,
    borderColor: Brand.blueDeep,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.muted,
  },
  tabTextActive: {
    color: Brand.white,
  },
  panel: { flex: 1 },
  panelFill: { flex: 1, paddingHorizontal: Spacing.four, gap: Spacing.two },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricHalf: { flex: 1 },
  tableCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.ink,
  },
  tableRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Brand.line,
    paddingTop: Spacing.two,
    alignItems: 'flex-start',
  },
  tableCell: { flex: 1, fontSize: 13, color: Brand.ink },
  tableCellRight: { fontSize: 13, color: Brand.muted, minWidth: 72, textAlign: 'right' },
  rankIndex: {
    width: 22,
    fontSize: 13,
    fontWeight: '700',
    color: Brand.blueDeep,
    marginTop: 2,
  },
  rankBody: { flex: 1, gap: 2 },
  listContent: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  listHeader: { gap: Spacing.two, marginBottom: Spacing.two },
  listTitle: { fontSize: 16, fontWeight: '700', color: Brand.ink },
  rowCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Spacing.three,
    gap: 4,
  },
  rowCardAlert: {
    borderColor: '#f0b4b4',
    backgroundColor: '#fff8f8',
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  rowCode: { fontSize: 15, fontWeight: '700', color: Brand.ink, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: '700', color: Brand.blueDeep },
  rowValueInline: { fontSize: 14, fontWeight: '700', color: Brand.blueDeep, marginTop: 4 },
  rowMeta: { fontSize: 12, color: Brand.muted },
  estoqueMeta: { gap: 2, marginTop: 2 },
  alertBadge: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: Brand.danger,
  },
  search: {
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.ink,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchButton: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.blue,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: { color: Brand.white, fontWeight: '700' },
  filterChip: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: Brand.blueDeep,
    borderColor: Brand.blueDeep,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Brand.muted },
  filterChipTextActive: { color: Brand.white },
  loadMore: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  loadMoreText: { color: Brand.blue, fontWeight: '700' },
  empty: { textAlign: 'center', color: Brand.muted, padding: Spacing.four },
  emptyInline: { color: Brand.muted, fontSize: 13 },
  footer: { fontSize: 12, color: Brand.muted, lineHeight: 18 },
  error: { color: Brand.danger, fontSize: 13 },
});
