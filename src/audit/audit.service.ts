import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    ticketId: string,
    action: AuditAction,
    userId?: string,
    details?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        ticketId,
        userId,
        action,
        details,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.auditLog.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
