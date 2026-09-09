import { Package, ShieldAlert, Plus } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { ProductoVenta } from "../../lib/types";

export default function ProductResultCard({
  producto,
  onAdd,
}: {
  producto: ProductoVenta;
  onAdd: (p: ProductoVenta) => void;
}) {
  const sinStock = producto.stockDisponible <= 0;

  return (
    <button
      type="button"
      disabled={sinStock}
      onClick={() => onAdd(producto)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex h-28 items-center justify-center bg-slate-50 dark:bg-slate-800">
        {producto.fotoUrl ? (
          <img
            src={producto.fotoUrl}
            alt={producto.nombreComercial}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        )}
        {producto.isControlado && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <ShieldAlert size={11} /> Controlado
          </span>
        )}
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Plus size={16} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">
          {producto.nombreComercial}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
            {formatCurrency(producto.precioVenta)}
          </span>
          <span
            className={`text-[11px] font-medium ${
              sinStock ? "text-rose-500 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {sinStock ? "Sin stock" : `Stock: ${producto.stockDisponible}`}
          </span>
        </div>
      </div>
    </button>
  );
}
