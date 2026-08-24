import React from "react";
import { ChevronRight } from "lucide-react";
import { fmtQty, calcCobertura } from "@/lib/dashboardData";

export function ColorDetail({ cor, selected, onSelectColor }) {

  const cobertura = calcCobertura(cor);

  return (
    <div
      onClick={() => onSelectColor(cor.cor)}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "bg-white hover:bg-slate-50"
      }`}
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <ChevronRight className="h-4 w-4 text-slate-500" />

          <span className="font-semibold">

            {cor.cor}

          </span>

        </div>

        <span className="font-bold text-blue-700">

          {fmtQty(cor.estoque + cor.compras)}

        </span>

      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">

        <div>

          <span className="text-muted-foreground">

            Estoque

          </span>

          <div className="font-semibold">

            {fmtQty(cor.estoque)}

          </div>

        </div>

        <div>

          <span className="text-muted-foreground">

            Compras

          </span>

          <div className="font-semibold">

            {fmtQty(cor.compras)}

          </div>

        </div>

        <div>

          <span className="text-muted-foreground">

            Consumo

          </span>

          <div className="font-semibold">

            {fmtQty(cor.consumo)}

          </div>

        </div>

        <div>

          <span className="text-muted-foreground">

            Cobertura

          </span>

          <div className="font-semibold">

            {Number.isFinite(cobertura.coberturaMeses)
              ? cobertura.coberturaMeses.toFixed(1)
              : "∞"} meses

          </div>

        </div>

      </div>

    </div>
  );

}