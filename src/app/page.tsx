"use client";

import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { DebtorCard } from "@/components/DebtorCard";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const queue = useAppStore((s) => s.getPrioritizedQueue());
  const top = queue.slice(0, 5);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-brand-200">
                Bienvenido a CastigoPro
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Tu cola de alto potencial
              </h1>
              <p className="mt-2 max-w-md text-sm text-brand-100">
                Priorizamos las cuentas castigadas con mayor probabilidad de
                recupero. Enfócate en las que realmente valen la pena.
              </p>
            </div>
            <Sparkles className="h-8 w-8 text-brand-300 opacity-80" />
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/cola"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-brand-50"
            >
              Ver mi cola completa
            </Link>
            <Link
              href="/importar"
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Importar cartera
            </Link>
          </div>
        </div>

        <StatsCards />

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              Recordatorio de buenas prácticas
            </p>
            <p className="mt-1 text-amber-800">
              Respeta horarios locales (generalmente 8:00–20:00), máximo 2–3
              contactos diarios por deudor, identifica siempre tu institución y
              nunca uses lenguaje intimidatorio. Todo queda registrado para
              auditoría.
            </p>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Top 5 prioritarios
            </h2>
            <Link
              href="/cola"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          {top.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-slate-500">
                No hay cuentas pendientes. Importa una cartera para empezar.
              </p>
              <Link
                href="/importar"
                className="mt-3 inline-block text-sm font-semibold text-brand-600"
              >
                Ir a importar
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {top.map((d) => (
                <DebtorCard key={d.id} debtor={d} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
