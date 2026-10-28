import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  Role,
  TicketStatus,
  TicketPriority,
  AuditAction,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { AssignTicketDto } from './dto/assign-ticket.dto.js';
import { QueryTicketsDto } from './dto/query-tickets.dto.js';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

export const TICKET_INCLUDE = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} as const;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateTicketDto, user: AuthenticatedUser) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        creatorId: user.id,
      },
      include: TICKET_INCLUDE,
    });

    await this.auditService.record(
      ticket.id,
      AuditAction.CREATED,
      user.id,
      `Ticket creado con prioridad ${ticket.priority}`,
    );

    return ticket;
  }

  async findAll(query: QueryTicketsDto, user: AuthenticatedUser) {
    const { page, limit, status, priority, assignedToId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {};

    if (user.role === Role.CUSTOMER) {
      where.creatorId = user.id;
    } else {
      if (assignedToId) where.assignedToId = assignedToId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [total, data] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: TICKET_INCLUDE,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: TICKET_INCLUDE,
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID "${id}" no encontrado.`);
    }

    if (user.role === Role.CUSTOMER && ticket.creatorId !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para consultar este ticket.',
      );
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, user: AuthenticatedUser) {
    const ticket = await this.findOne(id, user);

    if (user.role === Role.CUSTOMER) {
      if (ticket.status !== TicketStatus.OPEN) {
        throw new BadRequestException(
          'Solo se pueden editar tickets que se encuentren en estado ABIERTO.',
        );
      }
      if (dto.status || dto.priority) {
        throw new ForbiddenException(
          'Los clientes no pueden modificar el estado ni la prioridad del ticket.',
        );
      }
    }

    const data: Prisma.TicketUpdateInput = {};
    if (dto.title) data.title = dto.title;
    if (dto.description) data.description = dto.description;
    if (dto.priority) data.priority = dto.priority;
    if (dto.status) data.status = dto.status;

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: TICKET_INCLUDE,
    });

    if (dto.priority && dto.priority !== ticket.priority) {
      await this.auditService.record(
        id,
        AuditAction.PRIORITY_CHANGED,
        user.id,
        `Prioridad cambiada de ${ticket.priority} a ${dto.priority}`,
      );
    }

    if (dto.status && dto.status !== ticket.status) {
      await this.auditService.record(
        id,
        AuditAction.STATUS_CHANGED,
        user.id,
        `Estado cambiado de ${ticket.status} a ${dto.status}`,
      );
    }

    return updated;
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    user: AuthenticatedUser,
  ) {
    const ticket = await this.findOne(id, user);

    if (ticket.status === dto.status) {
      return ticket;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: dto.status },
      include: TICKET_INCLUDE,
    });

    await this.auditService.record(
      id,
      AuditAction.STATUS_CHANGED,
      user.id,
      `Estado actualizado de ${ticket.status} a ${dto.status}`,
    );

    return updated;
  }

  async assign(id: string, dto: AssignTicketDto, user: AuthenticatedUser) {
    await this.findOne(id, user);

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.assignedToId },
    });

    if (!targetUser) {
      throw new NotFoundException(
        `El usuario asignado con ID "${dto.assignedToId}" no existe.`,
      );
    }

    if (targetUser.role !== Role.AGENT && targetUser.role !== Role.ADMIN) {
      throw new BadRequestException(
        'Solo se puede asignar un ticket a un agente o administrador.',
      );
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { assignedToId: targetUser.id },
      include: TICKET_INCLUDE,
    });

    await this.auditService.record(
      id,
      AuditAction.ASSIGNED,
      user.id,
      `Ticket asignado a ${targetUser.name} (${targetUser.email})`,
    );

    return updated;
  }
}
