import { getValidated } from '@/api/client';
import {
  FinanceiroResumoSchema,
  TitulosReceberPageSchema,
  type FinanceiroResumo,
  type TitulosReceberPage,
} from '@/api/schemas';

export async function fetchFinanceiroResumo(
  empresaId: string,
  de: string,
  ate: string,
): Promise<FinanceiroResumo> {
  return getValidated(`/empresas/${empresaId}/financeiro/resumo`, FinanceiroResumoSchema, {
    params: { de, ate },
  });
}

export async function fetchTitulosReceber(
  empresaId: string,
  de: string,
  ate: string,
  options?: { page?: number; limit?: number },
): Promise<TitulosReceberPage> {
  const params: Record<string, string | number> = { de, ate };
  if (options?.page) params.page = options.page;
  if (options?.limit) params.limit = options.limit;
  return getValidated(`/empresas/${empresaId}/financeiro/receber`, TitulosReceberPageSchema, {
    params,
  });
}
