import { useMemo, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/Modal";
import { formatCurrency } from "../../lib/format";
import type { Caja } from "../../lib/types";

export default function CerrarCajaModal({
  caja,
  onClose,
  onConfirm,
  loading,
  error,
}: {
  caja: Caja;
  onClose: () => void;
  onConfirm: (efectivoContado: number, observaciones: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [efectivoContado, setEfectivoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const diferenciaPreview = useMemo(() => {
    if (efectivoContado === "" || caja.efectivoEsperado == null) return null;
    return Number(efectivoContado) - caja.efectivoEsperado;
  }, [efectivoContado, caja.efectivoEsperado]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = Number(efectivoContado);
    if (!Number.isFinite(v) || v < 0) return;
    onConfirm(v, observaciones.trim());
  }

  return (
    <Modal title="Cerrar caja" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p>Monto de apertura: <span className="font-medium">{formatCurrency(caja.montoApertura)}</span></p>
        </div>

        <div>
          <label className="label">Efectivo contado (S/)</label>
          <input
            required
            autoFocus
            type="number"
            min={0}
            step="0.10"
            className="input"
            value={efectivoContado}
            onChange={(e) => setEfectivoContado(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {diferenciaPreview !== null && (
          <div
            className={`animate-fade-in rounded-lg px-3 py-2 text-sm font-medium ${
              diferenciaPreview === 0
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                : diferenciaPreview > 0
                ? "bg-ocean-50 text-ocean-700 dark:bg-ocean-500/10 dark:text-ocean-400"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            {diferenciaPreview === 0
              ? "Cuadre exacto"
              : diferenciaPreview > 0
              ? `Sobrante: ${formatCurrency(diferenciaPreview)}`
              : `Faltante: ${formatCurrency(Math.abs(diferenciaPreview))}`}
          </div>
        )}

        <div>
          <label className="label">Observaciones (opcional)</label>
          <textarea
            className="input min-h-[70px] resize-none"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Cerrar caja
          </button>
        </div>
      </form>
    </Modal>
  );
}
