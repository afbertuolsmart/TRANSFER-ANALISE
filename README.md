# StkFlow Analytics

Dashboard de compras, estoque e consumo. Roda como app **Vite + React puro**, lendo dados de JSON local — **sem depender do Base44 em runtime**.

## Rodar no VS Code (sem Base44)

1. `npm install`
2. Exporte os dados **uma vez** (ainda precisa do `@base44/sdk` instalado):
   ```bash
   export VITE_BASE44_APP_ID="seu-app-id"        # veja em base44/config.jsonc
   export BASE44_ACCESS_TOKEN="seu-token"         # gere nas configurações do app no Base44
   node src/lib/export-from-base44.js
   ```
   Isso grava `public/data/*.json`. Faça commit desses arquivos.
3. `npm run dev` — o dashboard abre direto, lendo os JSONs locais (sem login).
4. Para publicar: `npm run build` e publique a pasta `dist/` em qualquer host estático (GitHub Pages já configurado via `deploy.yml`, Netlify, Vercel, etc.).

### Atualizar os dados
Rode o script do passo 2 de novo sempre que quiser dados novos.

### Proteger o acesso (opcional)
O dashboard está sem login. Para restringir, proteja no nível do host: HTTP basic auth, VPN, ou "site password" do Netlify/Vercel.

### Remover 100% do Base44 (opcional, no VS Code)
Já removido do caminho de dados/auth em runtime: `dashboardData` só lê JSON, `base44Client` é um stub, e o plugin `@base44/vite-plugin` foi tirado do `vite.config`. Falta só:
1. `src/lib/AuthContext.jsx` — substitua por um contexto local (a plataforma bloqueia edição dele aqui, mas no VS Code você edita livremente; pode também remover o `<AuthProvider>` em `src/App.jsx`).
2. Só **depois do último export**: `npm uninstall @base44/sdk @base44/vite-plugin` e, se quiser, apague `src/lib/export-from-base44.js`.

---

## Fluxo original com o backend Base44

Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.

See the [Base44 CLI docs](https://docs.base44.com/developers/references/cli/get-started/overview) if you want to run Base44 commands directly.

## Run Locally

Run the full local development environment from the project root:

```bash
base44 dev
```

`base44 dev` starts the local Base44 development backend and, when this app is configured for it, also starts the frontend dev server for you. Use the frontend URL printed by the command.

For example, when the Base44 project config includes a `serveCommand`, `base44 dev` can launch the frontend too:

```json5
{
  "site": {
    "serveCommand": "npm run dev"
  }
}
```

In a Base44 project this lives in `base44/config.jsonc`.

## Run Only The Frontend

If you only want to work on the frontend against the hosted Base44 backend, run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Use The Hosted Backend

For frontend-only development, create or update `.env.local` in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the Base44 app.

`VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests. Point it at your deployed Base44 app URL when you want the local frontend to use the hosted backend.

When you use `base44 dev`, the command injects the local Base44 values for you, so `.env.local` is mainly needed for frontend-only workflows.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Base44 CLI command reference: [https://docs.base44.com/developers/references/cli/commands/introduction](https://docs.base44.com/developers/references/cli/commands/introduction)

Support: [https://app.base44.com/support](https://app.base44.com/support)