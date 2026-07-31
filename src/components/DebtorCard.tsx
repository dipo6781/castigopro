"use client";

import Link from "next/link";
import { Debtor } from "@/types";
import { formatCurrency, formatDate, getScoreColor, getStatusBadge } from "@/lib/utils";
import { Phone, ChevronRight, Calendar } from "lucide-react";

export function DebtorCard({ debtor }: { debtor: Debtor }) {
  const status = getStatusBadge(debtor.status);
  const scoreClass = getScoreColor(debtor.recoveryScore);

  return (
    <Link
      href={`/caso/${debtor.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-700">
              {debtor.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.class}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {debtor.document} · {debtor.product || "Sin producto"}
          </p>
        </div>
        <div className={`rounded-lg px-2 py-1 text-xs font-bold ${scoreClass}`}>
          {debtor.recoveryScore}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(debtor.currentBalance)}
          </p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" />
            Castigo: {formatDate(debtor.writeOffDate)} ({debtor.daysSinceWriteOff}d)
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Phone className="h-4 w-4" />
          <span className="text-xs">{debtor.phone.slice(-4)}</span>
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </div>
      </div>
    </Link>
  );
}
