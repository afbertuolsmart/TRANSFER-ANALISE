// ============================================================
// COBERTURA
// ============================================================

// ============================================================
// COBERTURA
// ============================================================

export function calcCobertura(
  item,
  windowKey = "consumo_12m"
) {
  // Quantidade de meses correspondente ao período
  const mesesPorJanela = {
    consumo_1m: 1,
    consumo_3m: 3,
    consumo_6m: 6,
    consumo_12m: 12,
  };

  const meses =
    mesesPorJanela[windowKey] || 12;

  // ==========================================================
  // CONSUMO DO PERÍODO SELECIONADO
  // ==========================================================

  const consumoPeriodo =
    Number(
      item?.[windowKey] || 0
    );

  // ==========================================================
  // MÉDIA MENSAL
  // ==========================================================

  const consumoMedioMes =
    consumoPeriodo / meses;

  // ==========================================================
  // SEM CONSUMO
  // ==========================================================

  if (consumoMedioMes <= 0) {
    return {
      coberturaMeses: Infinity,
      criticidade: "ok",
      qtdSugerida: 0,
    };
  }

  // ==========================================================
  // ESTOQUE + COMPRAS
  // ==========================================================

  const estoque =
    Number(item?.estoque || 0);

  const compras =
    Number(item?.compras || 0);

  const disponivel =
    estoque + compras;

  // ==========================================================
  // COBERTURA
  // ==========================================================

  const coberturaMeses =
    disponivel /
    consumoMedioMes;

  // ==========================================================
  // CRITICIDADE
  // ==========================================================

  let criticidade = "ok";

  if (coberturaMeses < 1) {
    criticidade = "critico";
  } else if (coberturaMeses < 2) {
    criticidade = "atencao";
  }

  // ==========================================================
  // QUANTIDADE A COMPRAR
  // ==========================================================

  const estoqueObjetivo =
    consumoMedioMes * 2;

  const qtdSugerida =
    Math.max(
      0,
      Math.ceil(
        estoqueObjetivo -
        disponivel
      )
    );

  return {
    coberturaMeses,
    criticidade,
    qtdSugerida,
  };
}