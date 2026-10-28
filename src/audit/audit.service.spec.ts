import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditAction } from '@prisma/client';
import { AuditService } from './audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AuditService', () => {
  let service: AuditService;
  let prismaMock: {
    auditLog: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('record', () => {
    it('should create an audit log entry', async () => {
      const mockLog = {
        id: 'audit-1',
        ticketId: 'ticket-1',
        action: AuditAction.CREATED,
        userId: 'user-1',
        details: 'Detalle',
        createdAt: new Date(),
      };

      prismaMock.auditLog.create.mockResolvedValue(mockLog);

      const result = await service.record(
        'ticket-1',
        AuditAction.CREATED,
        'user-1',
        'Detalle',
      );

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
        data: {
          ticketId: 'ticket-1',
          action: AuditAction.CREATED,
          userId: 'user-1',
          details: 'Detalle',
        },
      });
      expect(result).toEqual(mockLog);
    });
  });

  describe('findByTicket', () => {
    it('should find all audit logs for a ticket ordered by desc', async () => {
      const mockLogs = [
        { id: '1', ticketId: 'ticket-1', action: AuditAction.STATUS_CHANGED },
        { id: '2', ticketId: 'ticket-1', action: AuditAction.CREATED },
      ];

      prismaMock.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.findByTicket('ticket-1');
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
        where: { ticketId: 'ticket-1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockLogs);
    });
  });
});
