"use client";

import { useMemo, useState } from "react";
import {
  MESSAGE_TEMPLATES,
  fillTemplate,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { useAgentName } from "@/hooks/useCastigoStore";
import type { Debtor } from "@/types";
import { Copy, Check, MessageCircle, Mail, Smartphone } from "lucide-react";

type Props = {
  debtor: Debtor;
  promiseAmount?: number;
  promiseDate?: string;
  quitaAmount?: number;
  quitaPercent?: number;
};

export function MessageTemplates({
  debtor,
  promiseAmount,
  promiseDate,
  quitaAmount,
  quitaPercent,
}: Props) {
  const agentName = useAgentName();
  const [copied, setCopied] = useState<string | null>(null);
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email" | "all">(
    "whatsapp"
  );

  const vars = useMemo(
    () => ({
      nombre: debtor.name.split(" ")[0] || debtor.name,
      documento: debtor.document,
      saldo: formatCurrency(debtor.currentBalance),
      quita: quitaAmount
        ? formatCurrency(quitaAmount)
        : formatCurrency(Math.round(debtor.currentBalance * 0.5)),
      porcentaje: String(quitaPercent ?? 50),
      fecha_promesa: promiseDate ? formatDate(promiseDate) : "—",
      saldo_promesa: promiseAmount
        ? formatCurrency(promiseAmount)
        : formatCurrency(debtor.currentBalance),
      agente: agentName,
      institucion: "CastigoPro",
      telefono_agente: "",
    }),
    [debtor, agentName, promiseAmount, promiseDate, quitaAmount, quitaPercent]
  );

  const templates = MESSAGE_TEMPLATES.filter(
    (t) => channel === "all" || t.channel === channel
  );

  const copy = async (id: string, body: string) => {
    const filled = fillTemplate(body, vars);
    await navigator.clipboard.writeText(filled);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openWhatsApp = (body: string) => {
    const filled = fillTemplate(body, vars);
    const phone = debtor.phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(filled)}`,
      "_blank"
    );
  };

  const icon = (ch: string) => {
    if (ch === "whatsapp") return <MessageCircle className="h-3.5 w-3.5" />;
    if (ch === "sms") return <Smartphone className="h-3.5 w-3.5" />;
    return <Mail className="h-3.5 w-3.5" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold text-slate-900">Plantillas de mensaje</h3>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {(["whatsapp", "sms", "email", "all"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize ${
                channel === c
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {c === "all" ? "Todas" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {templates.map((t) => {
          const filled = fillTemplate(t.body, vars);
          return (
            <div
              key={t.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  {icon(t.channel)}
                  {t.title}
                </div>
                <div className="flex gap-1">
                  {t.channel === "whatsapp" && (
                    <button
                      onClick={() => openWhatsApp(t.body)}
                      className="rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800"
                    >
                      Abrir WA
                    </button>
                  )}
                  <button
                    onClick={() => copy(t.id, t.body)}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    {copied === t.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                {filled}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
