import React, { useState, useEffect, useMemo } from 'react';
import { loadAllData, aggregateData, getSummary } from '@/lib/dashboardData';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FamilyCard } from '@/components/dashboard/FamilyCard';
import { Loader2 } from 'lucide-react';
import { ColorAnalysisPanel } from "@/components/dashboard/ColorAnalysisPanel";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [focusedFamily, setFocusedFamily] = useState(null);

  useEffect(() => {
    loadAllData()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setError(e); setLoading(false); });
  }, []);

  // Auto-refresh when the local sync script regenerates the JSON files.
  useEffect(() => {
    let last = null;
    let active = true;
    const base = import.meta.env.BASE_URL;
    const check = async () => {
      try {
        const res = await fetch(`${base}data/_version.json`, { cache: 'no-store' });
        if (!res.ok) return;
        const v = await res.json();
        if (!active || v.updatedAt === last) return;
        if (last !== null) {
          const d = await loadAllData();
          if (active) setData(d);
        }
        last = v.updatedAt;
      } catch { /* no version file yet */ }
    };
    check();
    const id = setInterval(check, 10000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const families = useMemo(() => {
    if (!data) return [];
    return aggregateData(data);
  }, [data]);

  const summary = useMemo(() => {
    if (!data) return null;
    return getSummary(data);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search) return families;
    const s = search.toLowerCase();
    return families.filter(f => f.familia.toLowerCase().includes(s));
  }, [families, search]);

const handleSelectItem = (familia, item) => {
  setSelectedFamily(familia);
  setSelectedItem(item);
};

const selectedFam = selectedFamily
  ? families.find(f => f.familia === selectedFamily)
  : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-destructive">Erro ao carregar dados. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
Análise de Transfer
</h1>

<p className="text-sm text-muted-foreground mt-1">
Estoque • Compras • Consumo
</p>
        </div>

        <div className="mb-6">
  <input
    type="text"
    placeholder="Pesquisar família..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full rounded-lg border bg-white px-4 py-3"
  />
</div>

        {summary && (
          <div className="mb-6">
            <SummaryCards summary={summary} />
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Famílias de Produtos</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} famílias</span>
        </div>

       {selectedItem && selectedFam ? (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

    <div className="lg:col-span-1">

      <FamilyCard
    family={selectedFam}
    forceExpanded
    selectedItem={selectedItem.codigo}
    onSelectItem={handleSelectItem}
/>

    </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{filtered
  .filter(fam => !focusedFamily || focusedFamily === fam.familia)
  .map(fam => (
    <FamilyCard
      key={fam.familia}
      family={fam}
      onSelectItem={handleSelectItem}
      forceExpanded={focusedFamily === fam.familia}
      onFocus={() =>
        setFocusedFamily(prev =>
  prev === fam.familia
    ? null
    : fam.familia
)
      }
    />
))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma família encontrada com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}