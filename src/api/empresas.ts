import { z } from 'zod';

import { getValidated } from '@/api/client';
import { EmpresaSchema, type Empresa } from '@/api/schemas';

export async function fetchEmpresas(): Promise<Empresa[]> {
  return getValidated('/me/empresas', z.array(EmpresaSchema));
}
