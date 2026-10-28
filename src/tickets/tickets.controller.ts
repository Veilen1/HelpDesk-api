import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { AssignTicketDto } from './dto/assign-ticket.dto.js';
import { QueryTicketsDto } from './dto/query-tickets.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator.js';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo ticket de soporte' })
  @ApiResponse({ status: 201, description: 'Ticket creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar tickets con paginación y filtros (Clientes ven solo sus tickets, Agentes y Admins ven todos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de tickets con metadatos de paginación',
  })
  findAll(
    @Query() query: QueryTicketsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un ticket por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del ticket' })
  @ApiResponse({ status: 403, description: 'No autorizado para ver este ticket' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información del ticket' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado' })
  @ApiResponse({ status: 400, description: 'Modificación inválida o ticket no abierto' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Cambiar el estado de un ticket (Solo Agentes y Admins)',
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 403, description: 'Requiere rol AGENT o ADMIN' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.updateStatus(id, dto, user);
  }

  @Patch(':id/assign')
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Asignar un ticket a un agente (Solo Agentes y Admins)',
  })
  @ApiResponse({ status: 200, description: 'Ticket asignado exitosamente' })
  @ApiResponse({ status: 403, description: 'Requiere rol AGENT o ADMIN' })
  assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketsService.assign(id, dto, user);
  }
}
