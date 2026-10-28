# HelpDesk API

API REST para gestionar tickets de soporte, construida con NestJS como proyecto de portfolio para demostrar buenas prácticas de backend con TypeScript.

> Estado actual: Preparado para despliegue en Vercel, Swagger integrado y PostgreSQL configurado en Docker Compose.

## Objetivo del proyecto

El flujo principal del producto será:

1. Un cliente se registra e inicia sesión.
2. Crea un ticket de soporte.
3. Un agente revisa, toma y actualiza el ticket.
4. Cliente y agente intercambian comentarios.
5. Los cambios importantes quedan registrados en una auditoría.

## Stack

- [NestJS](https://nestjs.com/)
- TypeScript
- PostgreSQL & Prisma ORM
- JWT y Passport
- Swagger / OpenAPI
- Vitest y Supertest
- Docker Compose para el entorno local
- Despliegue serverless en Vercel

## Alcance del MVP

- Autenticación con registro, login y JWT.
- Roles `customer`, `agent` y `admin`.
- Tickets con estados, prioridades y asignaciones.
- Paginación y filtros.
- Comentarios asociados a tickets.
- Reglas de autorización por rol y por propietario.
- Auditoría de cambios relevantes.
- Validación de entrada, documentación interactiva Swagger y tests.

Las notificaciones por email, Redis, adjuntos, WebSockets, microservicios y Kubernetes quedan fuera de la primera versión para mantener un alcance realista y entregar un MVP sólido.

## Estructura

```text
api/
└── index.ts        # Entrypoint serverless para Vercel
src/
├── auth/           # Autenticación y JWT
├── users/          # Gestión de usuarios
├── tickets/        # Ciclo de vida de tickets
├── comments/       # Comentarios
├── audit/          # Auditoría de eventos
├── prisma/         # Servicio de base de datos
├── config/         # Validación de entorno
├── server.ts       # Bootstrap y configuración Swagger/Pipes
└── main.ts         # Entrypoint local
prisma/
└── schema.prisma   # Esquema de datos PostgreSQL
vercel.json         # Configuración de despliegue en Vercel
docker-compose.yml  # PostgreSQL para desarrollo local
```

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Docker y Docker Compose para PostgreSQL local.

## Instalación

```bash
npm install
```

Copiar `.env.example` como `.env` para configurar el entorno local:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto HTTP de la API | `3000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public` |

### Base de datos local (Docker Compose)

Para iniciar el contenedor de PostgreSQL de desarrollo:

```bash
docker compose up -d
```

Para detener el contenedor:

```bash
docker compose down
```

### Despliegue en Vercel

El proyecto está preparado para ejecutarse como función serverless en [Vercel](https://vercel.com):

1. Conectar el repositorio de GitHub `Veilen1/HelpDesk-api` en el panel de Vercel (**Add New** -> **Project**).
2. Vercel detecta automáticamente `vercel.json` y compila la función en `api/index.ts`.
3. (Opcional) En **Settings > Environment Variables**, configurar `DATABASE_URL` si se utiliza una base de datos PostgreSQL remota (ej. Neon, Supabase, Render).
4. Al desplegar:
   - Raíz: `GET /` muestra el estado online y metadatos de la API.
   - Documentación Swagger: `GET /docs` o `GET /api/docs`.

## Comandos disponibles

```bash
# Desarrollo
npm run start:dev

# Compilar
npm run build

# Calidad
npm run lint

# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## Licencia

Este proyecto se publica con fines educativos y de portfolio.
