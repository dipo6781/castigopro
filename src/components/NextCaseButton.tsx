"use client";

import { useRouter } from "next/navigation";
import { useNextDebtorId } from "@/hooks/useCastigoStore";
import { ChevronRight, SkipForward } from "lucide-react";

export function NextCaseButton({
  currentId,
  variant = "primary",
}: {
  currentId?: string;
  variant?: "primary" | "ghost";
}) {
  const router = useRouter();
  const nextId = useNextDebtorId(currentId);

  if (!nextId) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-400"
      >
        Fin de la cola
      </button>
    );
  }

  const go = () => router.push(`/caso/${nextId}`);

  if (variant === "ghost") {
    return (
      <button
        onClick={go}
        className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
      >
        Siguiente caso <ChevronRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={go}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
    >
      <SkipForward className="h-4 w-4" /> Siguiente caso prioritario
    </button>
  );
}
