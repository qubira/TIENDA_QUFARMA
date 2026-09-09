import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { PageModule } from "../lib/types";
import LoadingScreen from "./LoadingScreen";

/**
 * Envuelve todo el árbol de páginas protegidas.
 *
 * 1. Si no hay token en memoria, redirige a /login inmediatamente, sin
 *    renderizar nada del contenido protegido (cubre URL directa y "atrás").
 * 2. Si hay token, en cada cambio de ruta (cada "página" montada dentro del
 *    layout) revalida contra GET /auth/me. Si el servidor responde 401, el
 *    interceptor de api.ts limpia el estado y este componente redirige a
 *    /login en el siguiente render (cubre token expirado con la pestaña
 *    abierta).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, refreshMe, token } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const lastCheckedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setChecked(true);
      return;
    }
    if (lastCheckedPath.current === location.pathname) return;
    lastCheckedPath.current = location.pathname;
    setChecked(false);
    refreshMe().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, token]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!checked) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/** Bloquea el acceso a una página cuyo módulo el trabajador no tiene permitido. */
export function RequirePermission({
  page,
  children,
}: {
  page: PageModule;
  children: ReactNode;
}) {
  const { hasPermission } = useAuth();
  if (!hasPermission(page)) {
    return <Navigate to="/sin-permiso" replace />;
  }
  return <>{children}</>;
}
