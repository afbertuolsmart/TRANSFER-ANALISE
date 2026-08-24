
export async function loadAllData() {
  const base = import.meta.env.BASE_URL;

  const get = (arquivo) =>
    fetch(`${base}data/${arquivo}.json`).then((r) =>
      r.ok ? r.json() : []
    );

  const [estoque, compras, consumo] = await Promise.all([
    get("estoquetransfer"),
    get("compratransfer"),
    get("consumotransfer"),
  ]);

  return {
    estoque,
    compras,
    consumo,
  };
}

function normalizeDesc(desc) {
  return (desc || '').toUpperCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d[.,]\d)\s+MM/g, '$1MM');
}




const MULTIWORD_COLORS = ['OFF WHITE'];

export function buildFamiliaData(estoque) {
  const descLookup = {};
  const knownFamilias = new Set();

  // Pass 1: clean family extraction from dash descriptions
  estoque.forEach(r => {
    if (!r.desc_completa) return;
    const d = normalizeDesc(r.desc_completa);
    if (descLookup[d]) return;
    if (d.includes(' - ')) {
      const familia = cleanSpecs(d.split(' - ')[0]);
      descLookup[d] = { familia, cor: d.split(' - ').slice(1).join(' - ').trim() };
      knownFamilias.add(familia);
    }
  });

  let familiaList = [...knownFamilias].sort((a, b) => b.length - a.length);

  // Pass 2: resolve non-dash descriptions via longest-prefix match against known families
  estoque.forEach(r => {
    if (!r.desc_completa) return;
    const d = normalizeDesc(r.desc_completa);
    if (descLookup[d]) return;
    const matched = familiaList.find(f => d.startsWith(f));
    if (matched) {
      descLookup[d] = { familia: matched, cor: cleanSpecs(d.substring(matched.length)) };
      return;
    }
    let familia, cor;
    let mc = null;
    for (const c of MULTIWORD_COLORS) { if (d.endsWith(' ' + c)) { mc = c; break; } }
    if (mc) {
      familia = cleanSpecs(d.slice(0, d.length - mc.length - 1));
      cor = mc;
    } else {
      familia = extractFamiliaWithColecao(r.desc_completa, r.colecao);
      cor = extractCor(r.desc_completa, familia);
    }
    descLookup[d] = { familia, cor };
    knownFamilias.add(familia);
  });

  return { descLookup, familiaList: [...knownFamilias].sort((a, b) => b.length - a.length) };
}

function normalizeCor(cor) {
  return cor
    .toUpperCase()

    // Remove tudo após hífen
    .replace(/\s*-.*/g, "")

    // Remove PU
    .replace(/\bPU\b/gi, "")

    // Remove espessuras
    .replace(/\d+[.,]?\d*\s*MM/gi, "")

    // Remove parênteses
    .replace(/\(.*?\)/g, "")

    // Espaços
    .replace(/\s+/g, " ")
    .trim();
}
export function parseFamiliaCor(desc) {
  if (!desc) {
    return {
      familia: "",
      cor: "",
    };
  }

  const texto = cleanSpecs(normalizeDesc(desc));

  const familia = [...FAMILIAS]
    .sort((a, b) => b.length - a.length)
    .find((f) => texto.startsWith(f));

  if (!familia) {
    return {
      familia: texto,
      cor: "",
    };
  }

const cor = normalizeCor(
    texto.substring(familia.length)
);

return {
  familia,
  cor,
};
}

export function getOrigem(subgrupo) {
  return Number(subgrupo) === 40 ? 'Importado' : 'Nacional';
}

const CONSUMO_NOW = new Date();
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const CONSUMO_CUTOFFS = {
  m1: new Date(CONSUMO_NOW.getFullYear(), CONSUMO_NOW.getMonth() - 1, CONSUMO_NOW.getDate()),
  m3: new Date(CONSUMO_NOW.getFullYear(), CONSUMO_NOW.getMonth() - 3, CONSUMO_NOW.getDate()),
  m6: new Date(CONSUMO_NOW.getFullYear(), CONSUMO_NOW.getMonth() - 6, CONSUMO_NOW.getDate()),
  m12: new Date(CONSUMO_NOW.getFullYear(), CONSUMO_NOW.getMonth() - 12, CONSUMO_NOW.getDate()),
};

