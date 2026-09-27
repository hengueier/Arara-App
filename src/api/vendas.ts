import { getValidated } from '@/api/client';
import { VendasDiaSchema, type VendasDia } from '@/api/schemas';

export async function fetchVendasDia(empresaId: string, data?: string): Promise<VendasDia> {
  const query = data ? `?data=${encodeURIComponent(data)}` : '';
  return getValidated(`/empresas/${empresaId}/vendas-dia${query}`, VendasDiaSchema);
}
