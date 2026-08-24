// ============================================================
// LOAD DATA
// ============================================================

export async function loadAllData() {
  const base = import.meta.env.BASE_URL;

  const get = (arquivo) =>
    fetch(`${base}data/${arquivo}.json`, {
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : []));

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


// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizeDesc(desc) {
  return (desc || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(\d[.,]\d)\s+MM/g, "$1MM");
}


// ============================================================
// CORES
// ============================================================

const MULTIWORD_COLORS = ["OFF WHITE"];

function normalizeCor(cor) {
  return (cor || "")
    .toUpperCase()
    .replace(/\s*-.*/g, "")
    .replace(/\bPU\b/gi, "")
    .replace(/\d+[.,]?\d*\s*MM/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


// ============================================================
// LIMPEZA DE ESPECIFICAÇÕES
// ============================================================

function cleanSpecs(str) {
  return (str || "")
    .replace(/PU\s*[\d,]*\s*MM/gi, "")
    .replace(/[\d,.]+\s*MM/gi, "")
    .replace(/\bPU\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


// ============================================================
// EXTRAÇÃO DE FAMÍLIA
// ============================================================

function extractFamiliaWithColecao(desc, colecao) {
  const texto = normalizeDesc(desc);
  const colecaoNormalizada = normalizeDesc(colecao);

  if (colecaoNormalizada && texto.includes(colecaoNormalizada)) {
    return cleanSpecs(colecaoNormalizada);
  }

  if (texto.includes(" - ")) {
    return cleanSpecs(texto.split(" - ")[0]);
  }

  return cleanSpecs(texto);
}


// ============================================================
// EXTRAÇÃO DE COR
// ============================================================

function extractCor(desc, familia) {
  const texto = normalizeDesc(desc);
  const fam = normalizeDesc(familia);

  if (texto.startsWith(fam)) {
    return normalizeCor(texto.substring(fam.length));
  }

  if (texto.includes(" - ")) {
    return normalizeCor(texto.split(" - ").slice(1).join(" - "));
  }

  return "";
}


// ============================================================
// CONSTRUÇÃO FAMÍLIA / COR
// ============================================================

export function buildFamiliaData(estoque = []) {
  const descLookup = {};
  const knownFamilias = new Set();

  // PASSO 1
  estoque.forEach((r) => {
    if (!r.desc_completa) return;

    const d = normalizeDesc(r.desc_completa);

    if (descLookup[d]) return;

    if (d.includes(" - ")) {
      const partes = d.split(" - ");

      const familia = cleanSpecs(partes[0]);
      const cor = normalizeCor(partes.slice(1).join(" - "));

      descLookup[d] = {
        familia,
        cor,
      };

      knownFamilias.add(familia);
    }
  });

  let familiaList = [...knownFamilias].sort(
    (a, b) => b.length - a.length
  );

  // PASSO 2
  estoque.forEach((r) => {
    if (!r.desc_completa) return;

    const d = normalizeDesc(r.desc_completa);

    if (descLookup[d]) return;

    const matched = familiaList.find((f) =>
      d.startsWith(f)
    );

    if (matched) {
      descLookup[d] = {
        familia: matched,
        cor: normalizeCor(
          d.substring(matched.length)
        ),
      };

      return;
    }

    let familia;
    let cor;

    let multiColor = null;

    for (const c of MULTIWORD_COLORS) {
      if (d.endsWith(" " + c)) {
        multiColor = c;
        break;
      }
    }

    if (multiColor) {
      familia = cleanSpecs(
        d.slice(
          0,
          d.length - multiColor.length - 1
        )
      );

      cor = multiColor;
    } else {
      familia = extractFamiliaWithColecao(
        r.desc_completa,
        r.colecao
      );

      cor = extractCor(
        r.desc_completa,
        familia
      );
    }

    descLookup[d] = {
      familia,
      cor,
    };

    knownFamilias.add(familia);
  });

  familiaList = [...knownFamilias].sort(
    (a, b) => b.length - a.length
  );

  return {
    descLookup,
    familiaList,
  };
}


// ============================================================
// FAMÍLIAS CONHECIDAS
// ============================================================

const FAMILIAS = [
  "NAPA MADRID",
  "NAPA LONDON",
  "NAPA",
  "COURVIN",
  "TRANSFER",
];


// ============================================================
// PARSE FAMÍLIA / COR
// ============================================================

export function parseFamiliaCor(desc) {
  if (!desc) {
    return {
      familia: "",
      cor: "",
    };
  }

  const texto = cleanSpecs(
    normalizeDesc(desc)
  );

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


// ============================================================
// ORIGEM
// ============================================================

export function getOrigem(subgrupo) {
  return Number(subgrupo) === 40
    ? "Importado"
    : "Nacional";
}


// ============================================================
// DATAS DE CONSUMO
// ============================================================

const CONSUMO_NOW = new Date();

const CONSUMO_CUTOFFS = {
  m1: new Date(
    CONSUMO_NOW.getFullYear(),
    CONSUMO_NOW.getMonth() - 1,
    CONSUMO_NOW.getDate()
  ),

  m3: new Date(
    CONSUMO_NOW.getFullYear(),
    CONSUMO_NOW.getMonth() - 3,
    CONSUMO_NOW.getDate()
  ),

  m6: new Date(
    CONSUMO_NOW.getFullYear(),
    CONSUMO_NOW.getMonth() - 6,
    CONSUMO_NOW.getDate()
  ),

  m12: new Date(
    CONSUMO_NOW.getFullYear(),
    CONSUMO_NOW.getMonth() - 12,
    CONSUMO_NOW.getDate()
  ),
};


// ============================================================
// JANELAS DE CONSUMO
// ============================================================

export function consumoWindows(dt_movto) {
  if (!dt_movto) {
    return {
      m1: false,
      m3: false,
      m6: false,
      m12: true,
    };
  }

  const d = new Date(dt_movto);

  if (isNaN(d.getTime())) {
    return {
      m1: false,
      m3: false,
      m6: false,
      m12: true,
    };
  }

  return {
    m1: d >= CONSUMO_CUTOFFS.m1,
    m3: d >= CONSUMO_CUTOFFS.m3,
    m6: d >= CONSUMO_CUTOFFS.m6,
    m12: d >= CONSUMO_CUTOFFS.m12,
  };
}


// ============================================================
// PEGAR VALOR DA JANELA
// ============================================================

export function getWindowValue(
  obj,
  windowKey,
  prefix
) {
  switch (windowKey) {
    case "consumo_1m":
      return Number(
        obj?.[`${prefix}_1m`] || 0
      );

    case "consumo_3m":
      return Number(
        obj?.[`${prefix}_3m`] || 0
      );

    case "consumo_6m":
      return Number(
        obj?.[`${prefix}_6m`] || 0
      );

    case "consumo_12m":
    default:
      return Number(
        obj?.[`${prefix}_12m`] || 0
      );
  }
}


// ============================================================
// FORMATADORES
// ============================================================

export function fmtQty(n) {
  return Number(n || 0).toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 1,
    }
  );
}


export function fmtMoney(n) {
  return Number(n || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


// ============================================================
// COBERTURA
// ============================================================

export function calcCobertura(item) {
  const consumoMedioMes =
    Number(item?.consumo_12m || 0) / 12;

  if (consumoMedioMes <= 0) {
    return {
      coberturaMeses: Infinity,
      criticidade: "ok",
      qtdSugerida: 0,
    };
  }

  const disponivel =
    Number(item?.estoque || 0) +
    Number(item?.compras || 0);

  const coberturaMeses =
    disponivel / consumoMedioMes;

  let criticidade = "ok";

  if (coberturaMeses < 1) {
    criticidade = "critico";
  } else if (coberturaMeses < 2) {
    criticidade = "atencao";
  }

  const qtdSugerida = Math.max(
    0,
    Math.ceil(
      consumoMedioMes * 2 -
      disponivel
    )
  );

  return {
    coberturaMeses,
    criticidade,
    qtdSugerida,
  };
}


// ============================================================
// AGREGAÇÃO PRINCIPAL
// ============================================================

export function aggregateData(rawData) {
  const familias = {};

  // ----------------------------------------------------------
  // FAMÍLIA
  // ----------------------------------------------------------

  function getFamilia(nome) {
    const familiaNome =
      nome || "SEM FAMÍLIA";

    if (!familias[familiaNome]) {
      familias[familiaNome] = {
        familia: familiaNome,

        estoque: 0,
        compras: 0,
        consumo: 0,

        consumo_1m: 0,
        consumo_3m: 0,
        consumo_6m: 0,
        consumo_12m: 0,

        produtos: {},
        cores: {},
      };
    }

    return familias[familiaNome];
  }


  // ----------------------------------------------------------
  // PRODUTO / ITEM
  // ----------------------------------------------------------

  function getProduto(
    familia,
    codigo,
    descricao
  ) {
    const produtoCodigo =
      codigo || "SEM CÓDIGO";

    if (!familia.produtos[produtoCodigo]) {
      familia.produtos[produtoCodigo] = {
        codigo: produtoCodigo,

        descricao:
          descricao ||
          "Sem descrição",

        estoque: 0,
        compras: 0,
        consumo: 0,

        consumo_1m: 0,
        consumo_3m: 0,
        consumo_6m: 0,
        consumo_12m: 0,
      };
    }

    return familia.produtos[produtoCodigo];
  }


  // ----------------------------------------------------------
  // COR
  // ----------------------------------------------------------

  function getCor(familia, nome) {
    const nomeCor =
      nome || "SEM COR";

    if (!familia.cores[nomeCor]) {
      familia.cores[nomeCor] = {
        cor: nomeCor,

        estoque: 0,
        compras: 0,
        consumo: 0,

        consumo_1m: 0,
        consumo_3m: 0,
        consumo_6m: 0,
        consumo_12m: 0,

        itens: [],
      };
    }

    return familia.cores[nomeCor];
  }


  // ==========================================================
  // ESTOQUE
  // ==========================================================

  (rawData.estoque || []).forEach((r) => {
    const familia = getFamilia(
      r.familia
    );

    const item = getProduto(
      familia,
      r.produto ||
        r.cod_prod ||
        r.codigo,
      r.desc_completa ||
        r.descricao
    );

    const qtd = Number(
      r.qtd_fisica || 0
    );

    familia.estoque += qtd;
    item.estoque += qtd;
  });


  // ==========================================================
  // COMPRAS
  // ==========================================================

  (rawData.compras || []).forEach((r) => {
    const familia = getFamilia(
      r.familia
    );

    const item = getProduto(
      familia,
      r.produto ||
        r.cod_prod ||
        r.codigo,
      r.desc_completa ||
        r.descricao
    );

    const qtd = Number(
      r.qtd_aberto || 0
    );

    familia.compras += qtd;
    item.compras += qtd;
  });


  // ==========================================================
  // CONSUMO
  //
  // IMPORTANTE:
  // Este bloco existe SOMENTE UMA VEZ.
  // ==========================================================

  (rawData.consumo || []).forEach((r) => {
    const familia = getFamilia(
      r.familia
    );

    const item = getProduto(
      familia,

      r.cod_prod ||
        r.produto ||
        r.codigo,

      r.desc_completa ||
        r.descricao
    );

    const qtd = Number(
      r.qtd_movimentada || 0
    );

    // ------------------------------------
    // CONSUMO TOTAL
    // ------------------------------------

    familia.consumo += qtd;
    item.consumo += qtd;

    // ------------------------------------
    // JANELAS
    // ------------------------------------

    const w = consumoWindows(
      r.dt_movto
    );

    if (w.m1) {
      familia.consumo_1m += qtd;
      item.consumo_1m += qtd;
    }

    if (w.m3) {
      familia.consumo_3m += qtd;
      item.consumo_3m += qtd;
    }

    if (w.m6) {
      familia.consumo_6m += qtd;
      item.consumo_6m += qtd;
    }

    if (w.m12) {
      familia.consumo_12m += qtd;
      item.consumo_12m += qtd;
    }
  });


  // ==========================================================
  // FINALIZAÇÃO
  // ==========================================================

  return Object.values(familias)
    .map((familia) => {

      familia.estoqueGeral =
        familia.estoque +
        familia.compras;

      familia.produtos =
        Object.values(
          familia.produtos
        )
        .sort(
          (a, b) =>
            b.consumo_12m -
            a.consumo_12m
        );

      familia.cores =
        Object.values(
          familia.cores
        );

      return familia;
    })
    .sort(
      (a, b) =>
        b.estoqueGeral -
        a.estoqueGeral
    );
}


// ============================================================
// RESUMO
// ============================================================

export function getSummary(rawData) {
  let estoque = 0;
  let compras = 0;
  let consumo = 0;

  (rawData.estoque || []).forEach(
    (r) => {
      estoque += Number(
        r.qtd_fisica || 0
      );
    }
  );

  (rawData.compras || []).forEach(
    (r) => {
      compras += Number(
        r.qtd_aberto || 0
      );
    }
  );

  (rawData.consumo || []).forEach(
    (r) => {
      consumo += Number(
        r.qtd_movimentada || 0
      );
    }
  );

  return {
    estoque,
    compras,
    consumo,
    estoqueGeral:
      estoque + compras,
  };
}