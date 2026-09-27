import { z } from 'zod';

export const EmpresaSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  pessoaId: z.string(),
  nome: z.string().nullable().optional(),
  user: z.string(),
  empresas: z.array(EmpresaSchema),
  apiUrl: z.string().optional(),
});

export const VendasDiaSchema = z.object({
  empresaId: z.string(),
  data: z.string(),
  quantidade: z.coerce.number(),
  total: z.coerce.number(),
});

export const PedidoResumoSchema = z.object({
  id: z.string(),
  codigoPedido: z.string(),
  dataFaturamento: z.union([z.string(), z.number()]).optional(),
  clienteNome: z.string().nullable().optional(),
  totalLiquido: z.coerce.number(),
  vendedorNome: z.string().nullable().optional(),
});

export const PedidosPageSchema = z.object({
  items: z.array(PedidoResumoSchema),
  page: z.coerce.number(),
  limit: z.coerce.number(),
  total: z.coerce.number(),
});

export const PedidoItemSchema = z.object({
  produtoId: z.string().nullable().optional(),
  codigo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  quantidade: z.coerce.number(),
  valorUnitario: z.coerce.number(),
  desconto: z.coerce.number(),
  total: z.coerce.number(),
});

export const PedidoPagamentoSchema = z.object({
  tipoCobranca: z.string().nullable().optional(),
  valorCobranca: z.coerce.number(),
});

export const PedidoDetalheSchema = z.object({
  id: z.string(),
  codigoPedido: z.string(),
  dataFaturamento: z.union([z.string(), z.number()]).optional(),
  clienteNome: z.string().nullable().optional(),
  vendedorNome: z.string().nullable().optional(),
  situacao: z.string().nullable().optional(),
  totalLiquido: z.coerce.number(),
  itens: z.array(PedidoItemSchema),
  pagamentos: z.array(PedidoPagamentoSchema),
});

export const VendasDiaSerieSchema = z.object({
  data: z.string(),
  quantidade: z.coerce.number(),
  total: z.coerce.number(),
});

export const VendasPeriodoSchema = z.object({
  empresaId: z.string(),
  de: z.string(),
  ate: z.string(),
  quantidadeTotal: z.coerce.number(),
  totalLiquido: z.coerce.number(),
  serie: z.array(VendasDiaSerieSchema),
});

export const ProdutoResumoSchema = z.object({
  id: z.string(),
  codigo: z.string().nullable().optional(),
  codigoBarra: z.string().nullable().optional(),
  descricao: z.string(),
  quantidadeEstoque: z.coerce.number(),
  precoVenda: z.coerce.number().nullable().optional(),
  estoqueMinimo: z.coerce.number().nullable().optional(),
  abaixoMinimo: z.boolean().nullable().optional(),
});

export const ProdutosPageSchema = z.object({
  items: z.array(ProdutoResumoSchema),
  page: z.coerce.number(),
  limit: z.coerce.number(),
  total: z.coerce.number(),
});

export const FinanceiroResumoSchema = z.object({
  empresaId: z.string(),
  de: z.string(),
  ate: z.string(),
  totalReceber: z.coerce.number(),
  totalPagar: z.coerce.number(),
  saldoFluxoCaixa: z.coerce.number(),
});

export const TituloReceberSchema = z.object({
  id: z.string(),
  documento: z.string().nullable().optional(),
  pessoaNome: z.string().nullable().optional(),
  valor: z.coerce.number(),
  vencimento: z.union([z.string(), z.number()]).optional(),
  tipoCobranca: z.string().nullable().optional(),
  atrasado: z.boolean().nullable().optional(),
});

export const TitulosReceberPageSchema = z.object({
  items: z.array(TituloReceberSchema),
  page: z.coerce.number(),
  limit: z.coerce.number(),
  total: z.coerce.number(),
});

export const ProdutoVendidoSchema = z.object({
  produtoId: z.string().nullable().optional(),
  codigo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  quantidade: z.coerce.number(),
  totalLiquido: z.coerce.number(),
});

export const ProdutosVendidosSchema = z.object({
  empresaId: z.string(),
  de: z.string(),
  ate: z.string(),
  items: z.array(ProdutoVendidoSchema),
});

export type Empresa = z.infer<typeof EmpresaSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type VendasDia = z.infer<typeof VendasDiaSchema>;
export type PedidoResumo = z.infer<typeof PedidoResumoSchema>;
export type PedidosPage = z.infer<typeof PedidosPageSchema>;
export type PedidoDetalhe = z.infer<typeof PedidoDetalheSchema>;
export type VendasPeriodo = z.infer<typeof VendasPeriodoSchema>;
export type ProdutoResumo = z.infer<typeof ProdutoResumoSchema>;
export type ProdutosPage = z.infer<typeof ProdutosPageSchema>;
export type FinanceiroResumo = z.infer<typeof FinanceiroResumoSchema>;
export type TituloReceber = z.infer<typeof TituloReceberSchema>;
export type TitulosReceberPage = z.infer<typeof TitulosReceberPageSchema>;
export type ProdutoVendido = z.infer<typeof ProdutoVendidoSchema>;
export type ProdutosVendidos = z.infer<typeof ProdutosVendidosSchema>;
