"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/useAppStore";
import { prioritizeDebtors, getActivePromises } from "@/lib/utils";
import type { Debtor, Management } from "@/types";

/** Stable slice: debtors array reference only changes when data changes */
export function useDebtors() {
  return useAppStore((s) => s.debtors);
}

export function useManagements() {
  return useAppStore((s) => s.managements);
}

export function useAgentName() {
  return useAppStore((s) => s.agentName);
}

/** Derived prioritized queue — memoized, no infinite loop */
export function usePrioritizedQueue() {
  const debtors = useDebtors();
  return useMemo(() => prioritizeDebtors(debtors), [debtors]);
}

export function useDebtor(id: string): Debtor | undefined {
  const debtors = useDebtors();
  return useMemo(() => debtors.find((d) => d.id === id), [debtors, id]);
}

export function useDebtorManagements(id: string): Management[] {
  const managements = useManagements();
  return useMemo(
    () => managements.filter((m) => m.debtorId === id),
    [managements, id]
  );
}

/** Portfolio stats — single memo, stable selectors */
export function usePortfolioStats() {
  const debtors = useDebtors();
  const managements = useManagements();

  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const isRecovery = (r: string) =>
      r === "pago_total" || r === "acuerdo_quita" || r === "pago_parcial";

    const recoveredToday = managements
      .filter((m) => m.date.startsWith(today) && isRecovery(m.result))
      .reduce((sum, m) => sum + (m.promiseAmount || m.settlementOffer || 0), 0);

    const recoveredWeek = managements
      .filter((m) => m.date >= weekAgo && isRecovery(m.result))
      .reduce((sum, m) => sum + (m.promiseAmount || m.settlementOffer || 0), 0);

    const promisesActive = debtors.filter((d) => d.status === "promesa").length;
    const totalBalance = debtors
      .filter((d) => d.status !== "recuperado")
      .reduce((s, d) => s + d.currentBalance, 0);

    const avgScore =
      debtors.length > 0
        ? Math.round(
            debtors.reduce((s, d) => s + d.recoveryScore, 0) / debtors.length
          )
        : 0;

    return {
      totalAccounts: debtors.length,
      totalBalance,
      recoveredToday,
      recoveredWeek,
      promisesActive,
      avgScore,
    };
  }, [debtors, managements]);
}

/** Actions are stable references from Zustand create() */
export function useDebtorActions() {
  return useAppStore(
    useShallow((s) => ({
      addManagement: s.addManagement,
      createSettlement: s.createSettlement,
      markAsRecovered: s.markAsRecovered,
      updateDebtorStatus: s.updateDebtorStatus,
    }))
  );
}

export function useImportAction() {
  return useAppStore((s) => s.importDebtors);
}

export function useConfigActions() {
  return useAppStore(
    useShallow((s) => ({
      agentName: s.agentName,
      setAgentName: s.setAgentName,
      clearAll: s.clearAll,
    }))
  );
}

export function useActivePromises() {
  const debtors = useDebtors();
  const managements = useManagements();
  return useMemo(
    () => getActivePromises(debtors, managements),
    [debtors, managements]
  );
}

export function useNextDebtorId(currentId?: string) {
  const queue = usePrioritizedQueue();
  return useMemo(() => {
    if (!queue.length) return null;
    if (!currentId) return queue[0]?.id ?? null;
    const idx = queue.findIndex((d) => d.id === currentId);
    if (idx < 0) return queue[0]?.id ?? null;
    return queue[idx + 1]?.id ?? null;
  }, [queue, currentId]);
}
