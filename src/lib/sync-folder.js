/* global process */
// Local data sync — watches a folder of Excel datasets and writes the JSON
// files the dashboard reads (public/data/*.json). Edit a spreadsheet, save, and
// the dashboard auto-refreshes (it polls public/data/_version.json).
//
// Usage (run this in a terminal ALONGSIDE `npm run dev`):
//   node src/lib/sync-folder.js                 # watches ./data-source
//   node src/lib/sync-folder.js ./MinhaPasta    # watches a custom folder
//   DATA_FOLDER=./MinhaPasta node src/lib/sync-folder.js
//   node src/lib/sync-folder.js --once          # convert once, then exit
//
// Put one Excel file per dataset in the folder (headers must match the app fields):
//   estoque.xlsx  compras.xlsx  consumo.xlsx  vendas.xlsx  ordens.xlsx
// (.xlsx / .xls / .csv all work)

import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';

const DATASETS = [
  "estoquetransfer",
  "compratransfer",
  "consumotransfer",
];
const EXTS = ['.xlsx', '.xls', '.xlsm', '.csv'];

const NUMERIC_FIELDS = new Set([
  "produto",
  "cod_prod",
  "qtd_fisica",
  "qtd_aberto",
  "qtd_movimentada",
]);

const pad2 = (n) => String(n).padStart(2, '0');
const dateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const FIELD_MAP = {
  "Produto": "produto",
  "Cod.prod": "cod_prod",
  "Desc.completa": "desc_completa",
  "Descrição do produto": "desc_completa",
  "Familia": "familia",
  "Família": "familia",
  "Qtd.física": "qtd_fisica",
  "Qtd.aberto": "qtd_aberto",
  "Qtd.movimentada": "qtd_movimentada",
  "Dt.movto": "dt_movto",
};

function normalizeValue(field, v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return dateStr(v);
  if (NUMERIC_FIELDS.has(field)) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return String(v).trim();
}

function convertFile(file) {
  const wb = XLSX.readFile(file, { cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: true, defval: null });
  return rows.map((r) => {
    const o = {};
    for (const [k, v] of Object.entries(r)) {
const original = String(k).trim();
const nk = FIELD_MAP[original] || original.toLowerCase();

o[nk] = normalizeValue(nk, v);
    }
    return o;
  });
}

const args = process.argv.slice(2);
const once = args.includes('--once');
const folderArg = args.find((a) => !a.startsWith('--'));
const folder = path.resolve(
  process.cwd(),
  folderArg || process.env.DATA_FOLDER || "data-source"
);

const outDir = path.resolve(
  process.cwd(),
  "public",
  "data"
);

fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true });
  console.log(`Pasta criada: ${folder}`);
  console.log(
  "Coloque na pasta:\n" +
  "ESTOQUETRANSFER.xlsx\n" +
  "COMPRATRANSFER.xlsx\n" +
  "CONSUMOTRANSFER.xlsx\n"
);
}

function findDatasetFile(ds) {
  const lower = ds.toLowerCase();
  for (const f of fs.readdirSync(folder)) {
    if (path.basename(f, path.extname(f)).toLowerCase() === lower && EXTS.includes(path.extname(f).toLowerCase())) {
      return f;
    }
  }
  return null;
}

export function convertAll() {
  console.log("Pasta:", folder);
console.log("Arquivos:", fs.readdirSync(folder));
  const counts = {};
  for (const ds of DATASETS) {
    const fn = findDatasetFile(ds);
    if (!fn) { console.warn(`⚠ ${ds}: arquivo não encontrado em ${folder}`); continue; }
    try {
      const rows = convertFile(path.join(folder, fn));
      fs.writeFileSync(path.join(outDir, `${ds}.json`), JSON.stringify(rows));
      counts[ds] = rows.length;
      console.log(`✓ ${ds}: ${rows.length} registros <- ${fn}`);
    } catch (e) {
      console.error(`✗ ${ds}: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(outDir, '_version.json'), JSON.stringify({ updatedAt: new Date().toISOString(), counts }, null, 2));
  console.log(`→ JSON atualizado • ${new Date().toLocaleTimeString()}`);
}

convertAll();

if (once) {
  console.log("Conversão única concluída.");
  process.exit(0);
}

console.log(`\nObservando ${folder}...\n`);

let timer = null;

fs.watch(folder, (_evt, filename) => {

  if (
    !filename ||
    filename.startsWith("~$") ||
    !/\.(xlsx|xls|xlsm|csv)$/i.test(filename)
  ) {
    return;
  }

  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    convertAll();
    timer = null;
  }, 500);

});