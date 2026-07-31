"use client";

import { usePortfolioStats } from "@/hooks/useCastigoStore";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Users, Target, TrendingUp } from "lucide-react";

export function StatsCards() {
  const stats = usePortfolioStats();

  const cards = [
    {
      label: "Saldo en gestión",
      value: formatCurrency(stats.totalBalance),
      sub: `${stats.totalAccounts} cuentas`,
      icon: DollarSign,
      color: "bg-slate-900 text-white",
    },
    {
      label: "Recuperado hoy",
      value: formatCurrency(stats.recoveredToday),
      sub: "Pagos + quitas",
      icon: TrendingUp,
      color: "bg-brand-600 text-white",
    },
    {
      label: "Promesas activas",
      value: String(stats.promisesActive),
      sub: "Por cobrar",
      icon: Target,
      color: "bg-amber-500 text-white",
    },
    {
      label: "Score promedio",
      value: `${stats.avgScore}`,
      sub: "Probabilidad recupero",
      icon: Users,
      color: "bg-blue-600 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{c.label}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {c.value}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{c.sub}</p>
              </div>
              <div className={`rounded-xl p-2 ${c.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
