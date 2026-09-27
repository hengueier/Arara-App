import { getValidated } from '@/api/client';
import { ProdutosPageSchema, type ProdutosPage } from '@/api/schemas';

export async function fetchProdutos(
  empresaId: string,
  options?: { q?: string; abaixoMinimo?: boolean; page?: number; limit?: number },
): Promise<ProdutosPage> {
  const params: Record<string, string | number | boolean> = {};
  if (options?.q) params.q = options.q;
  if (options?.abaixoMinimo) params.abaixoMinimo = true;
  if (options?.page) params.page = options.page;
  if (options?.limit) params.limit = options.limit;
  return getValidated(`/empresas/${empresaId}/produtos`, ProdutosPageSchema, { params });
}
