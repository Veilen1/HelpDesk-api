import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Role, AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    ticketId: string,
    dto: CreateCommentDto,
    user: AuthenticatedUser,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID "${ticketId}" no encontrado.`,
      );
    }

    if (user.role === Role.CUSTOMER && ticket.creatorId !== user.id) {
      throw new ForbiddenException(
        'No puedes agregar comentarios a tickets ajenos.',
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        ticketId,
        authorId: user.id,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await this.auditService.record(
      ticketId,
      AuditAction.COMMENT_ADDED,
      user.id,
      `Comentario agregado por ${user.name}`,
    );

    return comment;
  }

  async findByTicket(ticketId: string, user: AuthenticatedUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID "${ticketId}" no encontrado.`,
      );
    }

    if (user.role === Role.CUSTOMER && ticket.creatorId !== user.id) {
      throw new ForbiddenException(
        'No puedes consultar los comentarios de tickets ajenos.',
      );
    }

    return this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
