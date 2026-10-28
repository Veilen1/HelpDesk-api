import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    example: 'nuevo@ejemplo.com',
    required: false,
    description: 'Nuevo correo electrónico',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email?: string;

  @ApiProperty({
    example: 'NuevoNombre',
    required: false,
    description: 'Nuevo nombre',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @ApiProperty({
    enum: Role,
    required: false,
    description: 'Nuevo rol del usuario',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol especificado no es válido' })
  role?: Role;

  @ApiProperty({
    example: 'NuevaContrasena123!',
    required: false,
    description: 'Nueva contraseña',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
}
