import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken, setUnauthorizedHandler } from "../lib/api";
import type { PageModule, Trabajador } from "../lib/types";

interface AuthContextValue {
  token: string | null;
  trabajador: Trabajador | null;
  /** true mientras se valida la sesión inicial contra el servidor */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, trabajador: Trabajador) => void;
  logout: () => void;
  hasPermission: (page: PageModule) => boolean;
  /** Vuelve a validar contra GET /auth/me; hace logout si el server responde 401 */
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // IMPORTANTE: el token y el trabajador viven SOLO en este estado de React
  // (memoria del proceso de la pestaña). Nunca se escriben en localStorage,
  // sessionStorage ni cookies. Un F5 o cierre de pestaña borra la sesión:
  // ese es el comportamiento esperado, no un bug.
  const [token, setToken] = useState<string | null>(null);
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setTrabajador(null);
    setAuthToken(null);
  }, []);

  const login = useCallback((newToken: string, newTrabajador: Trabajador) => {
    setToken(newToken);
    setTrabajador(newTrabajador);
    setAuthToken(newToken);
  }, []);

  const refreshMe = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ trabajador: Trabajador }>("/auth/me");
      setTrabajador(data.trabajador);
    } catch {
      // El interceptor de api.ts ya dispara logout global en 401.
      // Cualquier otro error aquí tampoco debe dejar una sesión a medias.
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Si el token cambia (login/logout), sincroniza el header por defecto.
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    // Registra el handler global de 401: cualquier request que falle con
    // "no autenticado" limpia el estado en memoria y manda a /login.
    setUnauthorizedHandler(() => {
      setToken(null);
      setTrabajador(null);
      setAuthToken(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const hasPermission = useCallback(
    (page: PageModule) => {
      if (!trabajador) return false;
      return trabajador.role.permissions.includes(page);
    },
    [trabajador]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      trabajador,
      isLoading,
      isAuthenticated: Boolean(token && trabajador),
      login,
      logout,
      hasPermission,
      refreshMe,
    }),
    [token, trabajador, isLoading, login, logout, hasPermission, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
