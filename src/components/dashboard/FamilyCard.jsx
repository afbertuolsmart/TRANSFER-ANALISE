import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fmtQty, calcCobertura } from "@/lib/dashboardData";
import { ProductRow } from "./ProductRow";

export function FamilyCard({
  family,
  onSelectItem,
  forceExpanded,
  selectedItem,
  onFocus
}) {

  const [expanded, setExpanded] = useState(false);

  const isExpanded = forceExpanded || expanded;

  const cobertura = calcCobertura(family);

  const handleHeaderClick = () => {

    if (onFocus) {
      onFocus();
      return;
    }

    setExpanded(!expanded);

  };

  return (

    <Card className="overflow-hidden">

      <div
        className={`p-4 ${forceExpanded ? "" : "cursor-pointer hover:bg-slate-50"}`}
        onClick={handleHeaderClick}
      >

        <div className="flex items-center justify-between mb-4">

          <div>

            <div className="flex items-center gap-2">

              {isExpanded
                ? <ChevronDown className="h-4 w-4" />
                : <ChevronRight className="h-4 w-4" />}

              <h3 className="font-bold">

                {family.familia}

              </h3>

            </div>

            <span className="text-xs text-muted-foreground">

              {family.produtos.length} produtos

            </span>

          </div>

          <div className="text-right">

            <div className="text-xs text-muted-foreground">

              Cobertura

            </div>

            <div className="font-bold">

              {Number.isFinite(cobertura.coberturaMeses)
                ? cobertura.coberturaMeses.toFixed(1)
                : "∞"} meses

            </div>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-lg bg-blue-50 p-3">

            <div className="text-xs text-blue-700">

              Estoque

            </div>

            <div className="text-xl font-bold">

              {fmtQty(family.estoque)}

            </div>

          </div>

          <div className="rounded-lg bg-green-50 p-3">

            <div className="text-xs text-green-700">

              Compras

            </div>

            <div className="text-xl font-bold">

              {fmtQty(family.compras)}

            </div>

          </div>

          <div className="rounded-lg bg-orange-50 p-3">

            <div className="text-xs text-orange-700">

              Consumo

            </div>

            <div className="text-xl font-bold">

              {fmtQty(family.consumo)}

            </div>

          </div>

          <div className="rounded-lg bg-red-50 p-3">

            <div className="text-xs text-red-700">

              Comprar

            </div>

            <div className="text-xl font-bold">

              {fmtQty(cobertura.qtdSugerida)}

            </div>

          </div>

        </div>

      </div>

      {isExpanded && (

        <div className="border-t bg-slate-50 p-3">

          <div className="space-y-2">

            {family.produtos.map(produto => (

             <ProductRow
  key={produto.codigo}
  produto={produto}
  selected={selectedItem === produto.codigo}
  onSelect={() =>
    onSelectItem(
      family.familia,
      produto
    )
  }
/>

            ))}

          </div>

        </div>

      )}

    </Card>

  );

}