import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { fmtQty } from "@/lib/dashboardData";
import { ArrowLeft } from "lucide-react";

export function AnalysisGrowth({ data, onBack }) {

  const items = useMemo(() => {

    if (!data?.consumo) return [];

    const itens = {};

    data.consumo.forEach((r) => {

      const codigo = String(
        r.cod_prod || r.produto || ""
      ).trim();

      if (!codigo) return;

      const descricao =
        r.desc_completa ||
        r.descricao ||
        "";

      const qtd = Number(
        r.qtd_movimentada || 0
      );

      if (!itens[codigo]) {
        itens[codigo] = {
          codigo,
          descricao,
          atual: 0,
          anterior: 0,
        };
      }

      const dataMov = new Date(r.dt_movto);

      if (isNaN(dataMov.getTime())) return;

      const hoje = new Date();

      const limiteAtual = new Date(hoje);
      limiteAtual.setMonth(
        limiteAtual.getMonth() - 3
      );

      const limiteAnterior = new Date(hoje);
      limiteAnterior.setMonth(
        limiteAnterior.getMonth() - 6
      );

      if (dataMov >= limiteAtual) {

        itens[codigo].atual += qtd;

      } else if (dataMov >= limiteAnterior) {

        itens[codigo].anterior += qtd;

      }

    });

    return Object.values(itens)
      .map((item) => {

        let crescimento = 0;

        if (item.anterior > 0) {

          crescimento =
            ((item.atual - item.anterior) /
              item.anterior) *
            100;

        } else if (item.atual > 0) {

          crescimento = 999999;

        }

        return {
          ...item,
          crescimento,
        };

      })
      .filter(
        (item) =>
          item.atual > 0 ||
          item.anterior > 0
      )
      .sort(
        (a, b) =>
          b.crescimento - a.crescimento
      );

  }, [data]);

  return (

    <Card className="p-6">

      <div className="flex items-center gap-3 mb-6">
        
<button
    onClick={onBack}
    className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
  >
    <ArrowLeft className="h-4 w-4" />
    Voltar
  </button>

        <div className="rounded-lg bg-green-100 p-2">

          <TrendingUp className="h-5 w-5 text-green-700" />

        </div>

        <div>

          <h2 className="text-xl font-bold">

            Transfer com maior crescimento

          </h2>

          <p className="text-sm text-muted-foreground">

            Crescimento de consumo nos últimos 3 meses

          </p>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="border-b text-left">

              <th className="py-3 px-2">
                Código
              </th>

              <th className="py-3 px-2">
                Descrição
              </th>

              <th className="py-3 px-2 text-right">
                3 meses anteriores
              </th>

              <th className="py-3 px-2 text-right">
                Últimos 3 meses
              </th>

              <th className="py-3 px-2 text-right">
                Crescimento
              </th>

            </tr>

          </thead>

          <tbody>

            {items.slice(0, 50).map((item) => (

              <tr
                key={item.codigo}
                className="border-b hover:bg-slate-50"
              >

                <td className="py-3 px-2 font-semibold">
                  {item.codigo}
                </td>

                <td className="py-3 px-2">
                  {item.descricao}
                </td>

                <td className="py-3 px-2 text-right">
                  {fmtQty(item.anterior)}
                </td>

                <td className="py-3 px-2 text-right">
                  {fmtQty(item.atual)}
                </td>

                <td className="py-3 px-2 text-right">

                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      item.crescimento >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >

                    {item.crescimento >= 0
                      ? <ArrowUp className="h-4 w-4" />
                      : <ArrowDown className="h-4 w-4" />
                    }

                    {item.crescimento >= 999999
                      ? "Novo consumo"
                      : `${item.crescimento.toFixed(1)}%`
                    }

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {items.length === 0 && (

        <div className="text-center py-10 text-muted-foreground">

          Nenhum item encontrado.

        </div>

      )}

    </Card>

  );

}