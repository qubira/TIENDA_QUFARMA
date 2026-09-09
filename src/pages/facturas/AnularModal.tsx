import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/Modal";

export default function AnularModal({
  onClose,
  onConfirm,
  loading,
  error,
}: {
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [motivo, setMotivo] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!motivo.trim()) return;
    onConfirm(motivo.trim());
  }

  return (
    <Modal title="Anular comprobante" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm text-slate-500">
          Esta acción anulará el comprobante y repondrá el stock vendido. Indica el motivo.
        </p>
        <div>
          <label className="label">
            Motivo <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            autoFocus
            className="input min-h-[80px] resize-none"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. error en el registro, solicitud del cliente…"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={loading || !motivo.trim()} className="btn-danger flex-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Anular comprobante
          </button>
        </div>
      </form>
    </Modal>
  );
}
