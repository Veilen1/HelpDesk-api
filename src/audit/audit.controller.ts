import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/tickets/:ticketId/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.AGENT, Role.ADMIN)
  @ApiOperation({
    summary: 'Consultar el historial de auditoría de un ticket (Solo Agentes y Admins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de auditoría completo del ticket',
  })
  @ApiResponse({ status: 403, description: 'Requiere rol AGENT o ADMIN' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.auditService.findByTicket(ticketId);
  }
}
