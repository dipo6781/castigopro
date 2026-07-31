"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Debtor,
  Management,
  SettlementOffer,
  ContactChannel,
  ManagementResult,
} from "@/types";
import { calculateRecoveryScore, daysBetween } from "@/lib/utils";

interface AppState {
  debtors: Debtor[];
  managements: Management[];
  settlements: SettlementOffer[];
  agentName: string;

  // Actions
  setAgentName: (name: string) => void;
  importDebtors: (rows: Partial<Debtor>[]) => void;
  addManagement: (data: {
    debtorId: string;
    channel: ContactChannel;
    result: ManagementResult;
    notes: string;
    promiseAmount?: number;
    promiseDate?: string;
    settlementOffer?: number;
  }) => void;
  createSettlement: (debtorId: string, offeredAmount: number) => void;
  updateDebtorStatus: (id: string, status: Debtor["status"]) => void;
  markAsRecovered: (id: string, amount: number) => void;
  getDebtor: (id: string) => Debtor | undefined;
  getManagementsForDebtor: (id: string) => Management[];
  getPrioritizedQueue: () => Debtor[];
  getStats: () => {
    totalAccounts: number;
    totalBalance: number;
    recoveredToday: number;
    recoveredWeek: number;
    promisesActive: number;
    avgScore: number;
  };
  clearAll: () => void;
}

