import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Cross, Loader2, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { PageModule, Trabajador } from "../lib/types";
import ThemeToggle from "../components/ThemeToggle";

const HOME_BY_PRIORITY: PageModule[] = [
  "VENTA",
  "ALMACEN",
  "CAJA",
  "FACTURAS",
  "AUDITORIA",
  "TRABAJADORES",
];

const HOME_PATH: Record<PageModule, string> = {
  VENTA: "/venta",
  ALMACEN: "/almacen",
  AUDITORIA: "/auditoria",
  FACTURAS: "/facturas",
  CAJA: "/caja",
  TRABAJADORES: "/trabajadores",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; trabajador: Trabajador }>(
        "/auth/login",
        { username, password }
      );
      login(data.token, data.trabajador);

      const firstAllowed = HOME_BY_PRIORITY.find((page) =>
        data.trabajador.role.permissions.includes(page)
      );
      navigate(firstAllowed ? HOME_PATH[firstAllowed] : "/sin-permiso", { replace: true });
    } catch {
      // Mensaje genérico: nunca revelar si el usuario existe o no.
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-ocean-900 p-4">
      <ThemeToggle className="absolute right-4 top-4 text-white/70 hover:bg-white/10 hover:text-white dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white" />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-6 flex flex-col items-center gap-3 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Cross className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">QUFARMA</h1>
            <p className="text-sm text-white/60">Panel interno de gestión</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="card space-y-4 p-6"
        >
          <div>
            <label htmlFor="username" className="label">
              Usuario
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                name="qf-username"
                type="text"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input pl-9"
                placeholder="jperez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="qf-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9 pr-9"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="animate-fade-in rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          Acceso exclusivo para personal autorizado de QUFARMA.
        </p>
      </div>
    </div>
  );
}
