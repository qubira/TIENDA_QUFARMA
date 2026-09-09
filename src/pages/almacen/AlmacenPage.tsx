import { useEffect, useState } from "react";
import {
  LayoutGrid,
  List,
  Loader2,
  Package,
  Plus,
  Search,
  Boxes,
  ClipboardEdit,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import type { Categoria, Producto } from "../../lib/types";
import { ProductoBadges } from "./badges";
import ProductoFormModal from "./ProductoFormModal";
import LotesModal from "./LotesModal";
import MovimientoModal from "./MovimientoModal";

type Estado = "" | "bajo_stock" | "por_vencer" | "vencido";

export default function AlmacenPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"tabla" | "tarjetas">("tabla");
  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState<Estado>("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [lotesProducto, setLotesProducto] = useState<Producto | null>(null);
  const [movimientoProducto, setMovimientoProducto] = useState<Producto | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get<{ productos: Producto[] }>("/almacen/productos", {
        params: {
          q: q || undefined,
          categoriaId: categoriaId || undefined,
          estado: estado || undefined,
        },
      });
      setProductos(data.productos);
    } catch {
      toast.error("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategorias() {
    try {
      const { data } = await api.get<{ categorias: Categoria[] }>("/almacen/categorias");
      setCategorias(data.categorias);
    } catch {
      /* silencioso, no bloquea la vista */
    }
  }

  useEffect(() => {
    loadCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoriaId, estado]);

  async function toggleActivo(p: Producto) {
    try {
      await api.patch(`/almacen/productos/${p.id}/activo`, { activo: !p.activo });
      toast.success(p.activo ? "Producto desactivado" : "Producto activado");
      load();
    } catch {
      toast.error("No se pudo actualizar el estado.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Almacén"
        subtitle="Gestión de productos, lotes y movimientos de inventario"
        actions={
          <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={16} /> Nuevo producto
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-6 py-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar producto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input w-48" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select className="input w-48" value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
          <option value="">Todos los estados</option>
          <option value="bajo_stock">Stock bajo</option>
          <option value="por_vencer">Por vencer</option>
          <option value="vencido">Vencido</option>
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          <button
            onClick={() => setView("tabla")}
            className={`rounded-md p-1.5 ${view === "tabla" ? "bg-brand-50 text-brand-700" : "text-slate-400"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("tarjetas")}
            className={`rounded-md p-1.5 ${view === "tarjetas" ? "bg-brand-50 text-brand-700" : "text-slate-400"}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-300">
            <Package size={40} />
            <p className="text-sm text-slate-400">No hay productos que coincidan con los filtros.</p>
          </div>
        ) : view === "tabla" ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Alertas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((p) => (
                  <tr key={p.id} className={!p.activo ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          {p.fotoUrl ? (
                            <img src={p.fotoUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{p.nombreComercial}</p>
                          <p className="truncate text-xs text-slate-400">{p.presentacion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.categoria?.nombre}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {formatCurrency(p.precioVenta)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{p.stockTotal ?? 0}</td>
                    <td className="px-4 py-3">
                      <ProductoBadges producto={p} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          title="Lotes"
                          onClick={() => setLotesProducto(p)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <Boxes size={16} />
                        </button>
                        <button
                          title="Movimiento"
                          onClick={() => setMovimientoProducto(p)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <ClipboardEdit size={16} />
                        </button>
                        <button
                          onClick={() => { setEditing(p); setShowForm(true); }}
                          className="btn-ghost !px-2 !py-1 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(p)}
                          className={`!px-2 !py-1 text-xs ${p.activo ? "btn-ghost" : "btn-secondary"}`}
                        >
                          {p.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {productos.map((p) => (
              <div
                key={p.id}
                className={`card flex flex-col overflow-hidden ${!p.activo ? "opacity-50" : ""}`}
              >
                <div className="flex h-28 items-center justify-center bg-slate-50">
                  {p.fotoUrl ? (
                    <img src={p.fotoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                    {p.nombreComercial}
                  </p>
                  <p className="text-xs text-slate-400">{p.categoria?.nombre}</p>
                  <ProductoBadges producto={p} />
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-brand-700">
                      {formatCurrency(p.precioVenta)}
                    </span>
                    <span className="text-xs text-slate-400">Stock: {p.stockTotal ?? 0}</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => setLotesProducto(p)}
                      className="btn-secondary flex-1 !px-2 !py-1 text-xs"
                    >
                      Lotes
                    </button>
                    <button
                      onClick={() => { setEditing(p); setShowForm(true); }}
                      className="btn-secondary flex-1 !px-2 !py-1 text-xs"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductoFormModal
          producto={editing}
          categorias={categorias}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {lotesProducto && (
        <LotesModal
          producto={lotesProducto}
          onClose={() => setLotesProducto(null)}
          onChanged={load}
        />
      )}

      {movimientoProducto && (
        <MovimientoModal
          producto={movimientoProducto}
          onClose={() => setMovimientoProducto(null)}
          onSaved={() => {
            setMovimientoProducto(null);
            load();
          }}
        />
      )}
    </div>
  );
}
