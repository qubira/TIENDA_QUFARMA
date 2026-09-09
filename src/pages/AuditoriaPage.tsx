import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, ScrollText } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { AuditLog } from "../lib/types";

const PAGE_SIZE = 50;

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [accion, setAccion] = useState("");
  const [modulo, setModulo] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<{
        logs: AuditLog[];
        total: number;
        page: number;
        pageSize: number;
      }>("/auditoria", {
        params: {
          desde: desde || undefined,
          hasta: hasta || undefined,
          accion: accion || undefined,
          modulo: modulo || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error("No se pudieron cargar los registros de auditoría.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleFilter() {
    setPage(1);
    load();
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await api.get("/auditoria/export", {
        params: {
          desde: desde || undefined,
          hasta: hasta || undefined,
          accion: accion || undefined,
          modulo: modulo || undefined,
        },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo exportar el CSV.");
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Auditoría"
        subtitle="Registro de solo lectura de todas las acciones del sistema"
        actions={
          <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
            Exportar CSV
          </button>
        }
      />

      <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-40" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-40" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div>
          <label className="label">Acción</label>
          <input
            className="input w-44"
            placeholder="VENTA_CONFIRMADA…"
            value={accion}
            onChange={(e) => setAccion(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Módulo</label>
          <input
            className="input w-40"
            placeholder="VENTA, ALMACEN…"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
          />
        </div>
        <button onClick={handleFilter} className="btn-primary">
          Filtrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-300 dark:text-slate-700">
            <ScrollText size={40} />
            <p className="text-sm text-slate-400 dark:text-slate-500">Sin registros para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                  <th className="px-4 py-3 text-left">Módulo</th>
                  <th className="px-4 py-3 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {log.trabajador ? `${log.trabajador.nombres} ${log.trabajador.apellidos}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-ocean-50 text-ocean-700 dark:bg-ocean-900 dark:text-ocean-300">{log.accion}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.modulo}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
                      {log.detalle ? JSON.stringify(log.detalle) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {total} registro{total !== 1 ? "s" : ""} — página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="btn-secondary !px-2 !py-1.5"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="btn-secondary !px-2 !py-1.5"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
