import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import {
  Role,
  TicketStatus,
  TicketPriority,
  AuditAction,
} from '@prisma/client';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('HelpDesk API End-to-End Flows (e2e)', () => {
  let app: INestApplication;

  const inMemoryDb = {
    users: new Map<string, any>(),
    tickets: new Map<string, any>(),
    comments: [] as any[],
    auditLogs: [] as any[],
  };

  const mockPrismaService = {
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => [1],
    user: {
      findUnique: async ({ where }: any) => {
        if (where.email) {
          for (const u of inMemoryDb.users.values()) {
            if (u.email === where.email) return u;
          }
        }
        if (where.id) {
          return inMemoryDb.users.get(where.id) || null;
        }
        return null;
      },
      create: async ({ data, select }: any) => {
        const id = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const record = {
          id,
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role || Role.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDb.users.set(id, record);
        if (select) {
          const res: any = {};
          for (const key of Object.keys(select)) {
            res[key] = record[key as keyof typeof record];
          }
          return res;
        }
        return record;
      },
      findMany: async () => Array.from(inMemoryDb.users.values()),
      update: async ({ where, data }: any) => {
        const user = inMemoryDb.users.get(where.id);
        if (user) {
          Object.assign(user, data, { updatedAt: new Date() });
        }
        return user;
      },
    },
    ticket: {
      create: async ({ data }: any) => {
        const id = `ticket-${Date.now()}`;
        const record = {
          id,
          title: data.title,
          description: data.description,
          priority: data.priority || TicketPriority.MEDIUM,
          status: data.status || TicketStatus.OPEN,
          creatorId: data.creatorId,
          assignedToId: data.assignedToId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          creator: inMemoryDb.users.get(data.creatorId),
          assignedTo: data.assignedToId
            ? inMemoryDb.users.get(data.assignedToId)
            : null,
          _count: { comments: 0 },
        };
        inMemoryDb.tickets.set(id, record);
        return record;
      },
      findUnique: async ({ where }: any) => {
        const ticket = inMemoryDb.tickets.get(where.id);
        if (!ticket) return null;
        return {
          ...ticket,
          creator: inMemoryDb.users.get(ticket.creatorId),
          assignedTo: ticket.assignedToId
            ? inMemoryDb.users.get(ticket.assignedToId)
            : null,
          _count: { comments: inMemoryDb.comments.filter((c) => c.ticketId === ticket.id).length },
        };
      },
      findMany: async ({ where, skip = 0, take = 20 }: any) => {
        let all = Array.from(inMemoryDb.tickets.values());
        if (where?.creatorId) {
          all = all.filter((t) => t.creatorId === where.creatorId);
        }
        if (where?.status) {
          all = all.filter((t) => t.status === where.status);
        }
        return all.slice(skip, skip + take);
      },
      count: async ({ where }: any) => {
        let all = Array.from(inMemoryDb.tickets.values());
        if (where?.creatorId) {
          all = all.filter((t) => t.creatorId === where.creatorId);
        }
        return all.length;
      },
      update: async ({ where, data }: any) => {
        const ticket = inMemoryDb.tickets.get(where.id);
        if (ticket) {
          Object.assign(ticket, data, { updatedAt: new Date() });
        }
        return ticket;
      },
    },
    comment: {
      create: async ({ data }: any) => {
        const record = {
          id: `comment-${Date.now()}`,
          ticketId: data.ticketId,
          authorId: data.authorId,
          content: data.content,
          createdAt: new Date(),
          author: inMemoryDb.users.get(data.authorId),
        };
        inMemoryDb.comments.push(record);
        return record;
      },
      findMany: async ({ where }: any) => {
        return inMemoryDb.comments
          .filter((c) => c.ticketId === where.ticketId)
          .map((c) => ({
            ...c,
            author: inMemoryDb.users.get(c.authorId),
          }));
      },
    },
    auditLog: {
      create: async ({ data }: any) => {
        const record = {
          id: `audit-${Date.now()}`,
          ticketId: data.ticketId,
          userId: data.userId,
          action: data.action,
          details: data.details,
          createdAt: new Date(),
        };
        inMemoryDb.auditLogs.push(record);
        return record;
      },
      findMany: async ({ where }: any) => {
        return inMemoryDb.auditLogs
          .filter((a) => a.ticketId === where.ticketId)
          .map((a) => ({
            ...a,
            user: inMemoryDb.users.get(a.userId),
          }));
      },
    },
  };

  let customerToken: string;
  let customerUser: any;
  let agentToken: string;
  let createdTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Pre-populate an Agent user in inMemoryDb
    const agentPassword = await bcrypt.hash('AgentPass123!', 10);
    const agentId = 'agent-seed-id';
    inMemoryDb.users.set(agentId, {
      id: agentId,
      email: 'agent@helpdesk.com',
      password: agentPassword,
      name: 'Support Agent',
      role: Role.AGENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. POST /api/auth/register should create a customer and return accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'customer@test.com',
        password: 'Password123!',
        name: 'John Customer',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toMatchObject({
      email: 'customer@test.com',
      name: 'John Customer',
      role: Role.CUSTOMER,
    });

    customerToken = res.body.accessToken;
    customerUser = res.body.user;
  });

  it('2. POST /api/auth/login should authenticate registered customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'Password123!',
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('customer@test.com');
  });

  it('3. POST /api/auth/login with invalid password should return 401', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('4. GET /api/auth/me should return current user profile with token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.id).toBe(customerUser.id);
    expect(res.body.email).toBe(customerUser.email);
  });

  it('5. GET /api/auth/me should return 401 without token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('6. POST /api/auth/login as Agent to acquire agent token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'agent@helpdesk.com',
        password: 'AgentPass123!',
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.role).toBe(Role.AGENT);
    agentToken = res.body.accessToken;
  });

  it('7. POST /api/tickets should create a new support ticket as Customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'No puedo ver mis facturas',
        description: 'La sección de facturación arroja error 500 al hacer clic.',
        priority: TicketPriority.HIGH,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('No puedo ver mis facturas');
    expect(res.body.status).toBe(TicketStatus.OPEN);
    expect(res.body.priority).toBe(TicketPriority.HIGH);
    expect(res.body.creatorId).toBe(customerUser.id);

    createdTicketId = res.body.id;
  });

  it('8. GET /api/tickets should list customer tickets', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdTicketId);
  });

  it('9. POST /api/tickets/:id/comments should add a comment to ticket', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        content: 'Adjunto mensaje: el error ocurre solo desde Firefox.',
      })
      .expect(201);

    expect(res.body.content).toBe(
      'Adjunto mensaje: el error ocurre solo desde Firefox.',
    );
    expect(res.body.ticketId).toBe(createdTicketId);
  });

  it('10. PATCH /api/tickets/:id/status as Agent should update ticket status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        status: TicketStatus.IN_PROGRESS,
      })
      .expect(200);

    expect(res.body.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it('11. PATCH /api/tickets/:id/status as Customer should return 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .patch(`/api/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: TicketStatus.CLOSED,
      })
      .expect(403);
  });

  it('12. GET /api/tickets/:id/audit as Agent should return audit log history', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/tickets/${createdTicketId}/audit`)
      .set('Authorization', `Bearer ${agentToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const actions = res.body.map((a: any) => a.action);
    expect(actions).toContain(AuditAction.CREATED);
    expect(actions).toContain(AuditAction.COMMENT_ADDED);
    expect(actions).toContain(AuditAction.STATUS_CHANGED);
  });

  it('13. GET /api/tickets/:id/audit as Customer should return 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .get(`/api/tickets/${createdTicketId}/audit`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});

