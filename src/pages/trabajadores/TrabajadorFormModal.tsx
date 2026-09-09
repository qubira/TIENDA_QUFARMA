import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import type { Role, Trabajador } from "../../lib/types";

export default function TrabajadorFormModal({
  trabajador,
  roles,
  onClose,
  onSaved,
}: {
  trabajador: Trabajador | null;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(trabajador);
  const [nombres, setNombres] = useState(trabajador?.nombres ?? "");
  const [apellidos, setApellidos] = useState(trabajador?.apellidos ?? "");
  const [dni, setDni] = useState("");
  const [cargo, setCargo] = useState(trabajador?.cargo ?? "");
  const [username, setUsername] = useState(trabajador?.username ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(trabajador?.role.id ?? roles[0]?.id ?? "");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(trabajador?.fotoUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFoto(file: File | null) {
    setFoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("nombres", nombres);
      form.append("apellidos", apellidos);
      form.append("cargo", cargo);
      form.append("username", username);
      form.append("roleId", roleId);
      if (dni) form.append("dni", dni);
      if (!isEdit) form.append("password", password);
      if (foto) form.append("foto", foto);

      if (isEdit && trabajador) {
        await api.patch(`/trabajadores/${trabajador.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Trabajador actualizado");
      } else {
        await api.post("/trabajadores", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Trabajador creado");
      }
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo guardar el trabajador."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Editar trabajador" : "Nuevo trabajador"} onClose={onClose} widthClass="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-brand-300 hover:text-brand-500">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <>
                <Upload size={18} />
                <span className="text-[9px]">Foto</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFoto(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div>
              <label className="label">Nombres</label>
              <input required className="input" value={nombres} onChange={(e) => setNombres(e.target.value)} />
            </div>
            <div>
              <label className="label">Apellidos</label>
              <input required className="input" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">DNI</label>
            <input className="input" value={dni} onChange={(e) => setDni(e.target.value)} />
          </div>
          <div>
            <label className="label">Cargo</label>
            <input required className="input" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>
          <div>
            <label className="label">Usuario</label>
            <input required className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Rol</label>
            <select required className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div className="col-span-2">
              <label className="label">Contraseña inicial</label>
              <input
                required
                type="password"
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
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
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
