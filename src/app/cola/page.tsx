"use client";

import { Header } from "@/components/Header";
import { DebtorCard } from "@/components/DebtorCard";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function ColaPage() {
  const queue = useAppStore((s) => s.getPrioritizedQueue());
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);

  const filtered = queue.filter((d) => {
    const matchQuery =
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.document.includes(query) ||
      d.phone.includes(query);
    const matchScore = d.recoveryScore >= minScore;
    return matchQuery && matchScore;
  });

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi Cola de Trabajo</h1>
          <p className="text-sm text-slate-500">
            {filtered.length} cuentas ordenadas por probabilidad de recupero
          </p>
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
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="border-0 bg-transparent text-sm outline-none"
            >
              <option value={0}>Todos los scores</option>
              <option value={40}>Score ≥ 40</option>
              <option value={60}>Score ≥ 60</option>
              <option value={75}>Score ≥ 75 (alto potencial)</option>
            </select>
          </div>
        </div>

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