const sampleDebtors: Debtor[] = [
  {
    id: "d1",
    name: "María González Pérez",
    document: "12345678",
    phone: "+52 55 1234 5678",
    email: "maria.g@email.com",
    originalAmount: 18500,
    currentBalance: 18500,
    writeOffDate: "2025-11-15",
    daysSinceWriteOff: 0,
    product: "Crédito personal",
    recoveryScore: 0,
    status: "pendiente",
  },
  {
    id: "d2",
    name: "Carlos Ramírez López",
    document: "87654321",
    phone: "+52 33 9876 5432",
    originalAmount: 4200,
    currentBalance: 4200,
    writeOffDate: "2025-08-20",
    daysSinceWriteOff: 0,
    product: "Tarjeta de crédito",
    recoveryScore: 0,
    status: "pendiente",
  },
  {
    id: "d3",
    name: "Ana Martínez Soto",
    document: "11223344",
    phone: "+52 81 5555 1212",
    originalAmount: 9800,
    currentBalance: 9800,
    writeOffDate: "2024-12-01",
    daysSinceWriteOff: 0,
    product: "Crédito auto",
    recoveryScore: 0,
    status: "en_gestion",
  },
  {
    id: "d4",
    name: "Jorge Fernández Díaz",
    document: "55667788",
    phone: "+52 55 4444 3333",
    originalAmount: 1250,
    currentBalance: 1250,
    writeOffDate: "2026-01-10",
    daysSinceWriteOff: 0,
    product: "Crédito consumo",
    recoveryScore: 0,
    status: "pendiente",
  },
  {
    id: "d5",
    name: "Lucía Hernández Ruiz",
    document: "99887766",
    phone: "+52 22 1111 2222",
    originalAmount: 27500,
    currentBalance: 27500,
    writeOffDate: "2025-03-15",
    daysSinceWriteOff: 0,
    product: "Crédito hipotecario residual",
    recoveryScore: 0,
    status: "pendiente",
  },
].map((d) => {
  const days = daysBetween(d.writeOffDate);
  const score = calculateRecoveryScore({ ...d, daysSinceWriteOff: days });
  return { ...d, daysSinceWriteOff: days, recoveryScore: score };
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      debtors: sampleDebtors,
      managements: [],
      settlements: [],
      agentName: "Cobrador Demo",

      setAgentName: (name) => set({ agentName: name }),

      importDebtors: (rows) => {
        const newDebtors: Debtor[] = rows.map((r) => {
          const writeOff = r.writeOffDate || new Date().toISOString().slice(0, 10);
          const days = daysBetween(writeOff);
          const base: Debtor = {
            id: uuidv4(),
            name: r.name || "Sin nombre",
            document: r.document || "",
            phone: r.phone || "",
            email: r.email,
            address: r.address,
            originalAmount: Number(r.originalAmount) || 0,
            currentBalance: Number(r.currentBalance) || Number(r.originalAmount) || 0,
            writeOffDate: writeOff,
            daysSinceWriteOff: days,
            product: r.product,
            notes: r.notes,
            recoveryScore: 0,
            status: "pendiente",
          };
          base.recoveryScore = calculateRecoveryScore(base);
          return base;
        });
        set((state) => ({ debtors: [...state.debtors, ...newDebtors] }));
      },

      addManagement: (data) => {
        const mgmt: Management = {
          id: uuidv4(),
          debtorId: data.debtorId,
          date: new Date().toISOString(),
          channel: data.channel,
          result: data.result,
          notes: data.notes,
          promiseAmount: data.promiseAmount,
          promiseDate: data.promiseDate,
          settlementOffer: data.settlementOffer,
          createdBy: get().agentName,
        };

        set((state) => {
          const debtors = state.debtors.map((d) => {
            if (d.id !== data.debtorId) return d;
            let status = d.status;
            if (data.result === "promesa_pago") status = "promesa";
            else if (data.result === "pago_total" || data.result === "acuerdo_quita")
              status = "recuperado";
            else if (data.result === "contactado" || data.result === "pago_parcial")
              status = "en_gestion";
            return {
              ...d,
              status,
              lastContactAt: mgmt.date,
            };
          });
          return {
            managements: [mgmt, ...state.managements],
            debtors,
          };
        });
      },

      createSettlement: (debtorId, offeredAmount) => {
        const debtor = get().debtors.find((d) => d.id === debtorId);
        if (!debtor) return;
        const offer: SettlementOffer = {
          id: uuidv4(),
          debtorId,
          originalBalance: debtor.currentBalance,
          offeredAmount,
          discountPercent: Math.round(
            ((debtor.currentBalance - offeredAmount) / debtor.currentBalance) * 100
          ),
          status: "proposed",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ settlements: [offer, ...state.settlements] }));
      },

      updateDebtorStatus: (id, status) =>
        set((state) => ({
          debtors: state.debtors.map((d) => (d.id === id ? { ...d, status } : d)),
        })),

      markAsRecovered: (id, amount) =>
        set((state) => ({
          debtors: state.debtors.map((d) =>
            d.id === id
              ? { ...d, status: "recuperado", currentBalance: Math.max(0, d.currentBalance - amount) }
              : d
          ),
        })),

      getDebtor: (id) => get().debtors.find((d) => d.id === id),

      getManagementsForDebtor: (id) =>
        get().managements.filter((m) => m.debtorId === id),

      getPrioritizedQueue: () => {
        return [...get().debtors]
          .filter((d) => d.status !== "recuperado" && d.status !== "incobrable")
          .sort((a, b) => b.recoveryScore - a.recoveryScore);
      },

      getStats: () => {
        const debtors = get().debtors;
        const managements = get().managements;
        const today = new Date().toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const recoveredToday = managements
          .filter(
            (m) =>
              m.date.startsWith(today) &&
              (m.result === "pago_total" || m.result === "acuerdo_quita" || m.result === "pago_parcial")
          )
          .reduce((sum, m) => sum + (m.promiseAmount || m.settlementOffer || 0), 0);

        const recoveredWeek = managements
          .filter(
            (m) =>
              m.date >= weekAgo &&
              (m.result === "pago_total" || m.result === "acuerdo_quita" || m.result === "pago_parcial")
          )
          .reduce((sum, m) => sum + (m.promiseAmount || m.settlementOffer || 0), 0);

        const promisesActive = debtors.filter((d) => d.status === "promesa").length;
        const totalBalance = debtors
          .filter((d) => d.status !== "recuperado")
          .reduce((s, d) => s + d.currentBalance, 0);

        const avgScore =
          debtors.length > 0
            ? Math.round(debtors.reduce((s, d) => s + d.recoveryScore, 0) / debtors.length)
            : 0;

        return {
          totalAccounts: debtors.length,
          totalBalance,
          recoveredToday,
          recoveredWeek,
          promisesActive,
          avgScore,
        };
      },

      clearAll: () => set({ debtors: [], managements: [], settlements: [] }),
    }),
    {
      name: "castigopro-storage",
    }
  )
);
