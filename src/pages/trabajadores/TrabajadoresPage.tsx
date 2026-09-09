import { useEffect, useState } from "react";
import { KeyRound, Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { PageModule, Role, Trabajador } from "../../lib/types";
import TrabajadorFormModal from "./TrabajadorFormModal";
import ResetPasswordModal from "./ResetPasswordModal";
import RolesManager from "./RolesManager";

interface RawRole {
  id: string;
  nombre: string;
  permissions: (PageModule | { page: PageModule })[];
}

export default function TrabajadoresPage() {
  const { trabajador: currentUser } = useAuth();
  const isAdmin = currentUser?.role.nombre === "Admin";

  const [tab, setTab] = useState<"lista" | "roles">("lista");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Trabajador | null>(null);
  const [resetting, setResetting] = useState<Trabajador | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        api.get<{ trabajadores: Trabajador[] }>("/trabajadores"),
        api.get<{ roles: RawRole[] }>("/trabajadores/roles"),
      ]);
      setTrabajadores(tRes.data.trabajadores);
      setRoles(
        rRes.data.roles.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          permissions: r.permissions.map((p) => (typeof p === "string" ? p : p.page)),
        }))
      );
    } catch {
      toast.error("No se pudieron cargar los trabajadores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActivo(t: Trabajador) {
    try {
      await api.patch(`/trabajadores/${t.id}/activo`, { activo: !t.activo });
      toast.success(t.activo ? "Trabajador desactivado" : "Trabajador activado");
      load();
    } catch {
      toast.error("No se pudo actualizar el estado.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Trabajadores"
        subtitle="Personal, roles y permisos del sistema"
        actions={
          tab === "lista" ? (
            <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus size={16} /> Nuevo trabajador
            </button>
          ) : undefined
        }
      />

      <div className="border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("lista")}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium ${
              tab === "lista"
                ? "border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400"
                : "border-transparent text-slate-400 dark:text-slate-500"
            }`}
          >
            <Users size={14} className="mr-1 inline" /> Personal
          </button>
          <button
            onClick={() => setTab("roles")}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium ${
              tab === "roles"
                ? "border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400"
                : "border-transparent text-slate-400 dark:text-slate-500"
            }`}
          >
            Roles y permisos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          </div>
        ) : tab === "lista" ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Cargo</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trabajadores.map((t) => (
                  <tr key={t.id} className={t.activo === false ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ocean-100 text-xs font-semibold text-ocean-700 dark:bg-ocean-900 dark:text-ocean-300">
                          {t.fotoUrl ? (
                            <img src={t.fotoUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span>
                              {t.nombres[0]}
                              {t.apellidos[0]}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {t.nombres} {t.apellidos}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.username}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.cargo}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-ocean-50 text-ocean-700 dark:bg-ocean-900 dark:text-ocean-300">{t.role.nombre}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          t.activo === false
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                        }`}
                      >
                        {t.activo === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          title="Restablecer contraseña"
                          onClick={() => setResetting(t)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => { setEditing(t); setShowForm(true); }}
                          className="btn-ghost !px-2 !py-1 text-xs"
                        >
                          Editar
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => toggleActivo(t)}
                            className={`!px-2 !py-1 text-xs ${t.activo === false ? "btn-secondary" : "btn-ghost"}`}
                          >
                            {t.activo === false ? "Activar" : "Desactivar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <RolesManager />
        )}
      </div>

      {showForm && (
        <TrabajadorFormModal
          trabajador={editing}
          roles={roles}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {resetting && (
        <ResetPasswordModal trabajador={resetting} onClose={() => setResetting(null)} />
      )}
    </div>
  );
}
