import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/Modal";

export default function AbrirCajaModal({
  onClose,
  onConfirm,
  loading,
  error,
}: {
  onClose: () => void;
  onConfirm: (montoApertura: number) => void;
  loading: boolean;
  error: string | null;
}) {
  const [monto, setMonto] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = Number(monto);
    if (!Number.isFinite(v) || v < 0) return;
    onConfirm(v);
  }

  return (
    <Modal title="Abrir caja" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">Monto de apertura (S/)</label>
          <input
            required
            autoFocus
            type="number"
            min={0}
            step="0.10"
            className="input"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
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
            Abrir caja
          </button>
        </div>
      </form>
    </Modal>
  );
}
