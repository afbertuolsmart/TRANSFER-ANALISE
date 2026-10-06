import React, { useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { fmtQty } from "@/lib/dashboardData";

import { ConsumptionChart } from "./ConsumptionChart";

const WINDOWS = [
  {
    key: "consumo_1m",
    label: "Último mês",
    meses: 1,
  },
  {
    key: "consumo_3m",
    label: "Últimos 3 meses",
    meses: 3,
  },
  {
    key: "consumo_6m",
    label: "Últimos 6 meses",
    meses: 6,
  },
  {
    key: "consumo_12m",
    label: "Últimos 12 meses",
    meses: 12,
  },
];

export function ColorAnalysisPanel({
  item,
  onBack,
}) {
  const [windowKey, setWindowKey] = useState(
    "consumo_12m"
  );

  // ==========================================================
  // PERÍODO
  // ==========================================================

  const periodo =
    WINDOWS.find(
      (w) => w.key === windowKey
    ) || WINDOWS[3];

  const meses = periodo.meses;

  // ==========================================================
  // CONSUMO DO PERÍODO
  // ==========================================================

  let consumo = 0;

  if (windowKey === "consumo_1m") {
    consumo = Number(
      item?.consumo_1m || 0
    );
  }

  if (windowKey === "consumo_3m") {
    consumo = Number(
      item?.consumo_3m || 0
    );
  }

  if (windowKey === "consumo_6m") {
    consumo = Number(
      item?.consumo_6m || 0
    );
  }

  if (windowKey === "consumo_12m") {
    consumo = Number(
      item?.consumo_12m || 0
    );
  }

  // ==========================================================
  // MÉDIA MENSAL
  // ==========================================================

  const consumoMedio =
    meses > 0
      ? consumo / meses
      : 0;

  // ==========================================================
  // ESTOQUE
  // ==========================================================

  const estoque =
    Number(item?.estoque || 0);

  // ==========================================================
  // COMPRAS
  // ==========================================================

  const compras =
    Number(item?.compras || 0);

  // ==========================================================
  // DISPONÍVEL
  // ==========================================================

  const disponivel =
    estoque + compras;

  // ==========================================================
  // COBERTURA
  //
  // ESTOQUE + COMPRAS
  // -----------------
  // MÉDIA MENSAL
  // ==========================================================

  const cobertura =
    consumoMedio > 0
      ? disponivel / consumoMedio
      : Infinity;

  // ==========================================================
  // QUANTIDADE A COMPRAR
  //
  // OBJETIVO = 2 MESES
  // ==========================================================

  const quantidadeComprar =
    consumoMedio > 0
      ? Math.max(
          0,
          Math.ceil(
            consumoMedio * 2 -
              disponivel
          )
        )
      : 0;

  // ==========================================================
  // TROCAR PERÍODO
  // ==========================================================

  const handlePeriodo = (key) => {
    setWindowKey(key);
  };

  return (
    <Card className="p-6">

      {/* ====================================================
          VOLTAR
      ==================================================== */}

      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* ====================================================
          CABEÇALHO
      ==================================================== */}

      <h2 className="text-2xl font-bold">
        {item?.codigo}
      </h2>

      <p className="text-muted-foreground mb-6">
        {item?.descricao}
      </p>

      {/* ====================================================
          PERÍODOS
      ==================================================== */}

      <div className="flex flex-wrap gap-2 mb-6">

        {WINDOWS.map((w) => {

          const ativo =
            windowKey === w.key;

          return (
            <button
              key={w.key}
              type="button"
              onClick={() =>
                handlePeriodo(w.key)
              }
              className={`
                rounded-lg
                border
                px-4
                py-2
                text-sm
                cursor-pointer
                transition-all
                ${
                  ativo
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {w.label}
            </button>
          );
        })}

      </div>

      {/* ====================================================
          INDICADORES
      ==================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

        {/* ESTOQUE */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Estoque
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(estoque)}
          </div>

        </Card>

        {/* COMPRAS */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Compras
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(compras)}
          </div>

        </Card>

        {/* CONSUMO */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Consumo
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(consumo)}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            {periodo.label}
          </div>

        </Card>

        {/* CONSUMO MÉDIO */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Consumo Médio
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(consumoMedio)}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Média mensal
          </div>

        </Card>

        {/* COBERTURA */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Cobertura
          </div>

          <div
            key={`cobertura-${windowKey}`}
            className="text-2xl font-bold"
          >
            {Number.isFinite(cobertura)
              ? cobertura.toFixed(1)
              : "∞"}{" "}
            meses
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Baseada em{" "}
            {periodo.label.toLowerCase()}
          </div>

        </Card>

        {/* COMPRAR */}

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Comprar
          </div>

          <div className="text-2xl font-bold text-red-600">
            {fmtQty(
              quantidadeComprar
            )}
          </div>

        </Card>

      </div>

      {/* ====================================================
          GRÁFICO
      ==================================================== */}

      <ConsumptionChart
        item={item}
      />

    </Card>
  );
}