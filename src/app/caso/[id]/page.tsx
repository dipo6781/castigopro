"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  useDebtor,
  useDebtorManagements,
  useDebtorActions,
} from "@/hooks/useCastigoStore";
import {
  formatCurrency,
  formatDate,
  getScoreColor,
  getStatusBadge,
} from "@/lib/utils";
import {
  Phone,
  MessageCircle,
  Mail,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { useState } from "react";
import { ContactChannel, ManagementResult } from "@/types";

const CHANNELS: { value: ContactChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Llamada" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "visit", label: "Visita" },
  { value: "other", label: "Otro" },
];

const RESULTS: { value: ManagementResult; label: string }[] = [
  { value: "contactado", label: "Contactado" },
  { value: "no_contesta", label: "No contesta" },
  { value: "numero_equivocado", label: "Número equivocado" },
  { value: "promesa_pago", label: "Promesa de pago" },
  { value: "pago_parcial", label: "Pago parcial" },
  { value: "pago_total", label: "Pago total" },
  { value: "acuerdo_quita", label: "Acuerdo de quita" },
  { value: "rechazo", label: "Rechazo" },
  { value: "escalado", label: "Escalado" },
  { value: "otro", label: "Otro" },
];

const QUITA_PRESETS = [40, 50, 60, 70, 80];

export default function CasoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const debtor = useDebtor(id);
  const managements = useDebtorManagements(id);
  const { addManagement, createSettlement, markAsRecovered } = useDebtorActions();

  const [showForm, setShowForm] = useState(false);
  const [showQuita, setShowQuita] = useState(false);
  const [channel, setChannel] = useState<ContactChannel>("whatsapp");
  const [result, setResult] = useState<ManagementResult>("contactado");
  const [notes, setNotes] = useState("");
  const [promiseAmount, setPromiseAmount] = useState("");
  const [promiseDate, setPromiseDate] = useState("");
  const [customQuita, setCustomQuita] = useState("");

  if (!debtor) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-10 text-center text-slate-500">
          Caso no encontrado.
          <button
            onClick={() => router.push("/cola")}
            className="mt-4 block w-full text-brand-600"
          >
            Volver a la cola
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(debtor.status);
  const scoreClass = getScoreColor(debtor.recoveryScore);

  const handleSubmitManagement = () => {
    addManagement({
      debtorId: id,
      channel,
      result,
      notes,
      promiseAmount: promiseAmount ? Number(promiseAmount) : undefined,
      promiseDate: promiseDate || undefined,
    });
    if (result === "pago_total" || result === "acuerdo_quita") {
      markAsRecovered(id, Number(promiseAmount) || debtor.currentBalance);
    }
    setShowForm(false);
    setNotes("");
    setPromiseAmount("");
    setPromiseDate("");
  };

  const applyQuita = (percent: number) => {
    const offered = Math.round(debtor.currentBalance * (1 - percent / 100));
    createSettlement(id, offered);
    addManagement({
      debtorId: id,
      channel: "whatsapp",
      result: "acuerdo_quita",
      notes: `Propuesta de quita del ${percent}% → pagar ${formatCurrency(offered)}`,
      settlementOffer: offered,
    });
    setShowQuita(false);
  };

  const applyCustomQuita = () => {
    const offered = Number(customQuita);
    if (!offered || offered >= debtor.currentBalance) return;
    const percent = Math.round(
      ((debtor.currentBalance - offered) / debtor.currentBalance) * 100
    );
    createSettlement(id, offered);
    addManagement({
      debtorId: id,
      channel: "whatsapp",
      result: "acuerdo_quita",
      notes: `Quita personalizada ${percent}% → ${formatCurrency(offered)}`,
      settlementOffer: offered,
    });
    setShowQuita(false);
    setCustomQuita("");
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{debtor.name}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.class}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Doc: {debtor.document} · {debtor.product}
              </p>
            </div>
            <div className={`rounded-xl px-3 py-1.5 text-sm font-bold ${scoreClass}`}>
              Score {debtor.recoveryScore}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500">Saldo actual</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(debtor.currentBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500">Días desde castigo</p>
              <p className="text-xl font-bold text-slate-900">
                {debtor.daysSinceWriteOff}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${debtor.phone}`}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <Phone className="h-3.5 w-3.5" /> {debtor.phone}
            </a>
            {debtor.email && (
              <a
                href={`mailto:${debtor.email}`}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
            <a
              href={`https://wa.me/${debtor.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Registrar gestión
          </button>
          <button
            onClick={() => setShowQuita(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-100"
          >
            <Percent className="h-4 w-4" /> Proponer quita
          </button>
        </div>

        {showQuita && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <h3 className="font-bold text-brand-900">Propuesta de quita</h3>
            <p className="mt-1 text-sm text-brand-700">
              En cartera castigada las quitas altas (50-80%) son la estrategia más efectiva.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUITA_PRESETS.map((p) => {
                const amount = Math.round(debtor.currentBalance * (1 - p / 100));
                return (
                  <button
                    key={p}
                    onClick={() => applyQuita(p)}
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 shadow-sm ring-1 ring-brand-200 hover:bg-brand-100"
                  >
                    -{p}% → {formatCurrency(amount)}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                placeholder="Monto personalizado a pagar"
                value={customQuita}
                onChange={(e) => setCustomQuita(e.target.value)}
                className="flex-1 rounded-xl border border-brand-200 px-3 py-2 text-sm"
              />
              <button
                onClick={applyCustomQuita}
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Aplicar
              </button>
            </div>
            <button
              onClick={() => setShowQuita(false)}
              className="mt-3 text-xs text-brand-600 underline"
            >
              Cancelar
            </button>
          </div>
        )}

        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Nueva gestión</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Canal</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as ContactChannel)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {CHANNELS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Resultado</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as ManagementResult)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {RESULTS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {(result === "promesa_pago" ||
                result === "pago_parcial" ||
                result === "pago_total" ||
                result === "acuerdo_quita") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Monto</label>
                    <input
                      type="number"
                      value={promiseAmount}
                      onChange={(e) => setPromiseAmount(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                  {result === "promesa_pago" && (
                    <div>
                      <label className="text-xs font-medium text-slate-500">
                        Fecha promesa
                      </label>
                      <input
                        type="date"
                        value={promiseDate}
                        onChange={(e) => setPromiseDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-500">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Detalle de la conversación, objeciones, acuerdos..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitManagement}
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
                >
                  Guardar gestión
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Historial de gestiones ({managements.length})
          </h2>
          {managements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              Aún no hay gestiones registradas
            </div>
          ) : (
            <div className="space-y-3">
              {managements.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {RESULTS.find((r) => r.value === m.result)?.label || m.result}
                      </p>
                      <p className="text-xs text-slate-500">
                        {CHANNELS.find((c) => c.value === m.channel)?.label} ·{" "}
                        {formatDate(m.date)} · {m.createdBy}
                      </p>
                    </div>
                    {(m.promiseAmount || m.settlementOffer) && (
                      <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                        {formatCurrency(m.promiseAmount || m.settlementOffer || 0)}
                      </span>
                    )}
                  </div>
                  {m.notes && (
                    <p className="mt-2 text-sm text-slate-600">{m.notes}</p>
                  )}
                  {m.promiseDate && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Promesa para {formatDate(m.promiseDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
