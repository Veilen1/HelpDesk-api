import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, AuditAction } from '@prisma/client';
import { CommentsService } from './comments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaMock: {
    ticket: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    comment: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    prismaMock = {
      ticket: {
        findUnique: vi.fn(),
      },
      comment: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    auditServiceMock = {
      record: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: auditServiceMock },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    it('should throw NotFoundException if ticket does not exist', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.create('ticket-x', { content: 'Test' }, customerUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if customer tries to comment on another ticket', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        creatorId: 'different-customer',
      });

      await expect(
        service.create('ticket-1', { content: 'Test' }, customerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create comment and log audit event when valid', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        creatorId: customerUser.id,
      });

      const mockComment = {
        id: 'comment-1',
        ticketId: 'ticket-1',
        content: 'Mi respuesta',
        authorId: customerUser.id,
      };

      prismaMock.comment.create.mockResolvedValue(mockComment);

      const result = await service.create(
        'ticket-1',
        { content: 'Mi respuesta' },
        customerUser,
      );

      expect(prismaMock.comment.create).toHaveBeenCalled();
      expect(auditServiceMock.record).toHaveBeenCalledWith(
        'ticket-1',
        AuditAction.COMMENT_ADDED,
        customerUser.id,
        expect.any(String),
      );
      expect(result).toEqual(mockComment);
    });
  });
});
