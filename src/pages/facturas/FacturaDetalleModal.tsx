import { useEffect, useState } from "react";
import { Loader2, Printer, Ban } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/format";
import type { Comprobante } from "../../lib/types";
import AnularModal from "./AnularModal";

export default function FacturaDetalleModal({
  comprobanteId,
  onClose,
  onChanged,
}: {
  comprobanteId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detalle, setDetalle] = useState<Comprobante | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnular, setShowAnular] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [anularError, setAnularError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<Comprobante>(`/facturas/${comprobanteId}`)
      .then(({ data }) => setDetalle(data))
      .catch(() => toast.error("No se pudo cargar el detalle."))
      .finally(() => setLoading(false));
  }, [comprobanteId]);

  async function handleAnular(motivo: string) {
    setAnulando(true);
    setAnularError(null);
    try {
      await api.post(`/facturas/${comprobanteId}/anular`, { motivo });
      toast.success("Comprobante anulado");
      setShowAnular(false);
      onChanged();
      onClose();
    } catch (err) {
      setAnularError(getApiErrorMessage(err, "No se pudo anular el comprobante."));
    } finally {
      setAnulando(false);
    }
  }

  const venta = detalle?.venta;
  const numeroFmt = detalle ? `${detalle.serie}-${String(detalle.numero).padStart(6, "0")}` : "";

  return (
    <Modal
      title={detalle ? `${detalle.tipo === "BOLETA" ? "Boleta" : "Factura"} ${numeroFmt}` : "Comprobante"}
      onClose={onClose}
      widthClass="max-w-lg"
    >
      {loading || !detalle ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <div>
          <div id="print-area" className="space-y-4 text-sm">
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">QUFARMA</p>
              <p className="text-xs text-slate-500">
                {detalle.tipo === "BOLETA" ? "Boleta de venta" : "Factura"} electrónica
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-700">{numeroFmt}</p>
              <span
                className={`badge mt-1 ${
                  detalle.estado === "ANULADA" ? "bg-rose-100 text-rose-700" : "bg-brand-50 text-brand-700"
                }`}
              >
                {detalle.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-dashed border-slate-200 pt-3 text-xs">
              <div>
                <p className="text-slate-400">Fecha</p>
                <p className="font-medium text-slate-700">{formatDateTime(detalle.createdAt)}</p>
              </div>
              <div>
                <p className="text-slate-400">Atendido por</p>
                <p className="font-medium text-slate-700">
                  {venta?.trabajador ? `${venta.trabajador.nombres} ${venta.trabajador.apellidos}` : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Cliente</p>
                <p className="font-medium text-slate-700">{venta?.cliente?.nombre ?? "Cliente varios"}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3">
              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-1 text-left">Producto</th>
                    <th className="pb-1 text-right">Cant.</th>
                    <th className="pb-1 text-right">P. Unit.</th>
                    <th className="pb-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(venta?.items ?? []).map((it, idx) => (
                    <tr key={it.id ?? idx}>
                      <td className="py-1 text-slate-700">
                        {it.producto?.nombreComercial ?? it.productoId}
                      </td>
                      <td className="py-1 text-right text-slate-600">{it.cantidad}</td>
                      <td className="py-1 text-right text-slate-600">
                        {formatCurrency(it.precioUnitario)}
                      </td>
                      <td className="py-1 text-right font-medium text-slate-700">
                        {formatCurrency(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 border-t border-dashed border-slate-200 pt-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(venta?.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IGV (18%)</span>
                <span>{formatCurrency(venta?.igv)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800">
                <span>Total</span>
                <span>{formatCurrency(venta?.total)}</span>
              </div>
              <div className="flex justify-between pt-1 text-slate-400">
                <span>Método de pago</span>
                <span>{venta?.metodoPago}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir
            </button>
            {detalle.estado !== "ANULADA" && (
              <button className="btn-danger flex-1" onClick={() => setShowAnular(true)}>
                <Ban size={16} /> Anular
              </button>
            )}
          </div>
        </div>
      )}

      {showAnular && (
        <AnularModal
          onClose={() => setShowAnular(false)}
          onConfirm={handleAnular}
          loading={anulando}
          error={anularError}
        />
      )}
    </Modal>
  );
}
