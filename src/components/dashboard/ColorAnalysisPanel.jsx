import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import {
  fmtQty,
  calcCobertura,
  getWindowValue
} from "@/lib/dashboardData";

import { ConsumptionChart } from "./ConsumptionChart";

const WINDOWS = [
  { key: "consumo_1m", label: "Último mês" },
  { key: "consumo_3m", label: "Últimos 3 meses" },
  { key: "consumo_6m", label: "Últimos 6 meses" },
  { key: "consumo_12m", label: "Últimos 12 meses" },
];

export function ColorAnalysisPanel({ item, onBack }) {

  const [windowKey, setWindowKey] = useState("consumo_12m");

  const consumo = getWindowValue(
    item,
    windowKey,
    "consumo"
  );

  const meses =
    windowKey === "consumo_1m"
      ? 1
      : windowKey === "consumo_3m"
      ? 3
      : windowKey === "consumo_6m"
      ? 6
      : 12;

  const consumoMedio = consumo / meses;

  const cobertura = calcCobertura(item);

  return (
    <Card className="p-6">

      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <h2 className="text-2xl font-bold">
        {item.codigo}
      </h2>

      <p className="text-muted-foreground mb-6">
        {item.descricao}
      </p>

      <div className="flex gap-2 mb-6">

        {WINDOWS.map((w) => (
          <button
            key={w.key}
            onClick={() => setWindowKey(w.key)}
            className={`rounded-lg border px-4 py-2 text-sm ${
              windowKey === w.key
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {w.label}
          </button>
        ))}

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Estoque
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(item.estoque)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Compras
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(item.compras)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Consumo
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(consumo)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Consumo Médio
          </div>

          <div className="text-2xl font-bold">
            {fmtQty(consumoMedio)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Cobertura
          </div>

          <div className="text-2xl font-bold">
            {Number.isFinite(cobertura.coberturaMeses)
              ? cobertura.coberturaMeses.toFixed(1)
              : "∞"}{" "}
            meses
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            Comprar
          </div>

          <div className="text-2xl font-bold text-red-600">
            {fmtQty(cobertura.qtdSugerida)}
          </div>
        </Card>

      </div>

      <ConsumptionChart item={item} />

    </Card>
  );
}