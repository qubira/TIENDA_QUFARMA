import type { ProductoVenta } from "../../lib/types";

export interface CartItem {
  producto: ProductoVenta;
  cantidad: number;
}
