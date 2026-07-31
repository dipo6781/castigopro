"use client";

import { Header } from "@/components/Header";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default function ImportarPage() {
  const importDebtors = useAppStore((s) => s.importDebtors);
  const [preview, setPreview] = useState<any[]>([]);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState("");

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("El archivo necesita encabezados y al menos una fila");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });

    return rows.map((r) => ({
      name: r.nombre || r.name || r.cliente || "",
      document: r.documento || r.document || r.cedula || r.rut || r.dni || "",
      phone: r.telefono || r.phone || r.celular || r.movil || "",
      email: r.email || r.correo || "",
      originalAmount: Number(r.monto_original || r.originalamount || r.saldo || r.monto || 0),
      currentBalance: Number(r.saldo_actual || r.currentbalance || r.saldo || r.monto || 0),
      writeOffDate: r.fecha_castigo || r.writeoffdate || r.fecha || new Date().toISOString().slice(0, 10),
      product: r.producto || r.product || r.tipo || "",
      notes: r.notas || r.notes || "",
    }));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setImported(false);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      setPreview(rows.slice(0, 5));
      (window as any).__castigoImport = rows;
    } catch (err: any) {
      setError(err.message || "Error al leer el archivo");
    }
  };

  const confirmImport = () => {
    const rows = (window as any).__castigoImport;
    if (!rows?.length) return;
    importDebtors(rows);
    setImported(true);
    setPreview([]);
    (window as any).__castigoImport = null;
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Importar cartera</h1>
          <p className="text-sm text-slate-500">
            Carga un CSV con tus cuentas castigadas. Formato flexible.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Arrastra o selecciona un archivo CSV
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Columnas recomendadas: nombre, documento, telefono, saldo, fecha_castigo, producto
          </p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Upload className="h-4 w-4" />
            Seleccionar archivo
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        )}

        {preview.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Vista previa ({(window as any).__castigoImport?.length || 0} filas)
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2 pr-3">Nombre</th>
                    <th className="py-2 pr-3">Documento</th>
                    <th className="py-2 pr-3">Teléfono</th>
                    <th className="py-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 pr-3 font-medium">{r.name}</td>
                      <td className="py-2 pr-3">{r.document}</td>
                      <td className="py-2 pr-3">{r.phone}</td>
                      <td className="py-2">{r.currentBalance || r.originalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={confirmImport}
              className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white"
            >
              Confirmar e importar
            </button>
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">
              ¡Cartera importada correctamente! Ve a “Mi Cola” para empezar a gestionar.
            </span>
          </div>
        )}

        <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600">
          <p className="font-semibold">Ejemplo de encabezados CSV:</p>
          <code className="mt-1 block overflow-x-auto">
            nombre,documento,telefono,saldo,fecha_castigo,producto
          </code>
        </div>
      </main>
    </div>
  );
}
