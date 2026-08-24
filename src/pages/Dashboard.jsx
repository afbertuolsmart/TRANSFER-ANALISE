import React, { useState, useEffect, useMemo } from "react";

import {
  loadAllData,
  aggregateData,
  getSummary,
} from "@/lib/dashboardData";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { FamilyCard } from "@/components/dashboard/FamilyCard";
import { ColorAnalysisPanel } from "@/components/dashboard/ColorAnalysisPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AnalysisConsumption } from "@/components/dashboard/AnalysisConsumption";
import { AnalysisGrowth } from "@/components/dashboard/AnalysisGrowth";

import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [selectedFamily, setSelectedFamily] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);

  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const [focusedFamily, setFocusedFamily] = useState(null);

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  useEffect(() => {
    loadAllData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(e);
        setLoading(false);
      });
  }, []);

  // ============================================================
  // ATUALIZAÇÃO AUTOMÁTICA DOS DADOS
  // ============================================================

  useEffect(() => {
    let last = null;
    let active = true;

    const base = import.meta.env.BASE_URL;

    const check = async () => {
      try {
        const res = await fetch(
          `${base}data/_version.json`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) return;

        const v = await res.json();

        if (!active || v.updatedAt === last) return;

        if (last !== null) {
          const d = await loadAllData();

          if (active) {
            setData(d);
          }
        }

        last = v.updatedAt;
      } catch {
        // Arquivo de versão ainda não existe
      }
    };

    check();

    const id = setInterval(check, 10000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // ============================================================
  // AGRUPAMENTO POR FAMÍLIA
  // ============================================================

  const families = useMemo(() => {
    if (!data) return [];

    return aggregateData(data);
  }, [data]);

  // ============================================================
  // RESUMO
  // ============================================================

  const summary = useMemo(() => {
    if (!data) return null;

    return getSummary(data);
  }, [data]);

  // ============================================================
  // PESQUISA
  // ============================================================

  const filtered = useMemo(() => {
    if (!search) return families;

    const s = search.toLowerCase();

    return families.filter((f) =>
      f.familia.toLowerCase().includes(s)
    );
  }, [families, search]);

  // ============================================================
  // SELECIONAR ITEM
  // ============================================================

  const handleSelectItem = (familia, item) => {
    setSelectedFamily(familia);
    setSelectedItem(item);
  };

  // ============================================================
  // FAMÍLIA DO ITEM SELECIONADO
  // ============================================================

  const selectedFam = selectedFamily
    ? families.find(
        (f) => f.familia === selectedFamily
      )
    : null;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-slate-400" />

          <p className="text-sm text-muted-foreground">
            Carregando dados...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERRO
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-destructive">
          Erro ao carregar dados. Tente novamente.
        </p>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        activeAnalysis={activeAnalysis}
        onSelectAnalysis={(analysis) => {

          setActiveAnalysis(analysis);

          // Limpa seleção de item
          setSelectedItem(null);

          setSelectedFamily(null);

          // Limpa família em foco
          setFocusedFamily(null);

        }}
      />

      {/* ======================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <main className="flex-1 p-4 md:p-6">

        <div className="max-w-7xl mx-auto">

          {/* ==================================================
              ANÁLISE DE CONSUMO POR ITEM
          ================================================== */}

          {activeAnalysis === "consumo" && (
  <AnalysisConsumption
    data={data}
    onBack={() => setActiveAnalysis(null)}
  />
)}

          {/* ==================================================
              ANÁLISE DE CRESCIMENTO POR ITEM
          ================================================== */}

          {activeAnalysis === "crescimento" && (
  <AnalysisGrowth
    data={data}
    onBack={() => setActiveAnalysis(null)}
  />
)}

          {/* ==================================================
              DASHBOARD PRINCIPAL
          ================================================== */}

          {!activeAnalysis && (
            <>

              {/* ==============================================
                  CABEÇALHO
              ============================================== */}

              <div className="mb-6">

                <h1 className="text-2xl font-bold">
                  Análise de Transfer
                </h1>

                <p className="text-sm text-muted-foreground mt-1">
                  Estoque • Compras • Consumo
                </p>

              </div>

              {/* ==============================================
                  PESQUISA
              ============================================== */}

              <div className="mb-6">

                <input
                  type="text"
                  placeholder="Pesquisar família..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-lg border bg-white px-4 py-3"
                />

              </div>

              {/* ==============================================
                  RESUMO
              ============================================== */}

              {summary && (
                <div className="mb-6">

                  <SummaryCards
                    summary={summary}
                  />

                </div>
              )}

              {/* ==============================================
                  TÍTULO FAMÍLIAS
              ============================================== */}

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-lg font-semibold">
                  Famílias de Produtos
                </h2>

                <span className="text-sm text-muted-foreground">
                  {filtered.length} famílias
                </span>

              </div>

              {/* ==============================================
                  ITEM SELECIONADO
              ============================================== */}

              {selectedItem && selectedFam ? (

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* ==========================================
                      FAMÍLIA
                  ========================================== */}

                  <div className="lg:col-span-1">

                    <FamilyCard
                      family={selectedFam}
                      forceExpanded
                      selectedItem={selectedItem.codigo}
                      onSelectItem={handleSelectItem}
                    />

                  </div>

                  {/* ==========================================
                      ANÁLISE DO ITEM
                  ========================================== */}

                  <div className="lg:col-span-2">

                    <ColorAnalysisPanel
                      item={selectedItem}
                      onBack={() => {

                        setSelectedItem(null);

                        setSelectedFamily(null);

                      }}
                    />

                  </div>

                </div>

              ) : (

                <>

                  {/* ==========================================
                      FAMÍLIAS
                  ========================================== */}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {filtered
                      .filter(
                        (fam) =>
                          !focusedFamily ||
                          focusedFamily === fam.familia
                      )
                      .map((fam) => (

                        <FamilyCard
                          key={fam.familia}
                          family={fam}
                          onSelectItem={handleSelectItem}
                          forceExpanded={
                            focusedFamily === fam.familia
                          }
                          onFocus={() =>
                            setFocusedFamily((prev) =>
                              prev === fam.familia
                                ? null
                                : fam.familia
                            )
                          }
                        />

                      ))}

                  </div>

                  {/* ==========================================
                      SEM RESULTADOS
                  ========================================== */}

                  {filtered.length === 0 && (

                    <div className="text-center py-12 text-muted-foreground">

                      Nenhuma família encontrada com os filtros selecionados.

                    </div>

                  )}

                </>

              )}

            </>
          )}

        </div>

      </main>

    </div>
  );
}