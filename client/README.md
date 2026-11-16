# HelpDesk · Cliente web

Interfaz de la mesa de ayuda: registro, creación de tickets, conversación, cambios de estado,
asignación y auditoría. Construida con **React 19 + Vite 8 + TypeScript** y estilos con
**Tailwind CSS 3**.

> API: `https://help-desk-api-inky.vercel.app` · Documentación Swagger: `/docs`
> Frontend desplegado: `https://helpdeskclient.vercel.app`

---

## Stack

| Pieza | Versión / decisión |
| --- | --- |
| React | 19 (StrictMode) |
| Router | `react-router-dom` con `BrowserRouter` (SPA, sin SSR) |
| Build | Vite 8 + TypeScript 7 |
| Estilos | Tailwind CSS 3.4 + PostCSS + Autoprefixer |
| Estado de sesión | Context API (`AuthContext`) + `localStorage` |
| Datos | `fetch` sobre una capa tipada en `src/utils/api.ts` |

No se usa React Router como *framework* (no hay loaders, actions ni SSR): el deploy es
estático y las rutas profundas se resuelven con un rewrite SPA en `vercel.json`.

---

## Sistema visual

La interfaz sigue una dirección **editorial / expediente**: papel cálido, tinta, reglas de
1px, sellos de estado y numeración en monoespaciada. No hay gradientes ni tarjetas flotantes;
la jerarquía se resuelve con tipografía y líneas.

- **Tipografía**: `Fraunces` (títulos, serif variable), `IBM Plex Sans` (UI),
  `IBM Plex Mono` (etiquetas, series, fechas, IDs).
- **Paleta**: `paper` (#f2ede3) de fondo, `ink` (#16130f) para texto, `accent` (#b23a1e) para
  acciones y `signal` para los estados (abierto / en progreso / resuelto / cerrado).
- **Componentes** definidos como clases en `src/index.css`: `.btn-*`, `.input`, `.label`,
  `.panel`, `.stamp`, `.ledger-row`, `.eyebrow`, `.serial`, `.display-*`.
- **Movimiento**: entrada escalonada (`.reveal` con `--i`), *sweep* en el loader y
  desplazamiento de 2px en botones. Todo respeta `prefers-reduced-motion`.

Los tokens viven en `tailwind.config.js` (colores, fuentes, sombras, keyframes).

---

## Rutas

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/login`, `/register` | público | Acceso y registro (redirigen si ya hay sesión) |
| `/` | autenticado | Listado con filtros (estado, prioridad, asignados a mí) y paginación |
| `/tickets/new` | autenticado | Alta de ticket |
| `/ticket/:id` | autenticado (dueño o agente/admin) | Detalle, edición, gestión y comentarios |
| `/audit/:id` | AGENT, ADMIN | Historial de auditoría del ticket |
| `/users` | ADMIN | Administración de cuentas y roles |
| `/profile` | autenticado | Datos personales y cambio de contraseña |
| `*` | autenticado | 404 dentro del layout |

Los guards están en `src/App.tsx` (`RequireAuth`, `RequireRole`, `PublicOnly`).

---

## Estructura

```
client/
├─ index.html                 # fuentes, meta y theme-color
├─ tailwind.config.js         # tokens del sistema visual
├─ postcss.config.js
├─ vercel.json                # rewrite SPA → /index.html
└─ src/
   ├─ App.tsx                 # providers + router + guards
   ├─ index.css               # @layer base/components/utilities
   ├─ auth/AuthContext.tsx    # sesión, roles, updateProfile
   ├─ components/
   │  ├─ AuthShell.tsx        # marco de login/registro
   │  ├─ Layout.tsx           # rail lateral, nav y footer
   │  ├─ ToastProvider.tsx    # notificaciones
   │  └─ ui.tsx               # sellos, spinner, estados vacíos, formatters
   ├─ pages/                  # una página por ruta
   └─ utils/api.ts            # cliente HTTP tipado
```

---

## Desarrollo local

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

El cliente apunta por defecto a `https://help-desk-api-inky.vercel.app`. Para usar una API
local, creá `client/.env.local`:

```bash
VITE_API_BASE=http://localhost:3000
```

> El backend debe permitir el origen del cliente. `src/server.ts` ya incluye
> `localhost:5173`, `localhost:4173` y los previews de Vercel; se puede ampliar con la
> variable `CORS_ORIGINS` (lista separada por comas).

### Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | `tsc -b` + build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run lint` | Oxlint |

---

## Deploy en Vercel (proyecto frontend)

Este repositorio se despliega como **dos proyectos separados**:

| Proyecto | Root Directory | Config | Build |
| --- | --- | --- | --- |
| API | raíz del repo | `vercel.json` (solo `api/index.ts`) | `npm run build` |
| Cliente | `client` | `client/vercel.json` (rewrite SPA) | `npm run build` → `dist` |

En el proyecto del cliente:

- **Framework Preset**: Vite
- **Output Directory**: `dist`
- **Env var** (opcional): `VITE_API_BASE=https://help-desk-api-inky.vercel.app`

`client/vercel.json` reescribe cualquier ruta a `/index.html`, necesario para que recargar
`/login`, `/ticket/:id`, `/audit/:id` o `/users` no devuelva 404.

---

## Notas de permisos

La UI refleja las reglas del backend, no las duplica:

- Un `CUSTOMER` sólo edita su ticket mientras esté `OPEN`; no ve estado, prioridad,
  asignación ni auditoría.
- `AGENT` y `ADMIN` gestionan estado y prioridad y ven la auditoría.
- La asignación desde la interfaz aparece **sólo para ADMIN**, porque `GET /api/users`
  requiere ese rol. Si se expone un endpoint de agentes, alcanza con habilitar el bloque en
  `TicketDetailPage`.
- Ante un `401` la capa de API limpia la sesión y el guard redirige a `/login`.
