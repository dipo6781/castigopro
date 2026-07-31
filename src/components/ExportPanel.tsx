"use client";

import {
  useDebtors,
  useManagements,
} from "@/hooks/useCastigoStore";
import { downloadCsv, formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

export function ExportPanel() {
  const debtors = useDebtors();
  const managements = useManagements();

  const exportDebtors = () => {
    const rows = [
      [
        "id",
        "nombre",
        "documento",
        "telefono",
        "email",
        "saldo",
        "monto_original",
        "fecha_castigo",
        "dias_castigo",
        "producto",
        "score",
        "estado",
      ],
      ...debtors.map((d) => [
        d.id,
        d.name,
        d.document,
        d.phone,
        d.email || "",
        d.currentBalance,
        d.originalAmount,
        d.writeOffDate,
        d.daysSinceWriteOff,
        d.product || "",
        d.recoveryScore,
        d.status,
      ]),
    ];
    downloadCsv(`castigopro-cartera-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const exportManagements = () => {
    const debtorMap = new Map(debtors.map((d) => [d.id, d]));
    const rows = [
      [
        "id",
        "fecha",
        "deudor",
        "documento",
        "canal",
        "resultado",
        "monto_promesa",
        "fecha_promesa",
        "quita",
        "notas",
        "agente",
      ],
      ...managements.map((m) => {
        const d = debtorMap.get(m.debtorId);
        return [
          m.id,
          m.date,
          d?.name || m.debtorId,
          d?.document || "",
          m.channel,
          m.result,
          m.promiseAmount ?? "",
          m.promiseDate || "",
          m.settlementOffer ?? "",
          m.notes,
          m.createdBy,
        ];
      }),
    ];
    downloadCsv(
      `castigopro-gestiones-${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  const exportRecovered = () => {
    const recovered = debtors.filter((d) => d.status === "recuperado");
    const rows = [
      ["id", "nombre", "documento", "saldo_restante", "producto", "score"],
      ...recovered.map((d) => [
        d.id,
        d.name,
        d.document,
        d.currentBalance,
        d.product || "",
        d.recoveryScore,
      ]),
    ];
    downloadCsv(
      `castigopro-recuperados-${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Download className="h-4 w-4" /> Exportar historial
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Descarga CSV para reportes al banco o supervisor. Incluye BOM UTF-8 para Excel.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={exportDebtors}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Exportar cartera ({debtors.length})
        </button>
        <button
          onClick={exportManagements}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Exportar gestiones ({managements.length})
        </button>
        <button
          onClick={exportRecovered}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Exportar recuperados
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Generado {formatDate(new Date().toISOString().slice(0, 10))}
      </p>
    </div>
  );
}
