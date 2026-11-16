# HelpDesk · mesa de ayuda

Aplicación full-stack de gestión de tickets de soporte: registro de clientes, creación y
seguimiento de tickets, asignación a agentes, conversación en hilo y auditoría inmutable de
cada cambio.

El repositorio contiene **dos proyectos desplegables por separado**:

| Proyecto | Stack | Root Directory | Producción |
| --- | --- | --- | --- |
| **API** | NestJS 12 · TypeScript · Prisma · PostgreSQL | raíz del repo | [help-desk-api-inky.vercel.app](https://help-desk-api-inky.vercel.app) |
| **Cliente web** | React 19 · Vite 8 · Tailwind CSS | `client` | [helpdeskclient.vercel.app](https://helpdeskclient.vercel.app) |

> **Swagger (producción):** [help-desk-api-inky.vercel.app/docs](https://help-desk-api-inky.vercel.app/docs) ·
> **Health check:** [`/health`](https://help-desk-api-inky.vercel.app/health)

---

## 🎯 Flujo del producto

1. **Cliente:** se registra, inicia sesión y crea un ticket con su incidencia.
2. **Agente / Admin:** consulta la bandeja, asigna el ticket, actualiza estado y prioridad y responde.
3. **Conversación:** cliente y agente intercambian comentarios en el hilo del ticket.
4. **Trazabilidad:** creación, cambios de estado, prioridad, asignación y comentarios quedan
   registrados en `AuditLog`, visible sólo para AGENT y ADMIN.

---

## 🛠️ Stack tecnológico

**Backend**

- **NestJS 12** — arquitectura modular, inyección de dependencias, guards y pipes
- **TypeScript (ESM)** con tipado estricto
- **PostgreSQL** + **Prisma ORM** (esquema, migraciones y cliente tipado)
- **Autenticación** — Passport JWT, `bcryptjs`, decorador `@Roles()` y `RolesGuard`
- **Validación** — `class-validator` + `class-transformer` con `ValidationPipe` global
- **Documentación** — Swagger / OpenAPI interactivo (CDN, compatible con serverless)
- **Testing** — Vitest + Supertest
- **Infra** — Docker Compose para desarrollo local, Vercel Serverless Functions en producción
- **CI** — GitHub Actions (lint, tests y build)

**Frontend**

- **React 19** + `react-router-dom` (SPA con `BrowserRouter`, sin SSR)
- **Vite 8** + **Tailwind CSS 3.4** (PostCSS + Autoprefixer)
- Capa de API tipada con `fetch` y sesión en Context + `localStorage`
- Ver [`client/README.md`](client/README.md) para el detalle del sistema visual y las rutas.

---

## 🔐 Matriz de permisos

| Funcionalidad | Customer | Agent | Admin |
| --- | :---: | :---: | :---: |
| Crear tickets | ✅ | ✅ | ✅ |
| Ver tickets propios | ✅ | ✅ | ✅ |
| Listar todos los tickets del sistema | ❌ | ✅ | ✅ |
| Editar título / descripción de un ticket | ✅ (sólo propio y `OPEN`) | ✅ | ✅ |
| Modificar estado / prioridad | ❌ | ✅ | ✅ |
| Asignar ticket a un agente | ❌ | ✅ | ✅ |
| Comentar en ticket propio | ✅ | ✅ | ✅ |
| Comentar en tickets ajenos | ❌ | ✅ | ✅ |
| Ver historial de auditoría | ❌ | ✅ | ✅ |
| Listar y administrar usuarios | ❌ | ❌ | ✅ |

---

## 📡 Endpoints principales

### Autenticación

- `POST /api/auth/register` — registro público de nuevos clientes
- `POST /api/auth/login` — inicio de sesión, devuelve Bearer JWT
- `GET /api/auth/me` — perfil del usuario autenticado

### Usuarios (gestión administrativa)

- `GET /api/users` — listar usuarios (`ADMIN`)
- `GET /api/users/:id` — consultar usuario (`ADMIN` o el propio)
- `PATCH /api/users/:id` — actualizar datos o rol (`ADMIN` o el propio)

### Tickets

- `POST /api/tickets` — crear ticket
- `GET /api/tickets` — listar con paginación (`page`, `limit`) y filtros (`status`, `priority`, `assignedToId`)
- `GET /api/tickets/:id` — detalle
- `PATCH /api/tickets/:id` — actualizar título, descripción, prioridad o estado
- `PATCH /api/tickets/:id/status` — cambiar estado (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) — `AGENT`, `ADMIN`
- `PATCH /api/tickets/:id/assign` — asignar a un agente, body `{ "assignedToId": "<uuid>" }` — `AGENT`, `ADMIN`

### Comentarios y auditoría

- `POST /api/tickets/:ticketId/comments` — agregar comentario
- `GET /api/tickets/:ticketId/comments` — listar comentarios
- `GET /api/tickets/:ticketId/audit` — historial de eventos — `AGENT`, `ADMIN`

Respuesta de listados:

```json
{
  "data": [ /* ... */ ],
  "meta": { "total": 42, "page": 1, "limit": 12, "totalPages": 4 }
}
```

---

## 🚀 Instalación y ejecución local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Veilen1/HelpDesk-api.git
cd HelpDesk-api
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `NODE_ENV` | Entorno (`development`, `test`, `production`) | `development` |
| `PORT` | Puerto HTTP de la API | `3000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public` |
| `JWT_SECRET` | Clave para firmar tokens JWT | `super-secret-helpdesk-key-for-dev-change-in-prod` |
| `JWT_EXPIRES_IN` | Expiración del token | `1d` |
| `CORS_ORIGINS` | Orígenes extra permitidos, separados por coma (opcional) | — |

### 3. Base de datos local

```bash
docker compose up -d
npx prisma generate
npx prisma db push
npm run db:seed
```

Usuarios creados por el seed:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | `admin@helpdesk.com` | `Password123!` |
| Agente | `agent@helpdesk.com` | `Password123!` |
| Cliente | `customer@helpdesk.com` | `Password123!` |

### 4. Iniciar la API

```bash
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### 5. Iniciar el cliente web

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

Por defecto el cliente apunta a la API de producción. Para usar la API local, creá
`client/.env.local` con `VITE_API_BASE=http://localhost:3000`. `src/server.ts` ya permite
`localhost:5173`, `localhost:4173` y los previews de Vercel.

---

## 🧪 Pruebas y calidad

```bash
npm run lint     # lint
npm run test     # Vitest + Supertest
npm run build    # compilación de producción
```

En `client/`: `npm run build` ejecuta `tsc -b` + Vite, y `npm run lint` corre Oxlint.

---

## ☁️ Despliegue en Vercel (dos proyectos, un repo)

El repositorio se despliega como **dos proyectos independientes** que comparten el mismo
commit.

### Proyecto API

1. Importar el repositorio en Vercel y dejar **Root Directory** en la raíz.
2. Vercel detecta `api/index.ts` y compila con `npm run build`; `postinstall` ejecuta
   `prisma generate`.
3. Configurar `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y, si hace falta, `CORS_ORIGINS`.
4. `vercel.json` enruta todas las peticiones a la función serverless.

### Proyecto Cliente

1. Importar el mismo repositorio y fijar **Root Directory** en `client`.
2. Framework Preset **Vite**, **Output Directory** `dist`.
3. Variable opcional `VITE_API_BASE=https://help-desk-api-inky.vercel.app`.
4. `client/vercel.json` reescribe cualquier ruta a `/index.html` para que recargar
   `/login`, `/ticket/:id`, `/audit/:id` o `/users` no devuelva 404.

> Si cambiás el dominio del cliente, agregalo a los orígenes permitidos en `src/server.ts`
> o en `CORS_ORIGINS`.

---

## 📁 Estructura del repositorio

```
.
├─ api/                  # entrypoint serverless (Vercel)
├─ prisma/               # schema.prisma + seed
├─ src/
│  ├─ auth/              # JWT, guards, strategy
│  ├─ users/             # administración de cuentas
│  ├─ tickets/           # CRUD, estado y asignación
│  ├─ comments/          # hilo de conversación
│  ├─ audit/             # registro de eventos
│  ├─ common/            # decoradores, filtros, DTOs compartidos
│  ├─ app.module.ts
│  └─ server.ts          # bootstrap + CORS
├─ test/                 # unit tests
├─ client/               # frontend React + Vite (proyecto Vercel aparte)
│  ├─ src/{components,pages,auth,utils}
│  ├─ tailwind.config.js
│  └─ README.md
├─ docker-compose.yml
├─ vercel.json           # config del proyecto API
└─ README.md
```

---

## 🖋️ Nota sobre el frontend

La interfaz sigue una dirección **editorial / expediente**: papel cálido, tinta, reglas de
1px, sellos de estado y numeración monoespaciada, con tipografías **Fraunces** (títulos),
**IBM Plex Sans** (UI) e **IBM Plex Mono** (series, fechas, IDs). La asignación desde la UI
aparece sólo para ADMIN porque `GET /api/users` requiere ese rol.

Detalle completo en [`client/README.md`](client/README.md).

---

## 📄 Licencia

Proyecto desarrollado con fines educativos y de portfolio técnico, demostrando buenas
prácticas en NestJS, Prisma y React.