export function consumoWindows(dt_movto) {
  if (!dt_movto) return { m1: false, m3: false, m6: false, m12: true };
  const d = new Date(dt_movto);
  if (isNaN(d.getTime())) return { m1: false, m3: false, m6: false, m12: true };
  return {
    m1: d >= CONSUMO_CUTOFFS.m1,
    m3: d >= CONSUMO_CUTOFFS.m3,
    m6: d >= CONSUMO_CUTOFFS.m6,
    m12: d >= CONSUMO_CUTOFFS.m12,
  };
}
export function getWindowValue(obj, windowKey, prefix) {
  switch (windowKey) {
    case "consumo_1m":
      return obj[`${prefix}_1m`] || 0;

    case "consumo_3m":
      return obj[`${prefix}_3m`] || 0;

    case "consumo_6m":
      return obj[`${prefix}_6m`] || 0;

    default:
      return obj[`${prefix}_12m`] || 0;
  }
}

const WINDOW_MONTHS = { consumo_1m: 1, consumo_3m: 3, consumo_6m: 6, consumo_12m: 12 };
const pad2 = n => String(n).padStart(2, '0');

export function buildWindowTrend(consumoByDay, vendasByDay, windowKey) {
  const months = WINDOW_MONTHS[windowKey] || 12;
  const cutoff = CONSUMO_CUTOFFS['m' + months];
  const granularity = months <= 1 ? 'day' : months <= 3 ? 'week' : 'month';

  function bucketKey(d) {
    if (granularity === 'day') return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    if (granularity === 'week') {
      const tmp = new Date(d);
      const wd = (tmp.getDay() + 6) % 7;
      tmp.setDate(tmp.getDate() - wd);
      return `${tmp.getFullYear()}-${pad2(tmp.getMonth() + 1)}-${pad2(tmp.getDate())}`;
    }
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  }
  function label(k) {
    const [y, m, d] = k.split('-');
    if (granularity === 'month') return MONTH_LABELS[Number(m) - 1];
    return `${d}/${m}`;
  }

  const dayMap = {};
  Object.entries(consumoByDay || {}).forEach(([day, qty]) => {
    const d = new Date(day.slice(0, 10) + 'T00:00:00');
    if (d < cutoff) return;
    const k = bucketKey(d);
    dayMap[k] = dayMap[k] || { consumo: 0, vendas: 0 };
    dayMap[k].consumo += qty;
  });
  Object.entries(vendasByDay || {}).forEach(([day, qty]) => {
    const d = new Date(day.slice(0, 10) + 'T00:00:00');
    if (d < cutoff) return;
    const k = bucketKey(d);
    dayMap[k] = dayMap[k] || { consumo: 0, vendas: 0 };
    dayMap[k].vendas += qty;
  });

  const result = [];
  const seen = new Set();
  const cur = new Date(cutoff);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(CONSUMO_NOW);
  while (cur <= end) {
    const k = bucketKey(cur);
    if (!seen.has(k)) {
      seen.add(k);
      result.push({ label: label(k), consumo: (dayMap[k] || {}).consumo || 0, vendas: (dayMap[k] || {}).vendas || 0 });
    }
    if (granularity === 'day') cur.setDate(cur.getDate() + 1);
    else if (granularity === 'week') cur.setDate(cur.getDate() + 7);
    else cur.setMonth(cur.getMonth() + 1);
  }
  return result;
}

