import { getValidated } from '@/api/client';
import {
  PedidoDetalheSchema,
  PedidosPageSchema,
  type PedidoDetalhe,
  type PedidosPage,
} from '@/api/schemas';

export async function fetchPedidos(
  empresaId: string,
  options?: { data?: string; de?: string; ate?: string; page?: number; limit?: number },
): Promise<PedidosPage> {
  const params: Record<string, string | number> = {};
  if (options?.de) params.de = options.de;
  if (options?.ate) params.ate = options.ate;
  if (options?.data && !options.de && !options.ate) params.data = options.data;
  if (options?.page) params.page = options.page;
  if (options?.limit) params.limit = options.limit;
  return getValidated(`/empresas/${empresaId}/pedidos`, PedidosPageSchema, { params });
}

export async function fetchPedidoDetalhe(empresaId: string, pedidoId: string): Promise<PedidoDetalhe> {
  return getValidated(`/empresas/${empresaId}/pedidos/${pedidoId}`, PedidoDetalheSchema);
}
