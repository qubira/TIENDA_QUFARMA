import { useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "../../lib/api";
import type { PageModule } from "../../lib/types";

const ALL_PAGES: { page: PageModule; label: string }[] = [
  { page: "VENTA", label: "Venta" },
  { page: "ALMACEN", label: "Almacén" },
  { page: "AUDITORIA", label: "Auditoría" },
  { page: "FACTURAS", label: "Facturas" },
  { page: "CAJA", label: "Caja" },
  { page: "TRABAJADORES", label: "Trabajadores" },
];

interface RawRole {
  id: string;
  nombre: string;
  // El backend puede devolver los permisos como string[] (PageModule[])
  // o como [{ page: PageModule }], según el endpoint. Normalizamos ambos.
  permissions: (PageModule | { page: PageModule })[];
}

interface NormalizedRole {
  id: string;
  nombre: string;
  permissions: PageModule[];
}

function normalize(role: RawRole): NormalizedRole {
  return {
    id: role.id,
    nombre: role.nombre,
    permissions: role.permissions.map((p) => (typeof p === "string" ? p : p.page)),
  };
}

export default function RolesManager() {
  const [roles, setRoles] = useState<NormalizedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<PageModule[]>([]);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<{ roles: RawRole[] }>("/trabajadores/roles");
      setRoles(data.roles.map(normalize));
    } catch {
      toast.error("No se pudieron cargar los roles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function togglePerm(roleId: string, page: PageModule) {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: r.permissions.includes(page)
                ? r.permissions.filter((p) => p !== page)
                : [...r.permissions, page],
            }
          : r
      )
    );
  }

  async function saveRole(role: NormalizedRole) {
    setSavingId(role.id);
    try {
      await api.patch(`/trabajadores/roles/${role.id}`, {
        nombre: role.nombre,
        permissions: role.permissions,
      });
      toast.success(`Permisos de "${role.nombre}" actualizados`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo guardar el rol."));
      load();
    } finally {
      setSavingId(null);
    }
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await api.post("/trabajadores/roles", {
        nombre: newRoleName.trim(),
        permissions: newRolePerms,
      });
      toast.success("Rol creado");
      setShowNewRole(false);
      setNewRoleName("");
      setNewRolePerms([]);
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No se pudo crear el rol."));
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.id} className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600" />
              <h3 className="text-sm font-bold text-slate-800">{role.nombre}</h3>
            </div>
            <button
              onClick={() => saveRole(role)}
              disabled={savingId === role.id}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              {savingId === role.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Guardar cambios
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ALL_PAGES.map(({ page, label }) => (
              <label
                key={page}
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={role.permissions.includes(page)}
                  onChange={() => togglePerm(role.id, page)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}

      {showNewRole ? (
        <div className="card animate-fade-in p-4">
          <div className="mb-3">
            <label className="label">Nombre del rol</label>
            <input
              className="input"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Ej. Supervisor"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ALL_PAGES.map(({ page, label }) => (
              <label
                key={page}
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={newRolePerms.includes(page)}
                  onChange={() =>
                    setNewRolePerms((prev) =>
                      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
                    )
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setShowNewRole(false)}>
              Cancelar
            </button>
            <button
              className="btn-primary flex-1"
              disabled={creating || !newRoleName.trim()}
              onClick={handleCreateRole}
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear rol
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-secondary w-full" onClick={() => setShowNewRole(true)}>
          <Plus size={16} /> Nuevo rol
        </button>
      )}
    </div>
  );
}
