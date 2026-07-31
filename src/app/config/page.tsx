"use client";

import { Header } from "@/components/Header";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { User, Trash2, Shield } from "lucide-react";

export default function ConfigPage() {
  const agentName = useAppStore((s) => s.agentName);
  const setAgentName = useAppStore((s) => s.setAgentName);
  const clearAll = useAppStore((s) => s.clearAll);
  const [name, setName] = useState(agentName);
  const [cleared, setCleared] = useState(false);

  const save = () => {
    setAgentName(name.trim() || "Cobrador");
  };

  const handleClear = () => {
    if (confirm("¿Seguro que quieres borrar toda la cartera y gestiones locales?")) {
      clearAll();
      setCleared(true);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-sm text-slate-500">Ajustes locales de la mini-app</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <User className="h-4 w-4" /> Nombre del agente
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Tu nombre"
          />
          <button
            onClick={save}
            className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
          >
            Guardar
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Shield className="h-4 w-4" /> Cumplimiento y buenas prácticas
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Respeta horarios de contacto de tu país (ej. 8:00–20:00)</li>
            <li>• Máximo 2–3 intentos de contacto por día por deudor</li>
            <li>• Identifica siempre a la institución o agencia</li>
            <li>• No uses amenazas, lenguaje intimidatorio ni contactes a terceros indebidamente</li>
            <li>• Todas las gestiones quedan registradas para auditoría</li>
            <li>• En cartera castigada prioriza ofertas de quita realistas</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-800">
            <Trash2 className="h-4 w-4" /> Zona de peligro
          </div>
          <p className="mt-2 text-sm text-rose-700">
            Borra todos los datos locales (cartera + gestiones). Esta acción no se puede deshacer.
          </p>
          <button
            onClick={handleClear}
            className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Borrar todos los datos
          </button>
          {cleared && (
            <p className="mt-2 text-xs text-rose-600">Datos eliminados.</p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          CastigoPro v1.0 · Datos almacenados solo en este dispositivo (local-first)
        </p>
      </main>
    </div>
  );
}