function cleanSpecs(str) {
  return str
    .replace(/PU\s*[\d,]*\s*MM/i, '')
    .replace(/[\d,.]+\s*MM/i, '')
    .replace(/\bPU\b/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fmtQty(n) {
  return (n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function fmtMoney(n) {
  return (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcCobertura(item) {
  const consumoMedioMes = (item.consumo_12m || 0) / 12;

  if (consumoMedioMes <= 0) {
    return {
      coberturaMeses: Infinity,
      criticidade: "ok",
      qtdSugerida: 0,
    };
  }

  const disponivel =
    (item.estoque || 0) +
    (item.compras || 0);

  const coberturaMeses = disponivel / consumoMedioMes;

  let criticidade = "ok";

  if (coberturaMeses < 1)
    criticidade = "critico";
  else if (coberturaMeses < 2)
    criticidade = "atencao";

  const qtdSugerida = Math.max(
    0,
    Math.ceil(consumoMedioMes * 2 - disponivel)
  );

  return {
    coberturaMeses,
    criticidade,
    qtdSugerida,
  };
}

export function aggregateData(rawData) {
  const familias = {};

  function getFamilia(nome) {

  if (!familias[nome]) {

    familias[nome] = {

      familia: nome,

      estoque: 0,

      compras: 0,

      consumo: 0,

      consumo_1m: 0,
      consumo_3m: 0,
      consumo_6m: 0,
      consumo_12m: 0,

      produtos: {}

    };

  }

  return familias[nome];

}

function getProduto(familia, codigo, descricao) {

  if (!familia.produtos[codigo]) {

    familia.produtos[codigo] = {

      codigo,

      descricao,

      estoque: 0,

      compras: 0,

      consumo: 0,

      consumo_1m: 0,
      consumo_3m: 0,
      consumo_6m: 0,
      consumo_12m: 0

    };

  }

  return familia.produtos[codigo];

}

  function getCor(familia, nome) {

  if (!familia.cores[nome]) {

    familia.cores[nome] = {

      cor: nome,

      estoque: 0,
      compras: 0,
      consumo: 0,

      consumo_1m: 0,
      consumo_3m: 0,
      consumo_6m: 0,
      consumo_12m: 0,

      itens: []

    };

  }

  return familia.cores[nome];

}

  // =========================
  // ESTOQUE
  // =========================

 rawData.estoque.forEach(r => {

  const fam = getFamilia(r.familia);

  const item = getProduto(
    fam,
    r.produto,
    r.desc_completa
  );

  const qtd = Number(r.qtd_fisica || 0);

  fam.estoque += qtd;

  item.estoque += qtd;

});

// =========================
// COMPRAS
// =========================

rawData.compras.forEach(r => {

  const fam = getFamilia(r.familia);

  const item = getProduto(
    fam,
    r.produto,
    r.desc_completa
  );

  const qtd = Number(r.qtd_aberto || 0);

  fam.compras += qtd;

  item.compras += qtd;

});

// =========================
// CONSUMO
// =========================

rawData.consumo.forEach(r => {

  const fam = getFamilia(r.familia);

  const item = getProduto(
    fam,
    r.cod_prod || r.produto,
    r.desc_completa || r.descricao
  );

  const qtd = Number(r.qtd_movimentada || 0);

  fam.consumo += qtd;

  item.consumo += qtd;

  const w = consumoWindows(r.dt_movto);

  if (w.m1) {
    fam.consumo_1m += qtd;
    item.consumo_1m += qtd;
  }

  if (w.m3) {
    fam.consumo_3m += qtd;
    item.consumo_3m += qtd;
  }

  if (w.m6) {
    fam.consumo_6m += qtd;
    item.consumo_6m += qtd;
  }

  fam.consumo_12m += qtd;
  item.consumo_12m += qtd;

});


return Object.values(familias)
  .map(f => {

    f.estoqueGeral = f.estoque + f.compras;

    f.produtos = Object.values(f.produtos)
      .sort((a, b) => b.estoque - a.estoque);

    return f;

  })
  .sort((a, b) => b.estoqueGeral - a.estoqueGeral);

}

export function getSummary(rawData) {

  let estoque = 0;
  let compras = 0;
  let consumo = 0;

  rawData.estoque.forEach(r=>{
    estoque += Number(r.qtd_fisica || 0);
  });

  rawData.compras.forEach(r=>{
    compras += Number(r.qtd_aberto || 0);
  });

  rawData.consumo.forEach(r=>{
    consumo += Number(r.qtd_movimentada || 0);
  });

  return {

    estoque,

    compras,

    consumo,

    estoqueGeral: estoque + compras

  };

}