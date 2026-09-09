import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { PageModule } from "../lib/types";

const PRIORITY: PageModule[] = ["VENTA", "ALMACEN", "CAJA", "FACTURAS", "AUDITORIA", "TRABAJADORES"];
const PATH: Record<PageModule, string> = {
  VENTA: "/venta",
  ALMACEN: "/almacen",
  AUDITORIA: "/auditoria",
  FACTURAS: "/facturas",
  CAJA: "/caja",
  TRABAJADORES: "/trabajadores",
};

/** Redirige "/" al primer módulo permitido para el trabajador logeado. */
export default function HomeRedirect() {
  const { trabajador } = useAuth();
  const first = PRIORITY.find((p) => trabajador?.role.permissions.includes(p));
  return <Navigate to={first ? PATH[first] : "/sin-permiso"} replace />;
}
