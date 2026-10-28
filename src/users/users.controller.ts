import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios (Solo Administradores)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios registrados' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un usuario por ID (Admin o usuario propio)',
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para ver este usuario',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permisos para consultar la información de otro usuario.',
      );
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un usuario por ID (Admin o usuario propio)',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para modificar este usuario o su rol',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permisos para modificar la información de otro usuario.',
      );
    }

    if (dto.role && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo los administradores pueden cambiar roles de usuario.',
      );
    }

    return this.usersService.update(id, dto);
  }
}
