import React from "react";
import { Card } from "@/components/ui/card";
import { fmtQty } from "@/lib/dashboardData";
import {
  Boxes,
  Package,
  ShoppingCart,
  Activity,
} from "lucide-react";

export function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Disponível",
      value: summary.estoqueGeral,
      icon: Boxes,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: "Estoque + Compras",
    },
    {
      label: "Estoque",
      value: summary.estoque,
      icon: Package,
      color: "text-slate-700",
      bg: "bg-slate-100",
      sub: "Estoque físico",
    },
    {
      label: "Compras",
      value: summary.compras,
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: "Em aberto",
    },
    {
      label: "Consumo 12M",
      value: summary.consumo,
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-50",
      sub: "Últimos 12 meses",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">

          <div className={`inline-flex rounded-lg p-2 ${card.bg}`}>

            <card.icon className={`h-5 w-5 ${card.color}`} />

          </div>

          <div className="mt-3 text-xs text-muted-foreground">

            {card.label}

          </div>

          <div className="mt-1 text-2xl font-bold">

            {fmtQty(card.value)}

          </div>

          <div className="mt-1 text-xs text-muted-foreground">

            {card.sub}

          </div>

        </Card>
      ))}
    </div>
  );
}