import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({
    example: 'Error al iniciar sesión',
    description: 'Título del ticket',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  title!: string;

  @ApiProperty({
    example: 'Aparece un error 500 al enviar el formulario de login',
    description: 'Descripción detallada del problema',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description!: string;

  @ApiProperty({
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
    required: false,
    description: 'Prioridad del ticket',
  })
  @IsOptional()
  @IsEnum(TicketPriority, { message: 'Prioridad no válida' })
  priority?: TicketPriority;
}
