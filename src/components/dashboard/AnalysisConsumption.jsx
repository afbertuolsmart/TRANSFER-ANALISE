import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const WINDOWS = [
  { key: "consumo_1m", label: "Último mês", months: 1 },
  { key: "consumo_3m", label: "Últimos 3 meses", months: 3 },
  { key: "consumo_6m", label: "Últimos 6 meses", months: 6 },
  { key: "consumo_12m", label: "Últimos 12 meses", months: 12 },
];

function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  const str = String(value).trim();

  // DD/MM/YYYY
  const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (br) {
    const [, day, month, year] = br;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  // YYYY-MM-DD
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    const [, year, month, day] = iso;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  const d = new Date(str);

  return isNaN(d.getTime()) ? null : d;
}

function getItemCode(row) {
  return (
    row.cod_prod ??
    row.produto ??
    row.codigo ??
    row.codProduto ??
    ""
  );
}

function getDescription(row) {
  return (
    row.desc_completa ??
    row.descricao ??
    row.descricao_produto ??
    row["Descrição do produto"] ??
    "Sem descrição"
  );
}

function getQuantity(row) {
  return Number(
    row.qtd_movimentada ??
    row.qtdMovimentada ??
    row.quantidade ??
    row["Qtd.movimentada"] ??
    0
  );
}

function getFamily(row) {
  return (
    row.familia ??
    row.família ??
    row.familia_produto ??
    "Sem família"
  );
}

export function AnalysisConsumption({ data, onBack }) {
  const [windowKey, setWindowKey] = useState("consumo_3m");

  const windowConfig =
    WINDOWS.find(w => w.key === windowKey) || WINDOWS[1];

  const ranking = useMemo(() => {
    const registros = Array.isArray(data?.consumo)
      ? data.consumo
      : [];

    if (!registros.length) {
      return [];
    }

    const agora = new Date();

    const cutoff = new Date(agora);

    cutoff.setMonth(
      cutoff.getMonth() - windowConfig.months
    );

    const itens = {};

    registros.forEach(row => {
      const dataMovimento = parseDate(
        row.dt_movto ??
        row.data ??
        row.dtMovto
      );

      if (!dataMovimento) return;

      if (dataMovimento < cutoff) return;

      const quantidade = getQuantity(row);

      if (!quantidade) return;

      const codigo = String(getItemCode(row)).trim();

      if (!codigo) return;

      if (!itens[codigo]) {
        itens[codigo] = {
          codigo,
          descricao: getDescription(row),
          familia: getFamily(row),
          consumo: 0,
        };
      }

      itens[codigo].consumo += quantidade;
    });

    return Object.values(itens)
      .map(item => ({
        ...item,
        mediaMes:
          item.consumo / windowConfig.months,
      }))
      .sort((a, b) => b.consumo - a.consumo);
  }, [data, windowConfig]);

  const consumoTotal = ranking.reduce(
    (total, item) => total + item.consumo,
    0
  );

  return (
    <div className="space-y-6">

        <div className="flex items-center gap-3">

      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

    </div>


      <div>
        <h1 className="text-2xl font-bold">
          Transfer com Maior Consumo
        </h1>

        <p className="text-sm text-muted-foreground">
          Ranking de consumo por item
        </p>
      </div>

      <Card className="p-4">

        <div className="flex flex-wrap gap-2">

          {WINDOWS.map(window => (

            <button
              key={window.key}
              onClick={() =>
                setWindowKey(window.key)
              }
              className={`rounded-lg border px-4 py-2 text-sm ${
                windowKey === window.key
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {window.label}
            </button>

          ))}

        </div>

      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Itens analisados
          </div>

          <div className="text-2xl font-bold mt-1">
            {ranking.length}
          </div>

        </Card>

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Consumo total
          </div>

          <div className="text-2xl font-bold mt-1">
            {consumoTotal.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            })}
          </div>

        </Card>

        <Card className="p-4">

          <div className="text-xs text-muted-foreground">
            Período
          </div>

          <div className="text-2xl font-bold mt-1">
            {windowConfig.months}{" "}
            {windowConfig.months === 1
              ? "mês"
              : "meses"}
          </div>

        </Card>

      </div>

      <Card className="overflow-hidden">

        <div className="p-4 border-b">

          <h2 className="font-semibold">
            Ranking de Consumo
          </h2>

          <p className="text-sm text-muted-foreground">
            Itens com maior consumo no período selecionado
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50 border-b">

              <tr>

                <th className="text-left p-3">
                  #
                </th>

                <th className="text-left p-3">
                  Código
                </th>

                <th className="text-left p-3">
                  Item
                </th>

                <th className="text-left p-3">
                  Família
                </th>

                <th className="text-right p-3">
                  Consumo
                </th>

                <th className="text-right p-3">
                  Média / mês
                </th>

              </tr>

            </thead>

            <tbody>

              {ranking.map((item, index) => (

                <tr
                  key={item.codigo}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-3 font-medium">
                    {index + 1}
                  </td>

                  <td className="p-3 font-semibold">
                    {item.codigo}
                  </td>

                  <td className="p-3">
                    {item.descricao}
                  </td>

                  <td className="p-3 text-muted-foreground">
                    {item.familia}
                  </td>

                  <td className="p-3 text-right font-semibold">
                    {item.consumo.toLocaleString(
                      "pt-BR",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {item.mediaMes.toLocaleString(
                      "pt-BR",
                      {
                        maximumFractionDigits: 1,
                      }
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {ranking.length === 0 && (

          <div className="p-10 text-center text-muted-foreground">
            Nenhum item encontrado no período selecionado.
          </div>

        )}

      </Card>

    </div>
  );
}