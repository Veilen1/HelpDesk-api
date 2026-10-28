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
    description: 'Nuevo correo electrónico del usuario',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email?: string;

  @ApiProperty({
    example: 'Carlos Rodríguez',
    required: false,
    minLength: 2,
    description: 'Nuevo nombre completo',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    required: false,
    description: 'Nuevo rol del usuario. Solo admins pueden cambiar roles.',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol especificado no es válido' })
  role?: Role;

  @ApiProperty({
    example: 'NuevaContrasena123!',
    required: false,
    minLength: 6,
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;
}
