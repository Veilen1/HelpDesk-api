import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar un comentario a un ticket' })
  @ApiResponse({ status: 201, description: 'Comentario agregado con éxito' })
  @ApiResponse({ status: 403, description: 'No autorizado para comentar este ticket' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  create(
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.create(ticketId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener los comentarios asociados a un ticket' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios ordenados cronológicamente' })
  @ApiResponse({ status: 403, description: 'No autorizado para ver comentarios de este ticket' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  findByTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.commentsService.findByTicket(ticketId, user);
  }
}
