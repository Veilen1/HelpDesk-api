# HelpDesk API

API REST para gestionar tickets de soporte, construida con NestJS como proyecto de portfolio para demostrar buenas prácticas de backend con TypeScript.

> Estado actual: PostgreSQL configurado mediante Docker Compose y variables de entorno validadas.

## Objetivo del proyecto

El flujo principal del producto será:

1. Un cliente se registra e inicia sesión.
2. Crea un ticket de soporte.
3. Un agente revisa, toma y actualiza el ticket.
4. Cliente y agente intercambian comentarios.
5. Los cambios importantes quedan registrados en una auditoría.

## Stack planificado

- [NestJS](https://nestjs.com/)
- TypeScript
- PostgreSQL
- Prisma
- JWT y Passport
- Swagger / OpenAPI
- Jest / Vitest y Supertest
- Docker Compose para el entorno local

## Alcance del MVP

- Autenticación con registro, login y JWT.
- Roles `customer`, `agent` y `admin`.
- Tickets con estados, prioridades y asignaciones.
- Paginación y filtros.
- Comentarios asociados a tickets.
- Reglas de autorización por rol y por propietario.
- Auditoría de cambios relevantes.
- Validación de entrada, documentación y tests.

Las notificaciones por email, Redis, adjuntos, WebSockets, microservicios y Kubernetes quedan fuera de la primera versión para mantener un alcance realista y entregar un MVP sólido.

## Estructura esperada

```text
src/
├── auth/
├── users/
├── tickets/
├── comments/
├── audit/
├── prisma/
├── config/
├── common/
└── main.ts
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

## Roadmap

- [x] Inicializar aplicación NestJS.
- [x] Configurar scripts base, lint y tests.
- [x] Configurar variables de entorno.
- [x] Agregar PostgreSQL con Docker Compose.
- [ ] Integrar Prisma y migraciones.
- [ ] Implementar usuarios y autenticación.
- [ ] Implementar roles y autorización.
- [ ] Implementar tickets, filtros y paginación.
- [ ] Implementar comentarios.
- [ ] Implementar auditoría.
- [ ] Documentar la API con Swagger.
- [ ] Agregar tests unitarios y e2e del flujo completo.
- [ ] Agregar CI.

## Decisiones de diseño

El proyecto prioriza un monolito modular antes que microservicios. Cada módulo representa una capacidad del dominio y las reglas de autorización se validarán en los servicios, no únicamente en guards de roles. Las migraciones de base de datos serán versionadas y reproducibles.

## Licencia

Este proyecto se publica con fines educativos y de portfolio.
