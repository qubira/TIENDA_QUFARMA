import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { CartItem } from "./types";

const IGV_RATE = 0.18;

export function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((acc, it) => acc + it.producto.precioVenta * it.cantidad, 0);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;
  return { subtotal, igv, total };
}

export default function CartPanel({
  items,
  onChangeQty,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  onChangeQty: (productoId: string, cantidad: number) => void;
  onRemove: (productoId: string) => void;
  onCheckout: () => void;
}) {
  const { subtotal, igv, total } = computeTotals(items);

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <ShoppingCart size={18} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Carrito</h2>
        <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-300 dark:text-slate-700">
            <ShoppingCart size={36} />
            <p className="text-sm text-slate-400 dark:text-slate-500">Agrega productos para iniciar la venta</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(({ producto, cantidad }) => {
              const max = producto.stockDisponible;
              return (
                <li
                  key={producto.id}
                  className="animate-fade-in flex items-start gap-2 rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {producto.nombreComercial}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatCurrency(producto.precioVenta)} c/u</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        onClick={() => onChangeQty(producto.id, Math.max(1, cantidad - 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={max}
                        value={cantidad}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isFinite(v)) return;
                          onChangeQty(producto.id, Math.min(Math.max(1, v), max));
                        }}
                        className="h-6 w-12 rounded-md border border-slate-200 text-center text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                      <button
                        onClick={() => onChangeQty(producto.id, Math.min(max, cantidad + 1))}
                        disabled={cantidad >= max}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Plus size={12} />
                      </button>
                      <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatCurrency(producto.precioVenta * cantidad)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(producto.id)}
                    className="mt-0.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-1.5 border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>IGV (18%)</span>
          <span>{formatCurrency(igv)}</span>
        </div>
        <div className="flex justify-between pt-1 text-base font-bold text-slate-800 dark:text-slate-100">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="btn-primary mt-2 w-full py-2.5 text-base"
        >
          Cobrar
        </button>
      </div>
    </aside>
  );
}
