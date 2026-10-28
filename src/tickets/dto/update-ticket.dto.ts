import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

export class UpdateTicketDto {
  @ApiProperty({
    example: 'Error actualizado: no puedo exportar reportes en PDF',
    required: false,
    minLength: 5,
    description: 'Nuevo título del ticket',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @ApiProperty({
    example:
      'Actualización: el error también ocurre en Chrome 110 al exportar reportes.',
    required: false,
    minLength: 10,
    description: 'Nueva descripción del problema',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({
    enum: TicketPriority,
    enumName: 'TicketPriority',
    required: false,
    description: 'Nueva prioridad del ticket (solo agentes y admins)',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({
    enum: TicketStatus,
    enumName: 'TicketStatus',
    required: false,
    description: 'Nuevo estado del ticket (solo agentes y admins)',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
