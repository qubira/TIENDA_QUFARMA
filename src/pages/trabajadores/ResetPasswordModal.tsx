import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import { toast } from "sonner";
import type { Trabajador } from "../../lib/types";

export default function ResetPasswordModal({
  trabajador,
  onClose,
}: {
  trabajador: Trabajador;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post(`/trabajadores/${trabajador.id}/reset-password`, { newPassword });
      toast.success("Contraseña restablecida");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo restablecer la contraseña."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Restablecer contraseña — ${trabajador.nombres}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">Nueva contraseña</label>
          <input
            required
            autoFocus
            type="password"
            minLength={6}
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Restablecer
          </button>
        </div>
      </form>
    </Modal>
  );
}
