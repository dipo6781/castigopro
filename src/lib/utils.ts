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
