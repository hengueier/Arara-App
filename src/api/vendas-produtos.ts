import { getValidated } from '@/api/client';
import { ProdutosVendidosSchema, type ProdutosVendidos } from '@/api/schemas';

export async function fetchProdutosVendidos(
  empresaId: string,
  de: string,
  ate: string,
  limit = 10,
): Promise<ProdutosVendidos> {
  return getValidated(`/empresas/${empresaId}/vendas/produtos`, ProdutosVendidosSchema, {
    params: { de, ate, limit },
  });
}
