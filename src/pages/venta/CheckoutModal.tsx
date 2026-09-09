import { useMemo, useState } from "react";
import { Banknote, CreditCard, Loader2, Smartphone, User } from "lucide-react";
import Modal from "../../components/Modal";
import { formatCurrency } from "../../lib/format";
import type { MetodoPago, TipoComprobante } from "../../lib/types";
import type { CartItem } from "./types";
import { computeTotals } from "./CartPanel";

const METODOS: { value: MetodoPago; label: string; icon: typeof Banknote }[] = [
  { value: "EFECTIVO", label: "Efectivo", icon: Banknote },
  { value: "TARJETA", label: "Tarjeta", icon: CreditCard },
  { value: "YAPE", label: "Yape", icon: Smartphone },
  { value: "PLIN", label: "Plin", icon: Smartphone },
];

export interface CheckoutPayload {
  metodoPago: MetodoPago;
  montoRecibido?: number;
  tipoComprobante: TipoComprobante;
  clienteNuevo?: { nombre: string; documento?: string; telefono?: string };
}

export default function CheckoutModal({
  items,
  onClose,
  onConfirm,
  loading,
  requireCliente,
  errorMessage,
}: {
  items: CartItem[];
  onClose: () => void;
  onConfirm: (payload: CheckoutPayload) => void;
  loading: boolean;
  requireCliente: boolean;
  errorMessage: string | null;
}) {
  const { total } = computeTotals(items);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("BOLETA");
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [showCliente, setShowCliente] = useState(requireCliente);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const vuelto = useMemo(() => {
    const recibido = Number(montoRecibido || 0);
    return recibido - total;
  }, [montoRecibido, total]);

  const canSubmit =
    !loading &&
    (metodoPago !== "EFECTIVO" || (Number(montoRecibido) >= total && montoRecibido !== "")) &&
    (!requireCliente || clienteNombre.trim().length > 0);

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm({
      metodoPago,
      montoRecibido: metodoPago === "EFECTIVO" ? Number(montoRecibido) : undefined,
      tipoComprobante,
      clienteNuevo: clienteNombre.trim()
        ? {
            nombre: clienteNombre.trim(),
            documento: clienteDocumento.trim() || undefined,
            telefono: clienteTelefono.trim() || undefined,
          }
        : undefined,
    });
  }

  return (
    <Modal title="Confirmar venta" onClose={onClose} widthClass="max-w-lg">
      <div className="space-y-5">
        <div className="rounded-lg bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Total a cobrar</p>
          <p className="text-2xl font-extrabold text-brand-800">{formatCurrency(total)}</p>
        </div>

        <div>
          <p className="label">Método de pago</p>
          <div className="grid grid-cols-4 gap-2">
            {METODOS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMetodoPago(value)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${
                  metodoPago === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {metodoPago === "EFECTIVO" && (
          <div className="animate-fade-in grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monto recibido</label>
              <input
                type="number"
                min={0}
                step="0.10"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                className="input"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Vuelto</label>
              <div
                className={`input flex items-center font-semibold ${
                  vuelto < 0 ? "text-rose-500" : "text-brand-700"
                }`}
              >
                {formatCurrency(Math.max(vuelto, 0))}
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="label">Tipo de comprobante</p>
          <div className="grid grid-cols-2 gap-2">
            {(["BOLETA", "FACTURA"] as TipoComprobante[]).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoComprobante(tipo)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  tipoComprobante === tipo
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tipo === "BOLETA" ? "Boleta" : "Factura"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowCliente((v) => !v || requireCliente)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            <User size={15} />
            Cliente {requireCliente ? "(obligatorio: producto controlado)" : "(opcional)"}
          </button>

          {(showCliente || requireCliente) && (
            <div className="animate-fade-in mt-2 space-y-2 rounded-lg border border-slate-200 p-3">
              <div>
                <label className="label">
                  Nombre {requireCliente && <span className="text-rose-500">*</span>}
                </label>
                <input
                  className="input"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Documento</label>
                  <input
                    className="input"
                    value={clienteDocumento}
                    onChange={(e) => setClienteDocumento(e.target.value)}
                    placeholder="DNI/RUC"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    className="input"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="999 999 999"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="animate-fade-in rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary flex-1"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar venta
          </button>
        </div>
      </div>
    </Modal>
  );
}
