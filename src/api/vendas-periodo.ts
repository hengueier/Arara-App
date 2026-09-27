import { getValidated } from '@/api/client';
import { VendasPeriodoSchema, type VendasPeriodo } from '@/api/schemas';

export async function fetchVendasPeriodo(
  empresaId: string,
  de: string,
  ate: string,
): Promise<VendasPeriodo> {
  return getValidated(`/empresas/${empresaId}/vendas-periodo`, VendasPeriodoSchema, {
    params: { de, ate },
  });
}
