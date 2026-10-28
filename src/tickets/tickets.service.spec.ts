import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, TicketStatus, TicketPriority, AuditAction } from '@prisma/client';
import { TicketsService } from './tickets.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

describe('TicketsService', () => {
  let service: TicketsService;
  let prismaMock: {
    ticket: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let auditServiceMock: {
    record: ReturnType<typeof vi.fn>;
  };

  const customerUser: AuthenticatedUser = {
    id: 'customer-1',
    email: 'customer@example.com',
    name: 'Customer One',
    role: Role.CUSTOMER,
  };

  const agentUser: AuthenticatedUser = {
    id: 'agent-1',
    email: 'agent@example.com',
    name: 'Agent One',
    role: Role.AGENT,
  };

  beforeEach(async () => {
    prismaMock = {
      ticket: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    auditServiceMock = {
      record: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditServiceMock },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  describe('create', () => {
    it('should create a ticket for customer and record audit log', async () => {
      const createdTicket = {
        id: 'ticket-1',
        title: 'Error de login',
        description: 'No puedo acceder',
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        creatorId: customerUser.id,
      };

      prismaMock.ticket.create.mockResolvedValue(createdTicket);

      const result = await service.create(
        {
          title: 'Error de login',
          description: 'No puedo acceder',
          priority: TicketPriority.HIGH,
        },
        customerUser,
      );

      expect(prismaMock.ticket.create).toHaveBeenCalledWith({
        data: {
          title: 'Error de login',
          description: 'No puedo acceder',
          priority: TicketPriority.HIGH,
          status: TicketStatus.OPEN,
          creatorId: customerUser.id,
        },
        include: expect.any(Object),
      });

      expect(auditServiceMock.record).toHaveBeenCalledWith(
        'ticket-1',
        AuditAction.CREATED,
        customerUser.id,
        expect.any(String),
      );

      expect(result).toEqual(createdTicket);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if ticket does not exist', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent', customerUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if customer attempts to view another ticket', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-2',
        creatorId: 'other-customer',
      });

      await expect(service.findOne('ticket-2', customerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow agent to view any ticket', async () => {
      const ticket = {
        id: 'ticket-2',
        creatorId: 'other-customer',
        title: 'Other ticket',
      };
      prismaMock.ticket.findUnique.mockResolvedValue(ticket);

      const result = await service.findOne('ticket-2', agentUser);
      expect(result).toEqual(ticket);
    });
  });

  describe('updateStatus', () => {
    it('should update status and record audit log', async () => {
      const existingTicket = {
        id: 'ticket-1',
        status: TicketStatus.OPEN,
        creatorId: customerUser.id,
      };

      const updatedTicket = {
        ...existingTicket,
        status: TicketStatus.IN_PROGRESS,
      };

      prismaMock.ticket.findUnique.mockResolvedValue(existingTicket);
      prismaMock.ticket.update.mockResolvedValue(updatedTicket);

      const result = await service.updateStatus(
        'ticket-1',
        { status: TicketStatus.IN_PROGRESS },
        agentUser,
      );

      expect(prismaMock.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { status: TicketStatus.IN_PROGRESS },
        include: expect.any(Object),
      });

      expect(auditServiceMock.record).toHaveBeenCalledWith(
        'ticket-1',
        AuditAction.STATUS_CHANGED,
        agentUser.id,
        expect.stringContaining('IN_PROGRESS'),
      );

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });
  });
});
