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
    example: 'Error al iniciar sesión en el panel',
    minLength: 5,
    description: 'Título descriptivo del problema',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  title!: string;

  @ApiProperty({
    example:
      'Al hacer clic en "Iniciar sesión" aparece un error 500. Ocurre solo con Firefox 110.',
    minLength: 10,
    description: 'Descripción detallada del problema o solicitud',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description!: string;

  @ApiProperty({
    enum: TicketPriority,
    enumName: 'TicketPriority',
    default: TicketPriority.MEDIUM,
    required: false,
    description:
      'Nivel de urgencia: LOW (baja), MEDIUM (media), HIGH (alta), URGENT (urgente)',
  })
  @IsOptional()
  @IsEnum(TicketPriority, { message: 'Prioridad no válida' })
  priority?: TicketPriority;
}
