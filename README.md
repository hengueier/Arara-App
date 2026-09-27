<p align="center">
  <img src="docs/readme-header.png" alt="Meu Arara" width="100%" />
</p>

# Meu Arara

App mobile de **consulta gerencial** para o SGC Arara — vendas, pedidos, estoque e financeiro, somente leitura.

Voltado a gerentes: login com a mesma conta do SGC, seleção de empresa e filtros por período (hoje, ontem, semana, mês ou intervalo customizado).

## Funcionalidades

- **Login multi-tenant** via auth-bridge (`usuario@slug`) ou modo legado com API direta
- **Dashboard** — vendas do período + ranking de produtos
- **Pedidos** — faturados no período, com detalhe de itens e pagamentos
- **Estoque** — busca, preço, mínimo e alerta de ruptura
- **Financeiro** — resumo e títulos a receber

Escopo detalhado da v1: [`docs/v1-gerente-readonly.md`](docs/v1-gerente-readonly.md).

## Stack

Expo 57 · Expo Router · TypeScript · axios · zod · zustand · expo-secure-store · expo-sqlite · react-hook-form

## Pré-requisitos

- Node.js 20+ (recomendado via nvm)
- Conta [Expo](https://expo.dev) se for gerar builds EAS
- Backend SGC com a API `/sgc/meuarara` disponível (e, opcionalmente, a auth-bridge)

## Configuração

```bash
cp .env.example .env
```

Edite o `.env` com a URL da sua ponte de autenticação (ou da API direta):

```bash
# Recomendado — auth-bridge (descoberta user@slug)
EXPO_PUBLIC_BRIDGE_URL=https://auth.example.com

# Alternativa — API direta (sem bridge)
# EXPO_PUBLIC_API_URL=http://localhost:8081/sgc/meuarara
# EXPO_PUBLIC_AVAILABLE_TENANTS=demo-hml
# EXPO_PUBLIC_DEFAULT_TENANT=demo-hml
```

> O arquivo `.env` **não** é versionado. Nunca commite URLs de produção, tokens ou keystores.

## Rodar localmente

```bash
npm install
npx expo start
```

Escaneie o QR code com o Expo Go, ou pressione `a` / `i` para emulador Android / iOS.

## Builds (EAS)

```bash
npx eas-cli login
npx eas-cli init   # primeira vez

npm run build:apk    # APK para distribuição interna
npm run build:play   # AAB para Google Play (teste interno)
```

Configure `EXPO_PUBLIC_BRIDGE_URL` (ou a API direta) no ambiente EAS / secrets do projeto — o `eas.json` não embute URLs de produção.

## Arquitetura (resumo)

```
App ──► Auth Bridge ──► Shared (slug → host do tenant)
              │
              └── proxy /sgc/meuarara do tenant
```

No modo bridge, o login é `usuario@<slug>` com a senha do SGC. Sem bridge, o app usa o registro legado em `src/config/tenants.ts` (apenas exemplos no repositório público).

## Segurança / repositório público

Antes de publicar ou fazer fork:

1. Confirme que `.env` está no `.gitignore` e **não** está no histórico
2. Use placeholders em `.env.example` (nunca hosts reais de clientes)
3. Não commite keystores (`.jks`, `.p12`, `.mobileprovision`)
4. Credenciais de Play Store / EAS ficam no Expo Dashboard, não no git

## Licença

Uso interno / proprietário — ajuste conforme a política do projeto.
