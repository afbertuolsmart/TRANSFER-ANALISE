// One-time export: pull all dashboard data from Base44 into local JSON files
// so the app can run in VS Code without the platform.
//
// Usage (from the project root):
//   1. npm install
//   2. Set your credentials as env vars:
//        export VITE_BASE44_APP_ID="your-app-id"
//        export BASE44_ACCESS_TOKEN="your-access-token"
//   3. node scripts/export-from-base44.js
//
// Output: public/data/{estoque,compras,consumo,vendas,ordens}.json
// These are fetched at runtime when the Base44 client is unavailable.

import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';

const appId = process.env.VITE_BASE44_APP_ID;
const token = process.env.BASE44_ACCESS_TOKEN;

if (!appId || !token) {
  console.error('Missing env vars. Set VITE_BASE44_APP_ID and BASE44_ACCESS_TOKEN first.');
  console.error('You can find the App ID in base44/config.jsonc, and generate a token from the Base44 app settings.');
  process.exit(1);
}

const base44 = createClient({ appId, token, serverUrl: '', requiresAuth: false });

const outDir = path.resolve(process.cwd(), 'public/data');
fs.mkdirSync(outDir, { recursive: true });

const entities = [
  ['estoque', 'EstoqueItem'],
  ['compras', 'CompraItem'],
  ['consumo', 'ConsumoItem'],
  ['vendas', 'VendaItem'],
  ['ordens', 'OrdemProducao'],
];

for (const [file, entityName] of entities) {
  try {
    const rows = await base44.entities[entityName].list('-created_date', 10000);
    fs.writeFileSync(path.join(outDir, `${file}.json`), JSON.stringify(rows));
    console.log(`✓ ${file}: ${rows.length} records`);
  } catch (err) {
    console.error(`✗ ${file}:`, err.message || err);
  }
}

console.log('\nDone. Data written to public/data/.');
console.log('Commit these files and the app will run locally from them.');