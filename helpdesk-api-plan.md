# Plan de implementación — HelpDesk API

## Estado actual

El workspace `C:\Users\Veile\OneDrive\Documentos\proyectos\nestJsCv` solo contiene un `README.md` vacío. No hay aplicación NestJS, `package.json`, configuración TypeScript, Docker ni repositorio Git.

## Objetivo

Construir una API de gestión de tickets que sirva como proyecto de portfolio para un puesto NestJS Junior y permita demostrar:

- TypeScript y arquitectura modular de NestJS.
- PostgreSQL y Prisma con migraciones.
- Autenticación JWT y autorización por roles.
- Validación de DTOs, paginación y filtros.
- Reglas de negocio y control de acceso por recurso.
- Comentarios e historial de auditoría.
- Tests unitarios y e2e.
- Swagger, Docker y documentación reproducible.

Flujo principal del MVP:

> Cliente registra/loguea → crea un ticket → agente lo toma → se agregan comentarios → cambia el estado → queda auditoría.

## Alcance del MVP

### Incluido

- Usuarios con roles `customer`, `agent` y `admin`.
- Registro, login, endpoint de usuario actual y hash seguro de contraseñas.
- Tickets con título, descripción, estado, prioridad, creador y agente asignado.
- Listado paginado con filtros por estado, prioridad y asignación.
- Reglas de acceso por rol y por propietario del recurso.
- Comentarios asociados a tickets.
- Auditoría de creación, asignación, cambios de estado/prioridad y comentarios.
- PostgreSQL mediante Docker Compose.
- Prisma, migraciones y seed reproducible.
- Validación global, errores HTTP consistentes y Swagger.
- Tests unitarios de reglas de negocio y tests e2e de flujos críticos.
- README completo, `.env.example`, scripts y CI básica.

### Fuera de la primera versión

Emails, Redis/BullMQ, adjuntos, WebSockets, pagos, multitenancy, búsqueda full-text avanzada, microservicios y Kubernetes. Se podrán agregar después de cerrar y validar el MVP.

## Decisiones técnicas

- **Persistencia:** PostgreSQL.
- **ORM:** Prisma, por su esquema explícito y migraciones fáciles de revisar.
- **Auth:** JWT con Passport y `bcrypt` o `argon2`.
- **Validación:** `class-validator`, `class-transformer` y `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- **API:** prefijo `/api`, respuestas HTTP convencionales y Swagger/OpenAPI.
- **Tests:** Jest y Supertest; Prisma mockeado en unit tests y una base PostgreSQL dedicada para e2e.
- **Desarrollo:** la API se ejecuta localmente; Docker Compose provee inicialmente PostgreSQL.

## Estructura objetivo

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
prisma/
├── schema.prisma
└── seed.ts
test/
docker-compose.yml
.env.example
README.md
```

## Product backlog

### Épica 0 — Base del proyecto

1. Inicializar NestJS y Git.
2. Configurar lint, formato y scripts.
3. Configurar variables de entorno.
4. Agregar PostgreSQL con Docker Compose.
5. Integrar Prisma y health check básico.

### Épica 1 — Identidad y acceso

6. Crear modelo y seed de usuarios.
7. Implementar registro y login.
8. Implementar estrategia JWT y `/auth/me`.
9. Implementar `@Roles()` y `RolesGuard`.
10. Agregar endpoints administrativos mínimos de usuarios.

### Épica 2 — Tickets

11. Crear modelo de tickets y migración.
12. Crear y consultar tickets.
13. Agregar paginación y filtros.
14. Implementar cambios de estado, prioridad y asignación.
15. Aplicar autorización por rol y propietario.

### Épica 3 — Conversación y trazabilidad

16. Crear comentarios y sus permisos.
17. Crear `AuditLog` y registrar eventos importantes.
18. Exponer auditoría por ticket a agentes autorizados y administradores.

### Épica 4 — Calidad y entrega

19. Documentar endpoints y DTOs en Swagger.
20. Agregar unit tests de auth, tickets, comentarios y auditoría.
21. Agregar e2e de registro, login, permisos y flujo completo de ticket.
22. Completar README, seed, ejemplos y troubleshooting.
23. Agregar CI para lint, tests y build.
24. Preparar Dockerfile de producción solo si el MVP ya está estable.

## Secuencia de commits atómicos

Cada commit debe compilar o dejar explícitamente documentado qué prerrequisito falta. Antes de cada commit se ejecutan las validaciones afectadas.

1. `chore: initialize NestJS application`
2. `chore: configure linting and formatting`
3. `chore: add environment configuration`
4. `chore: add PostgreSQL development container`
5. `feat: integrate Prisma database client`
6. `feat: add user persistence model`
7. `feat: implement user authentication`
8. `feat: add JWT authentication and role guards`
9. `feat: add user management endpoints`
10. `feat: implement ticket creation and retrieval`
11. `feat: add ticket filtering and access rules`
12. `feat: support ticket status and assignment changes`
13. `feat: add ticket comments`
14. `feat: record ticket and comment audit events`
15. `docs: document API with Swagger`
16. `test: cover authentication rules`
17. `test: cover ticket business rules`
18. `test: cover comment and audit services`
19. `test: add authentication and ticket e2e flows`
20. `docs: document local setup and API usage`
21. `ci: validate application in GitHub Actions`

No se deben mezclar en un mismo commit una funcionalidad, un formateo masivo y cambios de infraestructura. Las migraciones ya aplicadas tampoco se editan: se crea una nueva migración.

## Reglas de autorización del MVP

- `customer`: crea tickets, consulta y comenta sus propios tickets.
- `agent`: consulta tickets operativos, cambia estado/prioridad, asigna según la política definida y comenta.
- `admin`: administra usuarios y tiene acceso completo.
- El rol no reemplaza la autorización por recurso: los servicios también verifican propietario, asignación y existencia.

## Endpoints objetivo

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id

POST   /api/tickets
GET    /api/tickets?page=1&limit=20&status=OPEN&priority=HIGH
GET    /api/tickets/:id
PATCH  /api/tickets/:id
PATCH  /api/tickets/:id/status
PATCH  /api/tickets/:id/assign

POST   /api/tickets/:ticketId/comments
GET    /api/tickets/:ticketId/comments
GET    /api/tickets/:ticketId/audit
```

## Verificación

### Por cada etapa

```text
npm run lint
npm run test
npm run build
```

Ejecutar tests e2e cuando estén disponibles:

```text
npm run test:e2e
```

### Antes de considerar terminado el MVP

- Levantar PostgreSQL desde cero con Docker Compose.
- Ejecutar migraciones y seed en una base vacía.
- Arrancar la API y verificar Swagger.
- Probar el flujo cliente → ticket → agente → comentario → cambio de estado → auditoría.
- Confirmar que un cliente no puede leer ni modificar tickets ajenos.
- Confirmar que las credenciales solo existen en `.env` local y `.env.example` no contiene secretos.
- Ejecutar lint, unit tests, e2e y build en una instalación limpia.
- Revisar que README permita a otra persona ejecutar el proyecto sin contexto adicional.

## Primer paso de implementación

Inicializar la aplicación NestJS en el workspace, crear el repositorio Git y dejar el primer commit funcional antes de agregar base de datos o lógica de dominio.

