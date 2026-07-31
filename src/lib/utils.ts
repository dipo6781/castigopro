import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Debtor } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Parse YYYY-MM-DD as local date to avoid UTC timezone hydration mismatches */
function parseLocalDate(dateStr: string): Date {
  const part = dateStr.slice(0, 10);
  const [y, m, d] = part.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = parseLocalDate(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function daysBetween(dateStr: string, nowMs?: number): number {
  const d = parseLocalDate(dateStr);
  const now = nowMs !== undefined ? new Date(nowMs) : new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = start.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Score of recovery probability for written-off debt (0-100) */
export function calculateRecoveryScore(debtor: Partial<Debtor>): number {
  let score = 50;

  const amount = debtor.currentBalance || 0;
  if (amount > 0 && amount < 500) score += 15;
  else if (amount >= 500 && amount < 3000) score += 25;
  else if (amount >= 3000 && amount < 10000) score += 10;
  else score -= 5;

  const days =
    debtor.daysSinceWriteOff ??
    daysBetween(debtor.writeOffDate || "2025-01-01");
  if (days < 90) score += 25;
  else if (days < 180) score += 15;
  else if (days < 365) score += 5;
  else if (days > 730) score -= 20;

  if (debtor.phone && debtor.phone.length > 7) score += 10;

  if (debtor.status === "promesa") score += 15;
  if (debtor.status === "recuperado") score = 100;
  if (debtor.status === "incobrable") score = 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600 bg-emerald-50";
  if (score >= 45) return "text-amber-600 bg-amber-50";
  return "text-rose-600 bg-rose-50";
}

export function getStatusBadge(status: Debtor["status"]) {
  const map = {
    pendiente: { label: "Pendiente", class: "bg-slate-100 text-slate-700" },
    en_gestion: { label: "En gestión", class: "bg-blue-100 text-blue-700" },
    promesa: { label: "Promesa", class: "bg-amber-100 text-amber-700" },
    recuperado: { label: "Recuperado", class: "bg-emerald-100 text-emerald-700" },
    incobrable: { label: "Incobrable", class: "bg-rose-100 text-rose-700" },
  };
  return map[status] || map.pendiente;
}

export function prioritizeDebtors(debtors: Debtor[]): Debtor[] {
  return [...debtors]
    .filter((d) => d.status !== "recuperado" && d.status !== "incobrable")
    .sort((a, b) => b.recoveryScore - a.recoveryScore);
}

/** Active PTP derived from latest promesa_pago management per debtor */
export interface ActivePromise {
  debtorId: string;
  debtorName: string;
  phone: string;
  amount: number;
  promiseDate: string;
  managementId: string;
  daysUntilDue: number;
  isOverdue: boolean;
  isDueToday: boolean;
}

export function getActivePromises(
  debtors: { id: string; name: string; phone: string; status: string }[],
  managements: {
    id: string;
    debtorId: string;
    result: string;
    promiseAmount?: number;
    promiseDate?: string;
    date: string;
  }[]
): ActivePromise[] {
  const byDebtor = new Map<string, (typeof managements)[0]>();
  for (const m of managements) {
    if (m.result !== "promesa_pago" || !m.promiseDate) continue;
    const prev = byDebtor.get(m.debtorId);
    if (!prev || m.date > prev.date) byDebtor.set(m.debtorId, m);
  }

  const result: ActivePromise[] = [];
  for (const d of debtors) {
    if (d.status !== "promesa") continue;
    const m = byDebtor.get(d.id);
    if (!m?.promiseDate) continue;
    const due = m.promiseDate.slice(0, 10);
    const daysFromDue = daysBetween(due);
    result.push({
      debtorId: d.id,
      debtorName: d.name,
      phone: d.phone,
      amount: m.promiseAmount || 0,
      promiseDate: due,
      managementId: m.id,
      daysUntilDue: -daysFromDue,
      isOverdue: daysFromDue > 0,
      isDueToday: daysFromDue === 0,
    });
  }
  return result.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export function escapeCsv(value: string | number | undefined | null): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, rows: string[][]) {
  const bom = "\uFEFF";
  const body = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type MessageTemplate = {
  id: string;
  channel: "whatsapp" | "sms" | "email";
  title: string;
  body: string;
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "wa-saludo",
    channel: "whatsapp",
    title: "Saludo inicial",
    body: "Hola {nombre}, le escribimos de {institucion} respecto a su cuenta con saldo de {saldo}. Queremos ayudarle a regularizar su situación de forma flexible. ¿Podemos conversar unos minutos?",
  },
  {
    id: "wa-quita",
    channel: "whatsapp",
    title: "Oferta de quita",
    body: "Hola {nombre}, tenemos una oferta especial para liquidar su cuenta: puede pagar solo {quita} (descuento del {porcentaje}%) y cerrar el caso. Esta propuesta es por tiempo limitado. ¿Le interesa?",
  },
  {
    id: "wa-promesa",
    channel: "whatsapp",
    title: "Recordatorio de promesa",
    body: "Hola {nombre}, le recordamos su compromiso de pago de {saldo_promesa} para el {fecha_promesa}. Si ya realizó el pago, ignore este mensaje. Si necesita reprogramar, respóndanos por este medio.",
  },
  {
    id: "wa-vencida",
    channel: "whatsapp",
    title: "Promesa vencida",
    body: "Hola {nombre}, notamos que la promesa de pago de {saldo_promesa} prevista para el {fecha_promesa} aún no se refleja. ¿Podemos ayudarle a reprogramar o aplicar una quita para facilitar el cierre?",
  },
  {
    id: "sms-corto",
    channel: "sms",
    title: "SMS corto",
    body: "{institucion}: Hola {nombre}, saldo {saldo}. Oferta de liquidación disponible. Info: {telefono_agente}",
  },
  {
    id: "email-formal",
    channel: "email",
    title: "Email formal",
    body: "Estimado/a {nombre},\n\nNos dirigimos a usted en relación con la cuenta asociada al documento {documento}, con saldo pendiente de {saldo}.\n\nDeseamos ofrecerle alternativas de pago y posibles descuentos por liquidación anticipada.\n\nQuedamos atentos a su respuesta.\n\nSaludos cordiales,\n{agente}\n{institucion}",
  },
];

export function fillTemplate(
  body: string,
  vars: Record<string, string>
): string {
  return body.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
