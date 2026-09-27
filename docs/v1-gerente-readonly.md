# Meu Arara — V1 Gerente (read-only)

Princípio: a v1 do app para gerentes é **somente consulta**. Nenhuma mutação de negócio (baixa, preço, pedido, estoque, usuário).

Público: grupo de acesso com **gerente** no nome (ex. Gerente, Gerente Geral, Gerente Loja), ou allowlist `MEUARARA_GRUPOS_PERMITIDOS`.

API base: `/sgc/meuarara`

## MVP (já entregue)

- Selecionar cliente (tenant) → login → empresas
- Dashboard: vendas do dia, de ontem, da semana, do mês ou de um intervalo (`de`/`ate`)
- Pedidos faturados no período escolhido
- Estoque / produtos (busca + saldo)
- Financeiro resumo (receber / pagar / saldo fluxo)

## Fatia 1 — entregue

| # | Feature | Endpoint |
|---|---------|----------|
| 1 | Detalhe do pedido | `GET /empresas/{id}/pedidos/{pedidoId}` |
| 2 | Pedidos por período | `GET /empresas/{id}/pedidos?de=&ate=` (`data` ainda aceito = dia único) |
| 3 | Preço + estoque mínimo | `GET /empresas/{id}/produtos` (+ `estoqueMinimo`, `abaixoMinimo`; query `abaixoMinimo=true`) |
| 4 | Títulos a receber | `GET /empresas/{id}/financeiro/receber?de=&ate=&page=&limit=` |
| 5 | Ranking produtos | `GET /empresas/{id}/vendas/produtos?de=&ate=&limit=` |

### Campos (fatia 1)

**Pedido detalhe:** código, data, cliente, vendedor, situação, totais; `itens[]` (produto, qtd, unitário, desconto, total); `pagamentos[]` (tipoCobranca, valorCobranca).

**Produto:** `precoVenda` (tabela PDV da empresa), `estoqueMinimo`, `abaixoMinimo`.

**Título a receber:** id, documento, pessoaNome, valor, vencimento, tipoCobranca, `atrasado`.

**Ranking item:** produtoId, codigo, descricao, quantidade, totalLiquido.

## Backlog completo (após fatia 1)

### Vendas e pedidos

1. Detalhe do pedido — *fatia 1*
2. Pedidos por período — *fatia 1*
3. Ranking de produtos — *fatia 1*
4. Vendas por vendedor
5. Vendas por forma de pagamento
6. Comparativo período atual vs anterior

### Estoque

7. Preço de venda na listagem — *fatia 1*
8. Estoque mínimo / ruptura — *fatia 1*
9. Saldo + custo/venda (margem aproximada)
10. Badge “abaixo do mínimo” — *fatia 1*

### Financeiro

11. Títulos a receber — *fatia 1*
12. Títulos a pagar (lista)
13. Agenda do dia/semana (vencimentos próximos)
14. Fluxo diário (série entradas/saídas)

### Operação PDV

15. Caixas abertos / fechados
16. Cancelamentos
17. Devoluções / trocas
18. Vendas por horário (ainda não; o app filtra por data, não por faixa de horas)

### Clientes

19. Busca de cliente
20. Extrato do cliente
21. Top clientes

### Multi-empresa

22. Dashboard consolidado
23. Comparativo entre lojas

## Explicitamente fora da v1

- Qualquer escrita
- Relatórios fiscais pesados (bloco K, SPED)
- Comissões detalhadas / resultado operacional completo
