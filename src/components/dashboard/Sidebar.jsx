import React from "react";
import { BarChart3, ChevronRight } from "lucide-react";

export function Sidebar({ activeAnalysis, onSelectAnalysis }) {
  return (
    <aside className="w-64 min-h-screen border-r bg-white p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold">Transfer</h2>
        <p className="text-xs text-muted-foreground">
          Análises e indicadores
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 px-2 mb-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4" />
          Análises
        </div>

        <button
          onClick={() => onSelectAnalysis("consumo")}
          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition ${
            activeAnalysis === "consumo"
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-100"
          }`}
        >
          <span>Maior consumo por período</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onSelectAnalysis("crescimento")}
          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition mt-1 ${
            activeAnalysis === "crescimento"
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-100"
          }`}
        >
          <span>Maior crescimento % - 3 meses</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}