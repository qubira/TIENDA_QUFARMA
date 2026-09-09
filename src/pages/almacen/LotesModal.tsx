import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatDate, daysUntil } from "../../lib/format";
import type { Lote, Producto } from "../../lib/types";

export default function LotesModal({
  producto,
  onClose,
  onChanged,
}: {
  producto: Producto;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [lotes, setLotes] = useState<Lote[]>(producto.lotes ?? []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [numeroLote, setNumeroLote] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState(String(producto.precioCompra ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLotes() {
    setLoading(true);
    try {
      const { data } = await api.get<{ lotes: Lote[] }>(`/almacen/productos/${producto.id}/lotes`);
      setLotes(data.lotes);
    } catch {
      toast.error("No se pudieron cargar los lotes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddLote(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post(`/almacen/productos/${producto.id}/lotes`, {
        numeroLote,
        fechaVencimiento,
        cantidad: Number(cantidad),
        precioCompra: Number(precioCompra),
      });
      toast.success("Lote agregado");
      setShowForm(false);
      setNumeroLote("");
      setFechaVencimiento("");
      setCantidad("");
      await loadLotes();
      onChanged();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo agregar el lote."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Lotes — ${producto.nombreComercial}`} onClose={onClose} widthClass="max-w-xl">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Lote</th>
                  <th className="px-3 py-2 text-left">Vence</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lotes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                      Sin lotes registrados
                    </td>
                  </tr>
                ) : (
                  lotes.map((l) => {
                    const days = daysUntil(l.fechaVencimiento);
                    const vencido = days < 0;
                    return (
                      <tr key={l.id}>
                        <td className="px-3 py-2 font-medium text-slate-700">{l.numeroLote}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              vencido
                                ? "font-medium text-rose-600"
                                : days <= 30
                                ? "font-medium text-orange-600"
                                : "text-slate-600"
                            }
                          >
                            {formatDate(l.fechaVencimiento)}
                          </span>
                          {vencido && (
                            <span className="ml-2 badge bg-slate-200 text-slate-600">Vencido</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">{l.cantidad}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-secondary w-full"
          >
            <Plus size={16} /> Agregar lote
          </button>
        ) : (
          <form onSubmit={handleAddLote} className="animate-fade-in space-y-3 rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">N.º de lote</label>
                <input
                  required
                  className="input"
                  value={numeroLote}
                  onChange={(e) => setNumeroLote(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Fecha de vencimiento</label>
                <input
                  required
                  type="date"
                  className="input"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Cantidad</label>
                <input
                  required
                  type="number"
                  min={1}
                  className="input"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Precio compra (S/)</label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  className="input"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar lote
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
