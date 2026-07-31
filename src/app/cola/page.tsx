"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { DebtorCard } from "@/components/DebtorCard";
import { NextCaseButton } from "@/components/NextCaseButton";
import { usePrioritizedQueue } from "@/hooks/useCastigoStore";
import { Search, Filter, X } from "lucide-react";
import type { Debtor } from "@/types";

type StatusFilter = Debtor["status"] | "todos";

export default function ColaPage() {
  const queue = usePrioritizedQueue();
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minDays, setMinDays] = useState("");
  const [maxDays, setMaxDays] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [product, setProduct] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const products = useMemo(() => {
    const set = new Set<string>();
    queue.forEach((d) => {
      if (d.product) set.add(d.product);
    });
    return Array.from(set).sort();
  }, [queue]);

  const filtered = useMemo(() => {
    const minA = minAmount ? Number(minAmount) : null;
    const maxA = maxAmount ? Number(maxAmount) : null;
    const minD = minDays ? Number(minDays) : null;
    const maxD = maxDays ? Number(maxDays) : null;

    return queue.filter((d) => {
      const matchQuery =
        !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.document.includes(query) ||
        d.phone.includes(query);
      if (!matchQuery) return false;
      if (d.recoveryScore < minScore) return false;
      if (minA !== null && d.currentBalance < minA) return false;
      if (maxA !== null && d.currentBalance > maxA) return false;
      if (minD !== null && d.daysSinceWriteOff < minD) return false;
      if (maxD !== null && d.daysSinceWriteOff > maxD) return false;
      if (status !== "todos" && d.status !== status) return false;
      if (product && d.product !== product) return false;
      return true;
    });
  }, [queue, query, minScore, minAmount, maxAmount, minDays, maxDays, status, product]);

  const clearFilters = () => {
    setMinScore(0);
    setMinAmount("");
    setMaxAmount("");
    setMinDays("");
    setMaxDays("");
    setStatus("todos");
    setProduct("");
    setQuery("");
  };

  const activeFilterCount = [
    minScore > 0,
    !!minAmount,
    !!maxAmount,
    !!minDays,
    !!maxDays,
    status !== "todos",
    !!product,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Cola de Trabajo</h1>
            <p className="text-sm text-slate-500">
              {filtered.length} de {queue.length} cuentas · orden por score
            </p>
          </div>
          <div className="w-full max-w-xs sm:w-auto">
            <NextCaseButton />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por nombre, documento o teléfono..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Filtros avanzados</p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                <X className="h-3.5 w-3.5" /> Limpiar
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500">Score mínimo</label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value={0}>Todos</option>
                  <option value={40}>≥ 40</option>
                  <option value={60}>≥ 60</option>
                  <option value={75}>≥ 75 (alto potencial)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_gestion">En gestión</option>
                  <option value="promesa">Promesa</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Producto</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Monto mín.</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Monto máx.</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="Sin límite"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Días castigo mín.</label>
                <input
                  type="number"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Días castigo máx.</label>
                <input
                  type="number"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  placeholder="Sin límite"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DebtorCard key={d.id} debtor={d} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No hay resultados con los filtros actuales.
          </div>
        )}
      </main>
    </div>
  );
}
