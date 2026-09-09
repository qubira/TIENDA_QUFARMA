import { useEffect, useState } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { api } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/format";
import type { Comprobante } from "../../lib/types";
import FacturaDetalleModal from "./FacturaDetalleModal";

export default function FacturasPage() {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<{ comprobantes: Comprobante[] }>("/facturas", {
        params: {
          q: q || undefined,
          estado: estado || undefined,
          tipo: tipo || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
        },
      });
      setComprobantes(data.comprobantes);
    } catch {
      toast.error("No se pudieron cargar las facturas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Facturas" subtitle="Comprobantes emitidos: boletas y facturas" />

      <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 bg-white px-6 py-3">
        <div>
          <label className="label">Buscar</label>
          <div className="relative w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="N.º o cliente…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input w-36" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="EMITIDA">Emitida</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input w-36" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="BOLETA">Boleta</option>
            <option value="FACTURA">Factura</option>
          </select>
        </div>
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-40" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-40" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={load}>
          Filtrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          </div>
        ) : comprobantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-300">
            <FileText size={40} />
            <p className="text-sm text-slate-400">No hay comprobantes para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">N.º</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comprobantes.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-slate-700">
                      {c.serie}-{String(c.numero).padStart(6, "0")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.tipo}</td>
                    <td className="px-4 py-3 text-slate-600">{c.venta?.cliente?.nombre ?? "Varios"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {formatCurrency(c.venta?.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          c.estado === "ANULADA"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <FacturaDetalleModal
          comprobanteId={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
