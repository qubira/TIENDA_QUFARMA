import { AlertTriangle, Ban, Clock } from "lucide-react";
import type { Producto } from "../../lib/types";

export function ProductoBadges({ producto }: { producto: Producto }) {
  const badges: JSX.Element[] = [];

  if (producto.alertaVencimiento === "30") {
    badges.push(
      <span key="venc30" className="badge bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
        <Clock size={11} /> Vence en 30d
      </span>
    );
  } else if (producto.alertaVencimiento === "60") {
    badges.push(
      <span key="venc60" className="badge bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
        <Clock size={11} /> Vence en 60d
      </span>
    );
  } else if (producto.alertaVencimiento === "90") {
    badges.push(
      <span key="venc90" className="badge bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
        <Clock size={11} /> Vence en 90d
      </span>
    );
  }

  if (producto.alertaStockBajo) {
    badges.push(
      <span key="bajo" className="badge bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
        <AlertTriangle size={11} /> Stock bajo
      </span>
    );
  }

  const tieneVencido = producto.lotes?.some((l) => new Date(l.fechaVencimiento) < new Date());
  if (tieneVencido) {
    badges.push(
      <span key="vencido" className="badge bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <Ban size={11} /> Lote vencido
      </span>
    );
  }

  if (badges.length === 0) return null;
  return <div className="flex flex-wrap gap-1">{badges}</div>;
}
