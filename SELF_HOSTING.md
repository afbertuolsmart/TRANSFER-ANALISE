# Trabalhando no VS Code (sem depender do Base44 em runtime)

O projeto agora roda em dois modos:

1. **Plataforma Base44** (preview/build aqui): usa o client Base44 real para ler os dados das entidades.
2. **Local / VS Code**: se o client Base44 não estiver disponível, o app carrega os dados de arquivos JSON locais (`public/data/*.json`).

## Como trabalhar no VS Code

### 1. Clonar / abrir o projeto
```bash
npm install
```

### 2. Exportar os dados UMA VEZ
O app precisa dos dados em JSON local. Rode o script de exportação com suas credenciais do Base44:

```bash
export VITE_BASE44_APP_ID="seu-app-id"      # veja em base44/config.jsonc
export BASE44_ACCESS_TOKEN="seu-token"       # gere nas configurações do app no Base44
node scripts/export-from-base44.js
```

Isso grava `public/data/{estoque,compras,consumo,vendas,ordens}.json`. Faça commit desses arquivos.

> Dica: para achar o App ID, abra `base44/config.jsonc`. O token de acesso você gera no painel do app no Base44.

### 3. Rodar localmente
```bash
npm run dev
```
Como não há env da plataforma, `base44Client` vira um stub e o `loadAllData` cai no fallback, lendo os JSONs de `public/data/`. O dashboard abre direto, sem login (o auth foi substituído por um contexto local que sempre libera acesso).

### 4. Atualizar os dados
Sempre que quiser dados novos, rode o script novamente. Em produção, basta servir a pasta `dist/` (gerada por `npm run build`) em qualquer host estático — GitHub Pages, Netlify, Vercel, ou um servidor próprio.

---

## Proteger o acesso (opcional)
O dashboard ficou sem login. Se precisar restringir acesso, proteja no nível do host:
- **GitHub Pages privado**: repositório private (plano pago).
- **Netlify/Vercel**: senha do site (site password protection).
- **Servidor próprio**: HTTP basic auth ou VPN.

## Cortar o cordão totalmente (opcional)
Depois de ter os JSONs locais, se quiser remover 100% do Base44 do código:

1. **`src/lib/dashboardData.js`**: troque o bloco `try { ... base44 ... } catch` por apenas o fetch dos JSONs (`public/data/`).
2. **`src/lib/AuthContext.jsx`**: é um arquivo gerenciado pela plataforma — no VS Code você pode editá-lo livremente. Substitua por um contexto local (ou remova o `<AuthProvider>` em `src/App.jsx`).
3. **`src/api/base44Client.js`**: pode virar um stub fixo (sem `createClient`).
4. **`vite.config.js`**: remova o `@base44/vite-plugin` e o import.
5. **`package.json`**: `npm uninstall @base44/sdk @base44/vite-plugin`.

Depois disso o projeto é um app Vite + React puro, sem nenhuma dependência do Base44.