import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, RequirePermission } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import HomeRedirect from "./components/HomeRedirect";
import LoginPage from "./pages/LoginPage";
import SinPermisoPage from "./pages/SinPermisoPage";
import NotFoundPage from "./pages/NotFoundPage";
import VentaPage from "./pages/venta/VentaPage";
import AlmacenPage from "./pages/almacen/AlmacenPage";
import AuditoriaPage from "./pages/AuditoriaPage";
import FacturasPage from "./pages/facturas/FacturasPage";
import CajaPage from "./pages/caja/CajaPage";
import TrabajadoresPage from "./pages/trabajadores/TrabajadoresPage";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/sin-permiso" element={<SinPermisoPage />} />

            <Route
              path="/venta"
              element={
                <RequirePermission page="VENTA">
                  <VentaPage />
                </RequirePermission>
              }
            />
            <Route
              path="/almacen"
              element={
                <RequirePermission page="ALMACEN">
                  <AlmacenPage />
                </RequirePermission>
              }
            />
            <Route
              path="/auditoria"
              element={
                <RequirePermission page="AUDITORIA">
                  <AuditoriaPage />
                </RequirePermission>
              }
            />
            <Route
              path="/facturas"
              element={
                <RequirePermission page="FACTURAS">
                  <FacturasPage />
                </RequirePermission>
              }
            />
            <Route
              path="/caja"
              element={
                <RequirePermission page="CAJA">
                  <CajaPage />
                </RequirePermission>
              }
            />
            <Route
              path="/trabajadores"
              element={
                <RequirePermission page="TRABAJADORES">
                  <TrabajadoresPage />
                </RequirePermission>
              }
            />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
