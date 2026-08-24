import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { fmtQty } from "@/lib/dashboardData";

export function ConsumptionChart({ item }) {
  if (!item) return null;

  const data = [
    {
      periodo: "1 mês",
      consumo: Number(item.consumo_1m || 0),
      media: Number(item.consumo_1m || 0),
    },
    {
      periodo: "3 meses",
      consumo: Number(item.consumo_3m || 0),
      media: Number(item.consumo_3m || 0) / 3,
    },
    {
      periodo: "6 meses",
      consumo: Number(item.consumo_6m || 0),
      media: Number(item.consumo_6m || 0) / 6,
    },
    {
      periodo: "12 meses",
      consumo: Number(item.consumo_12m || 0),
      media: Number(item.consumo_12m || 0) / 12,
    },
  ];

  return (
    <Card className="mt-4 p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold">
          Consumo por período
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          Histórico de consumo do item
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="periodo"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => fmtQty(value)}
            />

            <Tooltip
              formatter={(value, name) => {
                if (name === "consumo") {
                  return [
                    fmtQty(value),
                    "Consumo acumulado",
                  ];
                }

                return [
                  fmtQty(value),
                  "Média mensal",
                ];
              }}
            />

            <Bar
              dataKey="consumo"
              name="consumo"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {data.map((itemPeriodo) => (
          <div
            key={itemPeriodo.periodo}
            className="rounded-lg bg-slate-50 border p-3"
          >
            <div className="text-xs text-muted-foreground">
              {itemPeriodo.periodo}
            </div>

            <div className="text-lg font-bold mt-1">
              {fmtQty(itemPeriodo.consumo)}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Média: {fmtQty(itemPeriodo.media)}/mês
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}