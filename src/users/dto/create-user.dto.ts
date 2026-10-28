import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail({}, { message: 'El formato de email no es válido' })
  email!: string;

  @ApiProperty({
    example: 'Contrasena123!',
    minLength: 6,
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;

  @ApiProperty({
    enum: Role,
    default: Role.CUSTOMER,
    required: false,
    description: 'Rol asignado al usuario',
  })
  @IsOptional()
  @IsEnum(Role, { message: 'El rol especificado no es válido' })
  role?: Role;
}
