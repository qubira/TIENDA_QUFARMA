import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import type { Producto } from "../../lib/types";

export default function MovimientoModal({
  producto,
  onClose,
  onSaved,
}: {
  producto: Producto;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState<"AJUSTE" | "MERMA">("MERMA");
  const [loteId, setLoteId] = useState(producto.lotes?.[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/almacen/movimientos", {
        productoId: producto.id,
        loteId: loteId || undefined,
        tipo,
        cantidad: Number(cantidad),
        motivo,
      });
      toast.success("Movimiento registrado");
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo registrar el movimiento."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Movimiento — ${producto.nombreComercial}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="label">Tipo</p>
          <div className="grid grid-cols-2 gap-2">
            {(["MERMA", "AJUSTE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  tipo === t
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {t === "MERMA" ? "Merma" : "Ajuste"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Lote afectado</label>
          <select className="input" value={loteId} onChange={(e) => setLoteId(e.target.value)}>
            <option value="">Sin especificar</option>
            {(producto.lotes ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.numeroLote} — disp. {l.cantidad}
              </option>
            ))}
          </select>
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
          <label className="label">Motivo</label>
          <textarea
            required
            className="input min-h-[70px] resize-none"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describe el motivo del movimiento…"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
}
