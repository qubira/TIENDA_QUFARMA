import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Warehouse,
  ClipboardList,
  FileText,
  Wallet,
  Users,
  LogOut,
  Cross,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { PageModule } from "../lib/types";
import { api } from "../lib/api";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS: { page: PageModule; to: string; label: string; icon: typeof ShoppingCart }[] = [
  { page: "VENTA", to: "/venta", label: "Venta", icon: ShoppingCart },
  { page: "ALMACEN", to: "/almacen", label: "Almacén", icon: Warehouse },
  { page: "CAJA", to: "/caja", label: "Caja", icon: Wallet },
  { page: "FACTURAS", to: "/facturas", label: "Facturas", icon: FileText },
  { page: "AUDITORIA", to: "/auditoria", label: "Auditoría", icon: ClipboardList },
  { page: "TRABAJADORES", to: "/trabajadores", label: "Trabajadores", icon: Users },
];

export default function Layout() {
  const { trabajador, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(item.page));

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Aun si falla la llamada de auditoría, cerramos sesión localmente.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Cross className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-slate-800 dark:text-slate-100">QUFARMA</p>
              <p className="text-[11px] leading-none text-slate-400 mt-1 dark:text-slate-500">Panel interno</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {visibleItems.map(({ page, to, label, icon: Icon }) => (
            <NavLink
              key={page}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ocean-100 text-sm font-semibold text-ocean-700 dark:bg-ocean-900 dark:text-ocean-300">
              {trabajador?.fotoUrl ? (
                <img
                  src={trabajador.fotoUrl}
                  alt={trabajador.nombres}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>
                  {trabajador?.nombres?.[0]}
                  {trabajador?.apellidos?.[0]}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {trabajador?.nombres} {trabajador?.apellidos}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{trabajador?.role.nombre}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
