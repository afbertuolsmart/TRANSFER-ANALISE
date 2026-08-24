import { fmtQty, calcCobertura } from "@/lib/dashboardData";

export function ProductRow({
  produto,
  selected,
  onSelect
}) {

  const c = calcCobertura(produto);

  return (

    <div
      onClick={onSelect}
      className={`rounded-lg border p-3 cursor-pointer ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "bg-white hover:bg-slate-50"
      }`}
    >

      <div className="flex justify-between">

        <strong>

          {produto.codigo}

        </strong>

        <span>

          {fmtQty(produto.estoque)}

        </span>

      </div>

      <div className="text-xs text-muted-foreground mt-1">

        {produto.descricao}

      </div>

      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">

        <div>

          <div>Comp.</div>

          <strong>

            {fmtQty(produto.compras)}

          </strong>

        </div>

        <div>

          <div>Cons.</div>

          <strong>

            {fmtQty(produto.consumo)}

          </strong>

        </div>

        <div>

          <div>Cob.</div>

          <strong>

            {Number.isFinite(c.coberturaMeses)
              ? c.coberturaMeses.toFixed(1)
              : "∞"}

          </strong>

        </div>

        <div>

          <div>Comprar</div>

          <strong className="text-red-600">

            {fmtQty(c.qtdSugerida)}

          </strong>

        </div>

      </div>

    </div>

  );

}