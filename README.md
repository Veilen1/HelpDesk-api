# HelpDesk API

API REST profesional para gestión de tickets de soporte técnico, construida con **NestJS**, **TypeScript**, **PostgreSQL** y **Prisma ORM**.

> **Despliegue en producción:** [https://help-desk-api-rho.vercel.app/](https://help-desk-api-rho.vercel.app/)  
> **Documentación interactiva Swagger:** [https://help-desk-api-rho.vercel.app/docs](https://help-desk-api-rho.vercel.app/docs)

---

## 🎯 Objetivo del proyecto

El flujo principal del producto modela el ciclo completo de soporte al cliente:

1. **Cliente:** Se registra, inicia sesión y crea un ticket con su incidencia.
2. **Agente:** Consulta los tickets entrantes, los toma/asigna, actualiza el estado y responde comentarios.
3. **Conversación:** Cliente y agente intercambian comentarios en el hilo del ticket.
4. **Trazabilidad:** Cada cambio relevante (creación, cambio de estado, prioridad, asignación y comentarios) queda registrado en una auditoría inmutable (`AuditLog`).

---

## 🛠️ Stack tecnológico

- **Framework:** [NestJS 12](https://nestjs.com/) (Arquitectura modular, inyección de dependencias, guards y pipes)
- **Lenguaje:** TypeScript (ESM)
- **Base de datos:** PostgreSQL
- **ORM:** [Prisma ORM](https://www.prisma.io/) con migraciones y tipado fuerte
- **Autenticación & Autorización:** Passport JWT, hash seguro con `bcryptjs`, decorators `@Roles()` y `RolesGuard`
- **Validación:** `class-validator` y `class-transformer` con `ValidationPipe` global
- **Documentación:** Swagger / OpenAPI interactivo con soporte CDN para serverless
- **Testing:** Vitest y Supertest (unit tests de reglas de negocio)
- **Infraestructura:** Docker Compose para desarrollo local y Vercel Serverless Functions para producción
- **Integración Continua:** GitHub Actions CI (lint, tests y build)

---

## 🔐 Matriz de permisos y autorización

| Funcionalidad | Customer | Agent | Admin |
| --- | :---: | :---: | :---: |
| Crear tickets | ✅ | ✅ | ✅ |
| Ver tickets propios | ✅ | ✅ | ✅ |
| Listar todos los tickets del sistema | ❌ | ✅ | ✅ |
| Modificar estado / prioridad de ticket | ❌ | ✅ | ✅ |
| Asignar ticket a agente | ❌ | ✅ | ✅ |
| Comentar en ticket propio | ✅ | ✅ | ✅ |
| Comentar en tickets ajenos | ❌ | ✅ | ✅ |
| Ver historial de auditoría de ticket | ❌ | ✅ | ✅ |
| Listar y administrar usuarios | ❌ | ❌ | ✅ |

---

## 📡 Endpoints principales

### Autenticación
- `POST /api/auth/register` - Registro público de nuevos clientes
- `POST /api/auth/login` - Inicio de sesión y generación de Bearer JWT
- `GET /api/auth/me` - Perfil del usuario autenticado actual

### Usuarios (Gestión Administrativa)
- `GET /api/users` - Listar todos los usuarios (`ADMIN`)
- `GET /api/users/:id` - Consultar usuario (`ADMIN` o propio)
- `PATCH /api/users/:id` - Actualizar usuario o rol (`ADMIN` o propio)

### Tickets
- `POST /api/tickets` - Crear ticket de soporte
- `GET /api/tickets` - Listar tickets con paginación (`page`, `limit`) y filtros (`status`, `priority`, `assignedToId`)
- `GET /api/tickets/:id` - Detalle de un ticket
- `PATCH /api/tickets/:id` - Actualizar información del ticket
- `PATCH /api/tickets/:id/status` - Modificar estado (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) (`AGENT`, `ADMIN`)
- `PATCH /api/tickets/:id/assign` - Asignar ticket a un agente (`AGENT`, `ADMIN`)

### Comentarios y Auditoría
- `POST /api/tickets/:ticketId/comments` - Agregar comentario al ticket
- `GET /api/tickets/:ticketId/comments` - Listar comentarios del ticket
- `GET /api/tickets/:ticketId/audit` - Historial de eventos y auditoría (`AGENT`, `ADMIN`)

---

## 🚀 Instalación y ejecución local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Veilen1/HelpDesk-api.git
cd HelpDesk-api
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` como `.env`:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución (`development`, `test`, `production`) | `development` |
| `PORT` | Puerto HTTP de la API | `3000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `super-secret-helpdesk-key-for-dev-change-in-prod` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `1d` |

### 3. Iniciar la base de datos local (Docker Compose)

```bash
docker compose up -d
```

### 4. Generar cliente y poblar datos iniciales (Seed)

```bash
# Generar tipos de Prisma
npx prisma generate

# Sincronizar esquema con la base de datos
npx prisma db push

# Poblar usuarios y tickets de prueba
npm run db:seed
```

#### Usuarios de prueba generados por el seed:
- **Admin:** `admin@helpdesk.com` / `Password123!`
- **Agente:** `agent@helpdesk.com` / `Password123!`
- **Cliente:** `customer@helpdesk.com` / `Password123!`

### 5. Iniciar la API

```bash
npm run start:dev
```

- API local: `http://localhost:3000`
- Swagger UI local: `http://localhost:3000/docs`

---

## 🧪 Pruebas y calidad de código

```bash
# Validación de linter y tipado estricto
npm run lint

# Ejecutar suite de tests unitarios (Vitest)
npm run test

# Compilación de producción
npm run build
```

---

## ☁️ Despliegue en Vercel

El proyecto cuenta con un adaptador serverless (`api/index.ts`) y configuración `vercel.json`:

1. Conectar el repositorio de GitHub `Veilen1/HelpDesk-api` en el dashboard de Vercel.
2. Vercel detecta automáticamente la función serverless y compila con `npm run build`.
3. El comando `postinstall: prisma generate` genera el cliente Prisma automáticamente en el entorno de construcción.
4. Para la base de datos en la nube, se integra con **Prisma Postgres** o cualquier proveedor PostgreSQL (Neon, Supabase).

---

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos y de portfolio técnico demostrando buenas prácticas de desarrollo backend en NestJS.
