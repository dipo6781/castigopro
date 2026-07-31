"use client";

import Link from "next/link";
import { useActivePromises } from "@/hooks/useCastigoStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertCircle, Clock, CalendarCheck } from "lucide-react";

export function PromisesPanel() {
  const promises = useActivePromises();
  const overdue = promises.filter((p) => p.isOverdue);
  const today = promises.filter((p) => p.isDueToday);
  const upcoming = promises.filter((p) => !p.isOverdue && !p.isDueToday);

  if (promises.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Promesas de pago (PTP)
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          No hay promesas activas. Cuando registres una promesa de pago, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Promesas de pago (PTP)
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {promises.length} activas
        </span>
      </div>

      <div className="space-y-4">
        {overdue.length > 0 && (
          <PromiseGroup
            title="Vencidas"
            icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
            items={overdue}
            tone="rose"
          />
        )}
        {today.length > 0 && (
          <PromiseGroup
            title="Vencen hoy"
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            items={today}
            tone="amber"
          />
        )}
        {upcoming.length > 0 && (
          <PromiseGroup
            title="Próximas"
            icon={<CalendarCheck className="h-4 w-4 text-emerald-600" />}
            items={upcoming}
            tone="emerald"
          />
        )}
      </div>
    </div>
  );
}

function PromiseGroup({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: ReturnType<typeof useActivePromises>;
  tone: "rose" | "amber" | "emerald";
}) {
  const bg = {
    rose: "bg-rose-50 border-rose-100",
    amber: "bg-amber-50 border-amber-100",
    emerald: "bg-emerald-50 border-emerald-100",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {icon}
        {title} ({items.length})
      </div>
      <div className="space-y-2">
        {items.map((p) => (
          <Link
            key={p.managementId}
            href={`/caso/${p.debtorId}`}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition hover:opacity-90 ${bg}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {p.debtorName}
              </p>
              <p className="text-[11px] text-slate-500">
                {formatDate(p.promiseDate)}
                {p.isOverdue
                  ? ` · ${Math.abs(p.daysUntilDue)}d vencida`
                  : p.isDueToday
                    ? " · hoy"
                    : ` · en ${p.daysUntilDue}d`}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-800">
              {formatCurrency(p.amount)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
