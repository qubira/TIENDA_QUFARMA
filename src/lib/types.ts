// Tipos compartidos, calcados del API_CONTRACT.md

export type PageModule =
  | "VENTA"
  | "ALMACEN"
  | "AUDITORIA"
  | "FACTURAS"
  | "CAJA"
  | "TRABAJADORES";

export interface Role {
  id: string;
  nombre: string;
  permissions: PageModule[];
}

export interface Trabajador {
  id: string;
  nombres: string;
  apellidos: string;
  username: string;
  cargo: string;
  fotoUrl: string | null;
  role: Role;
  activo?: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Lote {
  id: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
  precioCompra?: number;
}

export interface Producto {
  id: string;
  nombreComercial: string;
  principioActivo: string;
  laboratorio: string;
  presentacion: string;
  ean?: string | null;
  categoria: Categoria;
  categoriaId?: string;
  precioVenta: number;
  precioCompra?: number;
  stockMinimo?: number;
  isControlado: boolean;
  fotoUrl: string | null;
  activo?: boolean;
  lotes?: Lote[];
  stockTotal?: number;
  stockDisponible?: number;
  alertaStockBajo?: boolean;
  alertaVencimiento?: "30" | "60" | "90" | null;
}

export interface ProductoVenta {
  id: string;
  nombreComercial: string;
  precioVenta: number;
  fotoUrl: string | null;
  isControlado: boolean;
  stockDisponible: number;
  lotes: { id: string; numeroLote: string; fechaVencimiento: string; cantidad: number }[];
}

export interface Cliente {
  id: string;
  nombre: string;
  documento?: string | null;
  telefono?: string | null;
}

export type MetodoPago = "EFECTIVO" | "TARJETA" | "YAPE" | "PLIN";
export type TipoComprobante = "BOLETA" | "FACTURA";

export interface ItemVenta {
  id?: string;
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Comprobante {
  id: string;
  serie: string;
  numero: number;
  tipo: TipoComprobante;
  estado: "EMITIDA" | "ANULADA";
  createdAt: string;
  venta?: Venta;
}

export interface Venta {
  id: string;
  numero?: string;
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: MetodoPago;
  montoRecibido?: number;
  estado?: "CONFIRMADA" | "ANULADA";
  createdAt: string;
  cliente?: Cliente | null;
  trabajador?: Trabajador;
  items?: ItemVenta[];
  comprobante?: Comprobante;
}

export interface MovimientoInventario {
  id: string;
  productoId: string;
  producto?: Producto;
  loteId?: string | null;
  tipo: "ENTRADA" | "SALIDA" | "AJUSTE" | "MERMA";
  cantidad: number;
  motivo?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  trabajadorId?: string;
  trabajador?: Trabajador;
  accion: string;
  modulo: string;
  detalle?: Record<string, unknown>;
}

export interface Caja {
  id: string;
  trabajadorId: string;
  montoApertura: number;
  aperturaAt: string;
  cierreAt?: string | null;
  efectivoContado?: number | null;
  efectivoEsperado?: number | null;
  diferencia?: number | null;
  observaciones?: string | null;
  estado: "ABIERTA" | "CERRADA";
}

export interface ResumenCajaSerie {
  periodo: string;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalYapePlin: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}
