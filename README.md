# QUFARMA — Panel interno (tienda)

Panel interno de gestión de la farmacia QUFARMA: login + módulos de Venta (POS), Almacén,
Auditoría, Facturas, Caja y Trabajadores. Consume la API REST en `../api` según
`API_CONTRACT.md`.

Stack: React + Vite + TypeScript + Tailwind CSS + React Router.

## Correr en local

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu API no corre en localhost:4000
npm run dev
```

La app queda disponible en `http://localhost:5173`. Necesitas la API (`../api`) corriendo
para poder loguearte y usar los módulos.

## Build de producción

```bash
npm run build   # tsc -b && vite build -> genera dist/
npm run preview # sirve dist/ localmente para verificar el build
```

`vite.config.ts` fuerza `build.sourcemap: false` para no exponer sourcemaps en producción.

## Seguridad de sesión (importante)

El JWT y los datos del trabajador logeado viven **solo en memoria** (React Context,
`src/context/AuthContext.tsx`). Nunca se persisten en `localStorage`, `sessionStorage` ni
cookies. Esto significa que **recargar la página (F5) o cerrar la pestaña cierra la sesión**
— es el comportamiento esperado, no un bug. Cada página protegida revalida contra
`GET /auth/me` al montarse/cambiar de ruta, y cualquier 401 del backend fuerza logout y
redirección a `/login` de inmediato.

## Despliegue en Vercel

Al crear el proyecto en Vercel:

- **Root Directory**: `tienda`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (por defecto)
- **Variable de entorno**: `VITE_API_URL` → URL pública de la API en Render, por ejemplo
  `https://qufarma-api.onrender.com/api`

No se necesita configuración adicional de rewrites: es una SPA servida como archivos
estáticos; Vercel detecta Vite automáticamente y sirve `index.html` para rutas no
encontradas.

## Estructura

```
src/
  components/   Layout, Sidebar, ProtectedRoute, Modal, etc. (compartidos)
  context/      AuthContext (sesión en memoria)
  lib/          cliente API (axios), tipos, formateo, debounce
  pages/        una carpeta por módulo (venta/, almacen/, facturas/, caja/, trabajadores/)
    ├─ VentaPage, AlmacenPage, AuditoriaPage, FacturasPage, CajaPage, TrabajadoresPage
    └─ LoginPage, SinPermisoPage, NotFoundPage
```
