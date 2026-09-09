import { useEffect, useState } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "../../lib/api";
import { useDebounce } from "../../lib/useDebounce";
import type { ProductoVenta, Venta, Comprobante } from "../../lib/types";
import ProductResultCard from "./ProductResultCard";
import CartPanel from "./CartPanel";
import CheckoutModal, { type CheckoutPayload } from "./CheckoutModal";
import type { CartItem } from "./types";

export default function VentaPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<ProductoVenta[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [requireCliente, setRequireCliente] = useState(false);

  useEffect(() => {
    let active = true;
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    api
      .get<{ productos: ProductoVenta[] }>("/ventas/buscar-productos", {
        params: { q: debouncedQuery },
      })
      .then(({ data }) => {
        if (active) setResults(data.productos);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setSearching(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  function addToCart(producto: ProductoVenta) {
    setCart((prev) => {
      const existing = prev.find((it) => it.producto.id === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.stockDisponible) {
          toast.warning("No hay más stock disponible de este producto.");
          return prev;
        }
        return prev.map((it) =>
          it.producto.id === producto.id ? { ...it, cantidad: it.cantidad + 1 } : it
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function changeQty(productoId: string, cantidad: number) {
    setCart((prev) =>
      prev.map((it) => (it.producto.id === productoId ? { ...it, cantidad } : it))
    );
  }

  function removeFromCart(productoId: string) {
    setCart((prev) => prev.filter((it) => it.producto.id !== productoId));
  }

  useEffect(() => {
    setRequireCliente(cart.some((it) => it.producto.isControlado));
  }, [cart]);

  async function handleConfirm(payload: CheckoutPayload) {
    setConfirming(true);
    setCheckoutError(null);
    try {
      const { data } = await api.post<{ venta: Venta; comprobante: Comprobante }>("/ventas", {
        items: cart.map((it) => ({ productoId: it.producto.id, cantidad: it.cantidad })),
        metodoPago: payload.metodoPago,
        montoRecibido: payload.montoRecibido,
        tipoComprobante: payload.tipoComprobante,
        clienteNuevo: payload.clienteNuevo,
      });
      toast.success(
        `Venta registrada — ${data.comprobante.serie}${String(data.comprobante.numero).padStart(
          6,
          "0"
        )}`
      );
      setCart([]);
      setCheckoutOpen(false);
      setQuery("");
      setResults([]);
    } catch (err) {
      const msg = getApiErrorMessage(err, "No se pudo registrar la venta.");
      setCheckoutError(msg);
      if (/client|controlad/i.test(msg)) {
        setRequireCliente(true);
      }
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
            )}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto por nombre, principio activo o laboratorio…"
              className="input pl-9 pr-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!debouncedQuery.trim() ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-300">
              <PackageSearch size={48} />
              <p className="text-sm text-slate-400">Escribe para buscar productos y agrégalos al carrito</p>
            </div>
          ) : results.length === 0 && !searching ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-300">
              <PackageSearch size={48} />
              <p className="text-sm text-slate-400">Sin resultados para "{debouncedQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((p) => (
                <ProductResultCard key={p.id} producto={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CartPanel
        items={cart}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onCheckout={() => {
          setCheckoutError(null);
          setCheckoutOpen(true);
        }}
      />

      {checkoutOpen && (
        <CheckoutModal
          items={cart}
          loading={confirming}
          requireCliente={requireCliente}
          errorMessage={checkoutError}
          onClose={() => !confirming && setCheckoutOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
