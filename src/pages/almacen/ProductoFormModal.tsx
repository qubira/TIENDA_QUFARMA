import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import type { Categoria, Producto } from "../../lib/types";

export default function ProductoFormModal({
  producto,
  categorias,
  onClose,
  onSaved,
}: {
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(producto);
  const [nombreComercial, setNombreComercial] = useState(producto?.nombreComercial ?? "");
  const [principioActivo, setPrincipioActivo] = useState(producto?.principioActivo ?? "");
  const [laboratorio, setLaboratorio] = useState(producto?.laboratorio ?? "");
  const [presentacion, setPresentacion] = useState(producto?.presentacion ?? "");
  const [ean, setEan] = useState(producto?.ean ?? "");
  const [categoriaId, setCategoriaId] = useState(
    producto?.categoriaId ?? producto?.categoria?.id ?? categorias[0]?.id ?? ""
  );
  const [precioVenta, setPrecioVenta] = useState(String(producto?.precioVenta ?? ""));
  const [precioCompra, setPrecioCompra] = useState(String(producto?.precioCompra ?? ""));
  const [stockMinimo, setStockMinimo] = useState(String(producto?.stockMinimo ?? "10"));
  const [isControlado, setIsControlado] = useState(producto?.isControlado ?? false);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(producto?.fotoUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFoto(file: File | null) {
    setFoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("nombreComercial", nombreComercial);
      form.append("principioActivo", principioActivo);
      form.append("laboratorio", laboratorio);
      form.append("presentacion", presentacion);
      if (ean) form.append("ean", ean);
      form.append("categoriaId", categoriaId);
      form.append("precioVenta", precioVenta);
      form.append("precioCompra", precioCompra);
      form.append("stockMinimo", stockMinimo);
      form.append("isControlado", String(isControlado));
      if (foto) form.append("foto", foto);

      if (isEdit && producto) {
        await api.patch(`/almacen/productos/${producto.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto actualizado");
      } else {
        await api.post("/almacen/productos", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto creado");
      }
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo guardar el producto."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? "Editar producto" : "Nuevo producto"} onClose={onClose} widthClass="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:border-brand-300 hover:text-brand-500">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-[10px]">Foto</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFoto(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nombre comercial</label>
              <input
                required
                className="input"
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Principio activo</label>
              <input
                required
                className="input"
                value={principioActivo}
                onChange={(e) => setPrincipioActivo(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Laboratorio</label>
              <input
                required
                className="input"
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Presentación</label>
            <input
              required
              className="input"
              value={presentacion}
              onChange={(e) => setPresentacion(e.target.value)}
              placeholder="Caja x 10 tab."
            />
          </div>
          <div>
            <label className="label">EAN (código de barras)</label>
            <input className="input" value={ean ?? ""} onChange={(e) => setEan(e.target.value)} />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select
              required
              className="input"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Precio venta (S/)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Precio compra (S/)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input
              required
              type="number"
              min={0}
              className="input"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isControlado}
            onChange={(e) => setIsControlado(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Producto controlado (exige datos de cliente al vender)
        </label>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
