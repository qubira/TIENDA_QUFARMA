import { useEffect, useState } from "react";
import { Loader2, Lock, LockOpen, Wallet } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { api, getApiErrorMessage } from "../../lib/api";
import { formatCurrency, formatDateTime } from "../../lib/format";
import type { Caja, ResumenCajaSerie } from "../../lib/types";
import AbrirCajaModal from "./AbrirCajaModal";
import CerrarCajaModal from "./CerrarCajaModal";
import ResumenChart from "./ResumenChart";

export default function CajaPage() {
  const [caja, setCaja] = useState<Caja | null | undefined>(undefined);
  const [historial, setHistorial] = useState<Caja[]>([]);
  const [series, setSeries] = useState<ResumenCajaSerie[]>([]);
  const [agrupar, setAgrupar] = useState<"dia" | "mes" | "anio">("mes");
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [loadingResumen, setLoadingResumen] = useState(true);

  const [showAbrir, setShowAbrir] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadActual() {
    try {
      const { data } = await api.get<{ caja: Caja | null }>("/caja/actual");
      setCaja(data.caja);
    } catch {
      toast.error("No se pudo obtener el estado de caja.");
    }
  }

  async function loadHistorial() {
    setLoadingHistorial(true);
    try {
      const { data } = await api.get<{ cajas: Caja[] }>("/caja/historial");
      setHistorial(data.cajas);
    } catch {
      toast.error("No se pudo cargar el historial de cierres.");
    } finally {
      setLoadingHistorial(false);
    }
  }

  async function loadResumen(g: "dia" | "mes" | "anio") {
    setLoadingResumen(true);
    try {
      const { data } = await api.get<{ series: ResumenCajaSerie[] }>("/caja/resumen", {
        params: { agrupar: g },
      });
      setSeries(data.series);
    } catch {
      toast.error("No se pudo cargar el resumen.");
    } finally {
      setLoadingResumen(false);
    }
  }

  useEffect(() => {
    loadActual();
    loadHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadResumen(agrupar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agrupar]);

  async function handleAbrir(montoApertura: number) {
    setSaving(true);
    setModalError(null);
    try {
      const { data } = await api.post<{ caja: Caja }>("/caja/abrir", { montoApertura });
      setCaja(data.caja);
      toast.success("Caja abierta");
      setShowAbrir(false);
    } catch (err) {
      setModalError(getApiErrorMessage(err, "No se pudo abrir la caja."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCerrar(efectivoContado: number, observaciones: string) {
    if (!caja) return;
    setSaving(true);
    setModalError(null);
    try {
      const { data } = await api.post<{ caja: Caja }>(`/caja/${caja.id}/cerrar`, {
        efectivoContado,
        observaciones: observaciones || undefined,
      });
      toast.success("Caja cerrada");
      setShowCerrar(false);
      setCaja(null);
      loadHistorial();
      loadResumen(agrupar);
    } catch (err) {
      setModalError(getApiErrorMessage(err, "No se pudo cerrar la caja."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Caja" subtitle="Apertura, cierre y resumen de movimientos de caja" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Wallet size={18} />
              <h2 className="text-sm font-bold uppercase tracking-wide">Estado actual</h2>
            </div>

            {caja === undefined ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              </div>
            ) : caja ? (
              <div className="mt-4 space-y-3">
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  <LockOpen size={12} /> Caja abierta
                </span>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    Apertura: <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(caja.montoApertura)}</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(caja.aperturaAt)}</p>
                </div>
                <button
                  className="btn-danger w-full"
                  onClick={() => {
                    setModalError(null);
                    setShowCerrar(true);
                  }}
                >
                  <Lock size={16} /> Cerrar caja
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Lock size={12} /> Sin caja abierta
                </span>
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setModalError(null);
                    setShowAbrir(true);
                  }}
                >
                  <LockOpen size={16} /> Abrir caja
                </button>
              </div>
            )}
          </div>

          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Resumen de ventas
              </h2>
              <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
                {(["dia", "mes", "anio"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setAgrupar(g)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      agrupar === g
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {g === "dia" ? "Día" : g === "mes" ? "Mes" : "Año"}
                  </button>
                ))}
              </div>
            </div>
            {loadingResumen ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              </div>
            ) : (
              <ResumenChart series={series} />
            )}
          </div>
        </div>

        <div className="card mt-6 p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Historial de cierres
          </h2>
          {loadingHistorial ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : historial.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">Aún no hay cierres registrados.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Apertura</th>
                    <th className="px-3 py-2 text-left">Cierre</th>
                    <th className="px-3 py-2 text-right">Monto apertura</th>
                    <th className="px-3 py-2 text-right">Efectivo esperado</th>
                    <th className="px-3 py-2 text-right">Efectivo contado</th>
                    <th className="px-3 py-2 text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historial.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatDateTime(c.aperturaAt)}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatDateTime(c.cierreAt)}</td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                        {formatCurrency(c.montoApertura)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                        {formatCurrency(c.efectivoEsperado)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                        {formatCurrency(c.efectivoContado)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-semibold ${
                          !c.diferencia
                            ? "text-slate-500 dark:text-slate-400"
                            : c.diferencia > 0
                            ? "text-ocean-600 dark:text-ocean-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(c.diferencia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAbrir && (
        <AbrirCajaModal
          onClose={() => setShowAbrir(false)}
          onConfirm={handleAbrir}
          loading={saving}
          error={modalError}
        />
      )}
      {showCerrar && caja && (
        <CerrarCajaModal
          caja={caja}
          onClose={() => setShowCerrar(false)}
          onConfirm={handleCerrar}
          loading={saving}
          error={modalError}
        />
      )}
    </div>
  );
}
